import { CustomerRepository } from "../../domain/repositories/customer.repository";
import { CheckinResponseSchema, RegisterResponseSchema } from "../dto/customer.dto";
import { CustomerMapper } from "../mappers/customer.mapper";

export class CustomerRepositoryImpl extends CustomerRepository {
  constructor(customerApi) {
    super();
    this.customerApi = customerApi;
  }

  async checkin(file) {
    const rawData = await this.customerApi.checkin(file);
    
    // Xác thực cấu trúc dữ liệu bằng Zod Schema
    const validatedData = CheckinResponseSchema.parse(rawData);
    
    // Ánh xạ sang Domain Entity
    return CustomerMapper.toDomain(validatedData);
  }

  async register(file, name) {
    const rawData = await this.customerApi.register(file, name);
    
    // Xác thực cấu trúc dữ liệu bằng Zod Schema
    const validatedData = RegisterResponseSchema.parse(rawData);
    
    return validatedData;
  }

  async getCustomers() {
    return await this.customerApi.getCustomers();
  }
}
