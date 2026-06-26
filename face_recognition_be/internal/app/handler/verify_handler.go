package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"face_recognition_be/internal/app/dto"
	"face_recognition_be/internal/app/service"
)

type VerifyHandler struct {
	detector *service.ONNXDetector
}

func NewVerifyHandler(detector *service.ONNXDetector) *VerifyHandler {
	return &VerifyHandler{
		detector: detector,
	}
}

func (h *VerifyHandler) Verify(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Limit request size to 20MB (since we receive 2 images)
	r.Body = http.MaxBytesReader(w, r.Body, 20<<20)

	err := r.ParseMultipartForm(20 << 20)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.VerifyResponse{
			Status:  "error",
			Message: "Multipart form size limit exceeded (max 20MB)",
		})
		return
	}

	// 1. Get current_image
	fileCurrent, headerCurrent, err := r.FormFile("current_image")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.VerifyResponse{
			Status:  "error",
			Message: "Missing target image under key 'current_image'",
		})
		return
	}
	defer fileCurrent.Close()

	// 2. Get gallery_image
	fileGallery, headerGallery, err := r.FormFile("gallery_image")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.VerifyResponse{
			Status:  "error",
			Message: "Missing reference image under key 'gallery_image'",
		})
		return
	}
	defer fileGallery.Close()

	// Create a temp directory inside workspace if it doesn't exist
	tempDir := filepath.Join(".", "temp")
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(dto.VerifyResponse{
			Status:  "error",
			Message: "Failed to initialize temp upload directory: " + err.Error(),
		})
		return
	}

	// 3. Save current_image to temporary file
	tmpCurrent, err := os.CreateTemp(tempDir, "current-*.jpg")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(dto.VerifyResponse{
			Status:  "error",
			Message: "Failed to create temp file: " + err.Error(),
		})
		return
	}
	defer os.Remove(tmpCurrent.Name())
	defer tmpCurrent.Close()

	_, err = io.Copy(tmpCurrent, fileCurrent)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(dto.VerifyResponse{
			Status:  "error",
			Message: "Failed to save current image: " + err.Error(),
		})
		return
	}

	// 4. Save gallery_image to temporary file
	tmpGallery, err := os.CreateTemp(tempDir, "gallery-*.jpg")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(dto.VerifyResponse{
			Status:  "error",
			Message: "Failed to create temp file: " + err.Error(),
		})
		return
	}
	defer os.Remove(tmpGallery.Name())
	defer tmpGallery.Close()

	_, err = io.Copy(tmpGallery, fileGallery)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(dto.VerifyResponse{
			Status:  "error",
			Message: "Failed to save gallery image: " + err.Error(),
		})
		return
	}

	// Get absolute paths for Python
	absCurrent, _ := filepath.Abs(tmpCurrent.Name())
	absGallery, _ := filepath.Abs(tmpGallery.Name())

	// 5. Call Python Bridge to Verify
	result, err := h.detector.Verify(absCurrent, absGallery, 0.65)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(dto.VerifyResponse{
			Status:  "error",
			Message: "Pipeline execution failed: " + err.Error(),
		})
		return
	}

	// Format response matching the API specification via structured DTO
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dto.VerifyResponse{
		Status:  "success",
		Message: "Verification pipeline completed",
		Data: &dto.VerifyResponseData{
			FilenameCurrent: headerCurrent.Filename,
			FilenameGallery: headerGallery.Filename,
			Verification:    result,
		},
	})
}
