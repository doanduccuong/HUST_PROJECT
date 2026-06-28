package handler

import (
	"encoding/json"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"net/http"
	"path/filepath"

	"face_recognition_be/internal/app/dto"
	"face_recognition_be/internal/app/service"
)

// DetectHandler handles face detection and mask checking
type DetectHandler struct {
	detector *service.ONNXDetector
}

func NewDetectHandler(detector *service.ONNXDetector) *DetectHandler {
	return &DetectHandler{
		detector: detector,
	}
}

func (h *DetectHandler) Detect(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Limit request size to 10MB
	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)

	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.DetectResponse{
			Status:  "error",
			Message: "File upload size exceeded (max 10MB) or invalid format",
		})
		return
	}

	// Retrieve file from form data
	file, fileHeader, err := r.FormFile("image")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.DetectResponse{
			Status:  "error",
			Message: "Missing image file in multipart form under key 'image'",
		})
		return
	}
	defer file.Close()

	// Simple check for image extension
	ext := filepath.Ext(fileHeader.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.DetectResponse{
			Status:  "error",
			Message: "Unsupported file format. Please upload a JPG, JPEG, or PNG image",
		})
		return
	}

	// Decode image
	img, _, err := image.Decode(file)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.DetectResponse{
			Status:  "error",
			Message: "Failed to decode image. Please ensure the file is a valid image.",
		})
		return
	}

	// Call Stage 1 Detect Face and Mask + Emotions + CS + MSR
	faceDetected, bbox, landmarks, maskProb, emotions, csScore, msrScore, age, gender, race, err := h.detector.DetectFaceAndMask(img)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(dto.DetectResponse{
			Status:  "error",
			Message: "Error running model inference: " + err.Error(),
		})
		return
	}

	// Build structured DTO Response
	response := dto.DetectResponse{
		Status:  "success",
		Message: "Image processed successfully",
		Data: &dto.DetectResponseData{
			Filename: fileHeader.Filename,
			Size:     fileHeader.Size,
			Stage1: &dto.Stage1Result{
				FaceDetected:    faceDetected,
				MaskDetected:    maskProb > 0.80,
				MaskProbability: maskProb,
				BBox:            bbox,
				Landmarks:        landmarks,
				Emotions:        emotions,
				CSScore:         csScore,
				MSRScore:        msrScore,
				Age:             age,
				Gender:          gender,
				Race:            race,
			},
		},
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
