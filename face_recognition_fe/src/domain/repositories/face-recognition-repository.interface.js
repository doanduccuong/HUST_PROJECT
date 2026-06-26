export class IFaceRecognitionRepository {
  async detectFace(imageFile) {
    throw new Error("detectFace method not implemented");
  }

  async verifyFaces(currentImageFile, galleryImageFile) {
    throw new Error("verifyFaces method not implemented");
  }

  createWebSocketConnection() {
    throw new Error("createWebSocketConnection method not implemented");
  }
}
