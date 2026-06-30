export class RegisterUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(file, name) {
    if (!file) {
      throw new Error("Tệp ảnh không hợp lệ");
    }
    if (!name || !name.trim()) {
      throw new Error("Tên khách hàng không được để trống");
    }
    return await this.customerRepository.register(file, name);
  }
}
