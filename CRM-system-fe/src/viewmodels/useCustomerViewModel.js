import { useState, useEffect } from "react";
import { CustomerApi } from "../data/datasources/customer.api";
import { CustomerRepositoryImpl } from "../data/repositories/customer.repository.impl";
import { CheckinUseCase } from "../domain/usecases/checkin.usecase";
import { RegisterUseCase } from "../domain/usecases/register.usecase";
import { Customer } from "../domain/models/customer";

// Khởi tạo các dependency (Manual Dependency Injection)
const customerApi = new CustomerApi();
const customerRepo = new CustomerRepositoryImpl(customerApi);
const checkinUseCase = new CheckinUseCase(customerRepo);
const registerUseCase = new RegisterUseCase(customerRepo);

export function useCustomerViewModel() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);
  
  // State đăng ký
  const [newName, setNewName] = useState("");
  const [registerStatus, setRegisterStatus] = useState(null);

  // State danh sách thành viên và chuyển Tab
  const [activeTab, setActiveTab] = useState("checkin"); // "checkin" | "members"
  const [customersList, setCustomersList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);

  const fetchCustomers = async () => {
    setListLoading(true);
    setListError(null);
    try {
      const list = await customerRepo.getCustomers();
      setCustomersList(list);
    } catch (err) {
      setListError(err.message || "Không thể lấy danh sách khách hàng.");
    } finally {
      setListLoading(false);
    }
  };

  // Tải danh sách ban đầu khi khởi tạo
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchCustomers();
    });
  }, []);

  const selectFile = (file) => {
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setCustomer(null);
      setRegisterStatus(null);
      setNewName("");
    }
  };
  const checkin = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setCustomer(null);
    setRegisterStatus(null);

    try {
      const domainCustomer = await checkinUseCase.execute(selectedFile);
      setCustomer(domainCustomer);
    } catch (err) {
      setError(err.message || "Lỗi kiểm tra check-in");
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!selectedFile || !newName.trim()) return;
    setLoading(true);
    setRegisterStatus(null);

    try {
      const data = await registerUseCase.execute(selectedFile, newName);
      if (data.status === "success") {
        setRegisterStatus({
          status: "success",
          message: `Đăng ký thành công "${newName}"!`,
        });
        
        // Đồng thời cập nhật customer state thành đã định danh
        setCustomer(new Customer({
          id: newName.toLowerCase().replace(/ /g, "-"),
          name: newName,
          identified: true,
          distance: 0.0,
          isNew: false
        }));

        // Reset dữ liệu nhập
        setNewName("");
        
        // Tải lại danh sách khách hàng để cập nhật số lượng
        fetchCustomers();
      }
    } catch (err) {
      setRegisterStatus({
        status: "error",
        message: err.message || "Đăng ký thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    if (tab === "members") {
      fetchCustomers();
    }
  };

  return {
    selectedFile,
    previewUrl,
    loading,
    error,
    customer,
    newName,
    registerStatus,
    activeTab,
    customersList,
    listLoading,
    listError,
    setNewName,
    selectFile,
    checkin,
    register,
    changeTab,
    fetchCustomers,
  };
}
