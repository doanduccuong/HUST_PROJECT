package dto

type VerifyResponse struct {
	Status  string              `json:"status"`
	Message string              `json:"message"`
	Data    *VerifyResponseData `json:"data,omitempty"`
}

type VerifyResponseData struct {
	FilenameCurrent string                 `json:"filename_current"`
	FilenameGallery string                 `json:"filename_gallery"`
	Verification    map[string]interface{} `json:"verification"`
}
