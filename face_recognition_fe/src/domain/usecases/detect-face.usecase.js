export class DetectFaceUseCase {
  constructor(faceRecognitionRepository) {
    this.repo = faceRecognitionRepository;
  }

  async execute(imageFile) {
    return await this.repo.detectFace(imageFile);
  }
}
