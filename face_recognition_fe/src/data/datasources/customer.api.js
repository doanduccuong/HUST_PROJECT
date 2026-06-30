export class CustomerApi {
  constructor(baseUrl = "http://localhost:8000") {
    this.baseUrl = baseUrl;
  }

  async checkin(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseUrl}/api/checkin`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Gặp sự cố khi gửi ảnh check-in.");
    }
    
    return await response.json();
  }

  async register(file, name) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);

    const response = await fetch(`${this.baseUrl}/api/register`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Gặp sự cố khi gửi thông tin đăng ký.");
    }
    
    return await response.json();
  }

  async getCustomers() {
    const response = await fetch(`${this.baseUrl}/api/customers`, {
      method: "GET",
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Gặp sự cố khi lấy danh sách khách hàng.");
    }
    
    return await response.json();
  }
}
