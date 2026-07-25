export class ConfirmCustomerIdentityUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(searchId, customerId) {
    if (!searchId || !customerId) {
      throw new Error("Thiếu dữ liệu xác nhận nhận diện.");
    }
    return this.customerRepository.confirmIdentity(searchId, customerId);
  }
}
