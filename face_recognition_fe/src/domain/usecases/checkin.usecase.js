export class CheckinUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(file) {
    if (!file) {
      throw new Error("Tệp ảnh không hợp lệ");
    }
    return await this.customerRepository.checkin(file);
  }
}
