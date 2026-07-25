export class GetCustomer360UseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customerId) {
    if (!customerId) {
      throw new Error("Thiếu mã khách hàng.");
    }
    return this.customerRepository.getProfile360(customerId);
  }
}
