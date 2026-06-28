package service

import (
	"bufio"
	"bytes"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	"io"
	"log"
	"os"
	"os/exec"
	"sync"
)

// InitializeONNX is a no-op kept for main.go compilation compatibility
func InitializeONNX(dylibPath string) error {
	return nil
}

// DestroyONNX is a no-op kept for main.go compilation compatibility
func DestroyONNX() {
}

type ONNXDetector struct {
	cmd    *exec.Cmd
	stdin  io.WriteCloser
	stdout io.ReadCloser
	reader *bufio.Reader
	mu     sync.Mutex
}

// NewONNXDetector initializes the Python bridge subprocess
func NewONNXDetector(retinafaceModelPath, maskModelPath string) (*ONNXDetector, error) {
	// Paths relative to workspace root or absolute
	pythonPath := "/Users/sotatek/Desktop/Đồ án/deepfacev2/.venv/bin/python"
	scriptPath := "/Users/sotatek/Desktop/Đồ án/deepfacev2/bridge.py"

	if _, err := os.Stat(pythonPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("python virtual environment not found at %s. Please run setup first", pythonPath)
	}
	if _, err := os.Stat(scriptPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("bridge script not found at %s", scriptPath)
	}

	log.Printf("[Go-Python Bridge] Spawning Python subprocess: %s %s", pythonPath, scriptPath)
	cmd := exec.Command(pythonPath, scriptPath)

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stdin pipe: %w", err)
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stdout pipe: %w", err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stderr pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start Python subprocess: %w", err)
	}

	// Read initialization readiness signal from Python stderr
	stderrReader := bufio.NewReader(stderr)
	readySig, err := stderrReader.ReadString('\n')
	if err != nil {
		cmd.Process.Kill()
		return nil, fmt.Errorf("failed to read ready signal from Python: %w", err)
	}
	log.Printf("[Go-Python Bridge] Connected: %s", readySig)

	// Keep consuming stderr in a background goroutine to prevent blocking and log python print statements
	go func() {
		for {
			line, err := stderrReader.ReadString('\n')
			if err != nil {
				break
			}
			log.Printf("[Python Log] %s", line)
		}
	}()

	return &ONNXDetector{
		cmd:    cmd,
		stdin:  stdin,
		stdout: stdout,
		reader: bufio.NewReader(stdout),
	}, nil
}

// Destroy kills the Python subprocess
func (d *ONNXDetector) Destroy() {
	d.mu.Lock()
	defer d.mu.Unlock()
	if d.stdin != nil {
		d.stdin.Close()
	}
	if d.cmd != nil && d.cmd.Process != nil {
		d.cmd.Process.Kill()
		log.Println("[Go-Python Bridge] Python subprocess terminated.")
	}
}

// DetectFaceAndMask is the standard HTTP handler entry point (accepts image.Image)
func (d *ONNXDetector) DetectFaceAndMask(img image.Image) (bool, []int, [][]int, float32, map[string]float32, float32, float32, int, string, string, error) {
	// Encode Go image.Image back to JPEG bytes to pass over pipe
	buf := new(bytes.Buffer)
	err := jpeg.Encode(buf, img, nil)
	if err != nil {
		return false, nil, nil, 0, nil, 0, 0, 0, "", "", fmt.Errorf("failed to encode image to JPEG: %w", err)
	}
	return d.DetectFaceAndMaskBytes(buf.Bytes())
}

// DetectFaceAndMaskBytes is the optimized WebSocket handler entry point (accepts raw image bytes)
func (d *ONNXDetector) DetectFaceAndMaskBytes(imageBytes []byte) (bool, []int, [][]int, float32, map[string]float32, float32, float32, int, string, string, error) {
	d.mu.Lock()
	defer d.mu.Unlock()

	// Write length prefix (uint32 big-endian)
	length := uint32(len(imageBytes))
	err := binary.Write(d.stdin, binary.BigEndian, length)
	if err != nil {
		return false, nil, nil, 0, nil, 0, 0, 0, "", "", fmt.Errorf("failed to write size prefix: %w", err)
	}

	// Write image payload
	_, err = d.stdin.Write(imageBytes)
	if err != nil {
		return false, nil, nil, 0, nil, 0, 0, 0, "", "", fmt.Errorf("failed to write image payload: %w", err)
	}

	// Read single-line JSON response terminated by newline
	line, err := d.reader.ReadString('\n')
	if err != nil {
		return false, nil, nil, 0, nil, 0, 0, 0, "", "", fmt.Errorf("failed to read response from Python: %w", err)
	}

	// Parse JSON output
	var result struct {
		Status  string `json:"status"`
		Message string `json:"message,omitempty"`
		Data    struct {
			FaceDetected    bool               `json:"face_detected"`
			MaskDetected    bool               `json:"mask_detected"`
			MaskProbability float32            `json:"mask_probability"`
			Bbox            []int              `json:"bbox"`
			Landmarks       [][]int            `json:"landmarks"`
			Emotions        map[string]float32 `json:"emotions"`
			CSScore         float32            `json:"cs_score"`
			MSRScore        float32            `json:"msr_score"`
			Age             int                `json:"age"`
			Gender          string             `json:"gender"`
			Race            string             `json:"race"`
		} `json:"data,omitempty"`
	}

	if err := json.Unmarshal([]byte(line), &result); err != nil {
		return false, nil, nil, 0, nil, 0, 0, 0, "", "", fmt.Errorf("failed to parse JSON from Python: %w. Raw line: %s", err, line)
	}

	return result.Data.FaceDetected, result.Data.Bbox, result.Data.Landmarks, result.Data.MaskProbability, result.Data.Emotions, result.Data.CSScore, result.Data.MSRScore, result.Data.Age, result.Data.Gender, result.Data.Race, nil
}

// Verify delegates the 5-stage face matching to the Python bridge
func (d *ONNXDetector) Verify(imgPath, galleryPath string, threshold float64) (map[string]interface{}, error) {
	d.mu.Lock()
	defer d.mu.Unlock()

	// Build JSON request command
	request := map[string]interface{}{
		"cmd":          "verify",
		"img_path":     imgPath,
		"gallery_path": galleryPath,
		"threshold":    threshold,
	}

	reqBytes, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal verify request: %w", err)
	}

	// Write JSON line (terminated by \n)
	_, err = d.stdin.Write(append(reqBytes, '\n'))
	if err != nil {
		return nil, fmt.Errorf("failed to write verify command: %w", err)
	}

	// Read response line
	line, err := d.reader.ReadString('\n')
	if err != nil {
		return nil, fmt.Errorf("failed to read response from Python: %w", err)
	}

	var result struct {
		Status  string                 `json:"status"`
		Message string                 `json:"message,omitempty"`
		Data    map[string]interface{} `json:"data,omitempty"`
	}

	if err := json.Unmarshal([]byte(line), &result); err != nil {
		return nil, fmt.Errorf("failed to parse JSON from Python: %w. Raw line: %s", err, line)
	}

	if result.Status == "error" {
		return nil, fmt.Errorf("python verify error: %s", result.Message)
	}

	return result.Data, nil
}

