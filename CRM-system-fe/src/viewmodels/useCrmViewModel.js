"use client";

import { useState, useEffect } from "react";
import { ApiClient as Client } from "../data/datasources/apiClient";

export function useCrmViewModel(token) {
  const [activeTab, setActiveTabState] = useState("dashboard");

  // Đồng bộ tab từ URL parameter khi mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab) {
        setActiveTabState(tab);
      }
    }
  }, []);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.pushState(null, "", url.toString());
    }
  };

  const [agentStatus, setAgentStatus] = useState("unavailable");
  
  // Dashboard Stats State
  const [dashboardStats, setDashboardStats] = useState({
    totalMembers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    conversionRate: 0.0,
    callsHandledToday: 0,
    lead: { approved: 0, rejected: 0, callback: 0, trash: 0, unCall: 0 },
    mySale: { lead: 0, saleOrder: 0, delivered: 0, paid: 0 },
    totalCall: { connected: 0, busy: 0, invalid: 0, total: 0 },
    compare: {
      lst: [
        { label: "Total Lead", value: 0.0 },
        { label: "Total Order Value", value: 0.0 },
        { label: "Sale Order", value: 0.0 },
        { label: "Approve Rate", value: 0.0 },
        { label: "Avg Order Value", value: 0.0 }
      ]
    }
  });

  // Orders State
  const [orders, setOrders] = useState([]);

  // CDRs State
  const [cdrs, setCdrs] = useState([]);

  // Products State
  const [products, setProducts] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all CRM data dynamically from Spring Boot APIs
  const fetchCrmData = async () => {
    if (!token) return;

    try {
      // 1. Fetch Aggregated Stats
      const statsRes = await Client.get("/api/v1/dashboard/stats");
      setDashboardStats(statsRes.data);

      // 2. Fetch Orders
      const ordersRes = await Client.get("/api/v1/orders");
      const mappedOrders = ordersRes.data.map((order) => ({
        id: order.soCode,
        name: order.leadName,
        phone: order.leadPhone,
        productName: order.productName,
        deliveryService: order.deliveryService,
        crossSell: order.crossSell,
        affiliateId: order.affiliateId,
        subId1: order.subId1,
        amount: order.amount,
        agency: order.agency,
        assigned: order.assigned
      }));
      setOrders(mappedOrders);

      // 3. Fetch CDR logs
      const cdrsRes = await Client.get("/api/v1/customers/cdrs");
      const mappedCdrs = cdrsRes.data.map((cdr) => ({
        id: `CDR${String(cdr.id).padStart(3, '0')}`,
        name: cdr.name,
        phone: cdr.phone,
        callType: cdr.callType,
        agent: cdr.agent,
        duration: cdr.duration,
        time: cdr.callTime ? new Date(cdr.callTime).toISOString().replace('T', ' ').substring(0, 19) : "",
        status: cdr.status
      }));
      setCdrs(mappedCdrs);

      // 4. Fetch Products
      try {
        const productsRes = await Client.get("/api/v1/products");
        const mappedProducts = productsRes.data.map((prod) => ({
          id: prod.prodId,
          code: prod.code || "",
          category: prod.category || "",
          name: prod.name,
          commercialName: prod.dscr || prod.name,
          price: prod.price ? prod.price.split(",") : ["0"],
          status: prod.status === 1 ? "Active" : "Inactive"
        }));
        setProducts(mappedProducts);
      } catch (prodErr) {
        console.error("Failed to load products:", prodErr);
      }

    } catch (err) {
      console.error("Failed to load database CRM data via Axios:", err);
    }
  };

  // Trigger data load on token authentication
  useEffect(() => {
    fetchCrmData();
  }, [token, activeTab]); // Refresh when tab switches or token changes

  const handleStatusChange = async (status) => {
    setAgentStatus(status);
    console.log(`Agent status changed to: ${status}`);

    if (!token) return;

    const statusMap = {
      available: "LOGIN",
      busy: "BUSY",
      break: "BREAK",
      unavailable: "LOGOUT"
    };

    const dbStatus = statusMap[status] || "LOGIN";

    try {
      await Client.post("/api/v1/agent/status", {
        status: dbStatus,
        message: `Agent state synced from frontend dropdown: ${status}`
      });
      console.log("Status successfully synced with database trace logs.");
    } catch (err) {
      console.error("Failed to sync agent status via Axios:", err);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Filtered orders based on search term
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      (order.name && order.name.toLowerCase().includes(term)) ||
      (order.phone && order.phone.includes(term)) ||
      (order.productName && order.productName.toLowerCase().includes(term)) ||
      (order.assigned && order.assigned.toLowerCase().includes(term))
    );
  });

  const updateProduct = async (id, productData) => {
    try {
      const body = {
        name: productData.name,
        code: productData.code,
        category: productData.category,
        price: Array.isArray(productData.price) ? productData.price.join(",") : productData.price,
        dscr: productData.commercialName,
        status: productData.status === "Active" ? 1 : 0
      };
      await Client.put(`/api/v1/products/${id}`, body);
      fetchCrmData();
      return { success: true };
    } catch (err) {
      console.error("Failed to update product:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    activeTab,
    setActiveTab,
    agentStatus,
    handleStatusChange,
    dashboardStats,
    orders: filteredOrders,
    cdrs,
    products,
    updateProduct,
    searchTerm,
    handleSearch,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    refreshData: fetchCrmData
  };
}
