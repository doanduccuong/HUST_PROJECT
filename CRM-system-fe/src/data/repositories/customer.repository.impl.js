import { CustomerRepository } from "../../domain/repositories/customer.repository";
import {
  CheckinResponseSchema,
  Customer360ResponseSchema,
  FaceSearchResponseSchema,
  RegisterResponseSchema,
} from "../dto/customer.dto";
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

  async identify(file) {
    return FaceSearchResponseSchema.parse(await this.customerApi.identify(file));
  }

  async confirmIdentity(searchId, customerId) {
    return await this.customerApi.confirmIdentity(searchId, customerId);
  }

  async getProfile360(customerId) {
    return Customer360ResponseSchema.parse(
      await this.customerApi.getProfile360(customerId),
    );
  }
}
