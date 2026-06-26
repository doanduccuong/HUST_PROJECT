export class VerifyFacesUseCase {
  constructor(faceRecognitionRepository) {
    this.repo = faceRecognitionRepository;
  }

  async execute(currentImageFile, galleryImageFile) {
    return await this.repo.verifyFaces(currentImageFile, galleryImageFile);
  }
}
