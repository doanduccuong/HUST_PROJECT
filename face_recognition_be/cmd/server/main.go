package main

import (
	"log"
	"net/http"
	"time"

	"face_recognition_be/internal/app/config"
	"face_recognition_be/internal/app/handler"
	"face_recognition_be/internal/app/service"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

func main() {
	// Initialize configuration
	config.LoadConfig()

	// Initialize ONNX Detector Service
	detector, err := service.NewONNXDetector(config.AppConfig.RetinaFacePath, config.AppConfig.MaskClassifierPath)
	if err != nil {
		log.Fatalf("Failed to initialize ONNX detector: %v", err)
	}
	defer service.DestroyONNX()
	defer detector.Destroy()

	r := chi.NewRouter()

	// Basic Middlewares
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(corsMiddleware)

	// Root Route
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "healthy", "message": "Face Recognition Pure Go Backend"}`))
	})

	detectHandler := handler.NewDetectHandler(detector)
	wsHandler := handler.NewWSDetectHandler(detector)
	verifyHandler := handler.NewVerifyHandler(detector)

	// API Routes Group
	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/detect", detectHandler.Detect)
		r.HandleFunc("/ws/detect", wsHandler.HandleWS)
		r.Post("/customers/verify", verifyHandler.Verify)
	})

	port := config.AppConfig.Port
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(port, r); err != nil {
		log.Fatalf("Could not start server: %s\n", err.Error())
	}
}
