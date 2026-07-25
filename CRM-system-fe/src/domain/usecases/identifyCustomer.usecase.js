export class IdentifyCustomerUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(file) {
    if (!file) {
      throw new Error("Vui lòng chọn một ảnh khuôn mặt.");
    }
    return this.customerRepository.identify(file);
  }
}
