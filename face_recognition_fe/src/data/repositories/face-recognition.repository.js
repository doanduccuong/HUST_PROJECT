import { IFaceRecognitionRepository } from "@/domain";
import { FaceDetectionDTOSchema } from "../dto/face-detection.dto";
import { FaceVerificationDTOSchema } from "../dto/face-verification.dto";
import { toFaceDetectionDomain } from "../mappers/face-detection.mapper";
import { toFaceVerificationDomain } from "../mappers/face-verification.mapper";

export class FaceRecognitionRepository extends IFaceRecognitionRepository {
  constructor(dataSource) {
    super();
    this.dataSource = dataSource;
  }

  async detectFace(imageFile) {
    const rawData = await this.dataSource.detectFace(imageFile);
    const dto = FaceDetectionDTOSchema.parse(rawData);
    return toFaceDetectionDomain(dto);
  }

  async verifyFaces(currentImageFile, galleryImageFile) {
    const rawData = await this.dataSource.verifyFaces(currentImageFile, galleryImageFile);
    const dto = FaceVerificationDTOSchema.parse(rawData);
    return toFaceVerificationDomain(dto);
  }

  createWebSocketConnection() {
    return this.dataSource.createWebSocket();
  }
}
