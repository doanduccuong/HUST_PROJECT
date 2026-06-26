package main

import (
	"log"
	"net/url"
	"os"

	"github.com/gorilla/websocket"
)

func main() {
	// WebSocket server URL
	u := url.URL{Scheme: "ws", Host: "localhost:8080", Path: "/api/v1/ws/detect"}
	log.Printf("Connecting to WebSocket server: %s", u.String())

	// Connect to server
	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatalf("Dial error: %v", err)
	}
	defer c.Close()
	log.Println("Successfully connected to WebSocket server!")

	// Read local test image file
	imagePath := "data/masked_test.jpg"
	log.Printf("Reading test image: %s", imagePath)
	imageBytes, err := os.ReadFile(imagePath)
	if err != nil {
		log.Fatalf("Failed to read image file: %v", err)
	}

	// Send image as binary message over WebSocket
	log.Println("Sending image binary frame to server...")
	err = c.WriteMessage(websocket.BinaryMessage, imageBytes)
	if err != nil {
		log.Fatalf("Write message error: %v", err)
	}

	// Read real-time JSON response from server
	log.Println("Waiting for response from server...")
	messageType, responseBytes, err := c.ReadMessage()
	if err != nil {
		log.Fatalf("Read message error: %v", err)
	}

	log.Printf("Response message type: %d (1=Text, 2=Binary)", messageType)
	log.Printf("Received response JSON:\n%s\n", string(responseBytes))
}
