export class FaceRecognitionDataSource {
  constructor() {
    this.baseUrl = "http://localhost:8080/api/v1";
    this.wsUrl = "ws://localhost:8080/api/v1/ws/detect";
  }

  async detectFace(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(`${this.baseUrl}/detect`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async verifyFaces(currentImageFile, galleryImageFile) {
    const formData = new FormData();
    formData.append("current_image", currentImageFile);
    formData.append("gallery_image", galleryImageFile);

    const response = await fetch(`${this.baseUrl}/customers/verify`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  createWebSocket() {
    return new WebSocket(this.wsUrl);
  }
}
