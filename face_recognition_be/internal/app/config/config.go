package config

import (
	"os"
)

type Config struct {
	Port                 string
	RetinaFacePath       string
	MaskClassifierPath   string
}

var AppConfig *Config

func LoadConfig() {
	port := os.Getenv("PORT")
	if port == "" {
		port = ":8080"
	}

	retinaFacePath := os.Getenv("RETINAFACE_MODEL_PATH")
	if retinaFacePath == "" {
		retinaFacePath = "assets/models/retinaface.onnx"
	}

	maskClassifierPath := os.Getenv("MASK_CLASSIFIER_MODEL_PATH")
	if maskClassifierPath == "" {
		maskClassifierPath = "assets/models/mask_classifier.onnx"
	}

	AppConfig = &Config{
		Port:                 port,
		RetinaFacePath:       retinaFacePath,
		MaskClassifierPath:   maskClassifierPath,
	}
}
