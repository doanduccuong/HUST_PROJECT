package handler

import (
	"log"
	"net/http"

	"face_recognition_be/internal/app/dto"
	"face_recognition_be/internal/app/service"

	"github.com/gorilla/websocket"
)

type WSDetectHandler struct {
	detector *service.ONNXDetector
	upgrader websocket.Upgrader
}

func NewWSDetectHandler(detector *service.ONNXDetector) *WSDetectHandler {
	return &WSDetectHandler{
		detector: detector,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024 * 10,
			WriteBufferSize: 1024 * 10,
			// Allow connections from any origin for development
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

func (h *WSDetectHandler) HandleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection to WebSocket: %v", err)
		return
	}
	defer conn.Close()
	log.Println("New WebSocket client connected for live camera stream")

	for {
		// Read message from client (binary JPEG/PNG frame)
		messageType, payload, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket connection closed unexpectedly: %v", err)
			} else {
				log.Println("WebSocket client disconnected gracefully")
			}
			break
		}

		// Ensure it is a binary message
		if messageType != websocket.BinaryMessage {
			conn.WriteJSON(dto.DetectResponse{
				Status:  "error",
				Message: "Invalid message type. Only binary image payloads are accepted.",
			})
			continue
		}

		// Run inference directly using raw WebSocket payload bytes
		faceDetected, bbox, landmarks, maskProb, err := h.detector.DetectFaceAndMaskBytes(payload)
		if err != nil {
			conn.WriteJSON(dto.DetectResponse{
				Status:  "error",
				Message: "Inference error: " + err.Error(),
			})
			continue
		}

		// Prepare frame result using DTO structs
		response := dto.DetectResponse{
			Status:  "success",
			Message: "Frame processed",
			Data: &dto.DetectResponseData{
				Stage1: &dto.Stage1Result{
					FaceDetected:    faceDetected,
					MaskDetected:    maskProb > 0.80,
					MaskProbability: maskProb,
					BBox:            bbox,
					Landmarks:        landmarks,
				},
			},
		}

		// Send JSON result back to client in real-time
		err = conn.WriteJSON(response)
		if err != nil {
			log.Printf("Failed to send WebSocket response: %v", err)
			break
		}
	}
}
