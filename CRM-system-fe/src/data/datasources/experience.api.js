import { ApiClient } from "./apiClient";

export class ExperienceApi {
  async startSession({ cameraId, zone, customerId = null, sourceType }) {
    const response = await ApiClient.post("/api/v1/experience/sessions", {
      cameraId,
      zone,
      customerId,
      sourceType,
    });
    return response.data;
  }

  async analyzeFrame(sessionId, frameBlob, sequence, capturedAt) {
    const formData = new FormData();
    formData.append("file", frameBlob, `frame-${sequence}.jpg`);
    formData.append("sequence", String(sequence));
    formData.append("capturedAt", capturedAt);

    const response = await ApiClient.post(
      `/api/v1/experience/sessions/${sessionId}/frames`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" }, timeout: 45000 },
    );
    return response.data;
  }

  async closeSession(sessionId) {
    const response = await ApiClient.post(
      `/api/v1/experience/sessions/${sessionId}/close`,
    );
    return response.data;
  }
}

export const experienceApi = new ExperienceApi();
