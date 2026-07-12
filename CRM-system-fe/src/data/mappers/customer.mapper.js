import { Customer } from "../../domain/models/customer";

export class CustomerMapper {
  static toDomain(dto) {
    if (!dto) return null;
    
    // Ánh xạ dữ liệu thô DTO sang mô hình miền với các giá trị fallback an toàn
    return new Customer({
      id: dto.name ? dto.name.toLowerCase().replace(/ /g, "-") : "new-customer",
      name: dto.name || "Khách hàng chưa đăng ký",
      identified: dto.identified || false,
      distance: dto.distance || 0,
      isNew: !dto.identified,
      emotion: dto.emotion || "neutral",
      gazeDirection: dto.gaze_direction || "Trực diện",
      gazeYaw: dto.gaze_yaw || 0.0,
      distanceM: dto.distance_m || 0.0,
      standingPosition: dto.standing_position || "Vừa phải",
      userImage: dto.user_image || null,
    });
  }
}
