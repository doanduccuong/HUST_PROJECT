package dto

type DetectResponse struct {
	Status  string              `json:"status"`
	Message string              `json:"message"`
	Data    *DetectResponseData `json:"data,omitempty"`
}

type DetectResponseData struct {
	Filename string        `json:"filename"`
	Size     int64         `json:"size"`
	Stage1   *Stage1Result `json:"stage1"`
}

type Stage1Result struct {
	FaceDetected    bool               `json:"face_detected"`
	MaskDetected    bool               `json:"mask_detected"`
	MaskProbability float32            `json:"mask_probability"`
	BBox            []int              `json:"bbox"`
	Landmarks       [][]int            `json:"landmarks"`
	Emotions        map[string]float32 `json:"emotions"`
	CSScore         float32            `json:"cs_score"`
	MSRScore        float32            `json:"msr_score"`
	Age             int                `json:"age"`
	Gender          string             `json:"gender"`
	Race            string             `json:"race"`
}
