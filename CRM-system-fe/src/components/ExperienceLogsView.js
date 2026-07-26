"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ApiClient as Client } from "../data/datasources/apiClient";
import ProductManagementView from "./ProductManagementView";

export default function ExperienceLogsView({ token, products = [], onUpdateProduct }) {
  const [activeTab, setActiveTab] = useState("journeys"); // journeys, sessions, events, orders, products, deltas, alerts
  const [productSubTab, setProductSubTab] = useState("list"); // list, promotions
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState(""); // today, 7d, 30d, 90d
  const [specificDate, setSpecificDate] = useState("2026-07-23"); // Default to seeded demo data date (2026-07-23)
  const [showSummary, setShowSummary] = useState(true);
  const [expandedJourneys, setExpandedJourneys] = useState({}); // customerId-date expanded mapping

  const [loading, setLoading] = useState(false);
  const [journeysData, setJourneysData] = useState([]);
  const [sessionsData, setSessionsData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [deltasData, setDeltasData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);

  // Local state for promotions CRUD
  const [promotions, setPromotions] = useState([
    { id: "KM-DELIGHTED", code: "KM-DELIGHTED", name: "Ưu đãi tri ân biểu cảm Delighted", type: "Quà tặng", value: "Bình giữ nhiệt Lock&Lock", trigger: "DELIGHTED", appliedProduct: "ALL", status: "Active" },
    { id: "KM-IMPATIENT", code: "KM-IMPATIENT", name: "Voucher giảm 50k bù đắp Impatient", type: "Giảm giá", value: "50.000 đ", trigger: "IMPATIENT", appliedProduct: "ALL", status: "Active" },
    { id: "KM-CONFUSED", code: "KM-CONFUSED", name: "Trợ giá Trade-in 15% khách phân vân", type: "Phần trăm", value: "15%", trigger: "CONFUSED", appliedProduct: "951", status: "Active" }
  ]);

  // Promotions Modal State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoFormData, setPromoFormData] = useState({
    code: "",
    name: "",
    type: "Giảm giá",
    value: "",
    trigger: "DELIGHTED",
    appliedProduct: "ALL",
    status: "Active"
  });

  // Handle specific date input change
  const handleDateChange = (e) => {
    setSpecificDate(e.target.value);
    setSelectedPeriod(""); // Reset quick period selection
  };

  // Handle quick period buttons
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setSpecificDate(""); // Reset specific calendar date

    const today = new Date().toISOString().split("T")[0];
    if (period === "today") {
      setSpecificDate(today);
    } else {
      setSpecificDate("");
    }
  };

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const dateParam = specificDate || "";

      if (activeTab === "journeys") {
        const res = await Client.get("/api/v1/experience/journeys", {
          params: { search: searchQuery, date: dateParam, limit: 100 }
        });
        setJourneysData(res.data);
      } else if (activeTab === "sessions") {
        const res = await Client.get("/api/v1/experience/sessions", {
          params: { search: searchQuery, zone: selectedZone, date: dateParam, limit: 100 }
        });
        setSessionsData(res.data);
      } else if (activeTab === "events") {
        const res = await Client.get("/api/v1/experience/events", {
          params: { search: searchQuery, zone: selectedZone, state: selectedState, date: dateParam, limit: 100 }
        });
        setEventsData(res.data);
      } else if (activeTab === "deltas") {
        const res = await Client.get("/api/v1/experience/purchase-summaries", {
          params: { search: searchQuery, date: dateParam, limit: 100 }
        });
        setDeltasData(res.data);
      } else if (activeTab === "orders") {
        const res = await Client.get("/api/v1/orders");
        const mappedOrders = res.data.map((order) => ({
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

        // Filter orders locally based on search query
        const filtered = searchQuery
          ? mappedOrders.filter(
              (o) =>
                o.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.phone?.includes(searchQuery) ||
                o.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.id?.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : mappedOrders;

        setOrdersData(filtered);
      }
    } catch (err) {
      console.error("Failed to load experience logs:", err);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, searchQuery, selectedZone, selectedState, specificDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle expanded state for a journey row
  const toggleJourneyExpand = (key) => {
    setExpandedJourneys((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper formatting tools
  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch (e) {
      return timeStr;
    }
  };

  const formatDate = (timeStr) => {
    if (!timeStr) return "-";
    try {
      const d = new Date(timeStr);
      return d.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
    } catch (e) {
      return timeStr;
    }
  };

  const getDwellTime = (started, ended) => {
    if (!started || !ended) return "-";
    try {
      const diffMs = new Date(ended) - new Date(started);
      const diffSecs = Math.floor(diffMs / 1000);
      const mins = Math.floor(diffSecs / 60);
      const secs = diffSecs % 60;
      return `${mins}m ${secs}s`;
    } catch (e) {
      return "-";
    }
  };

  // Static mock Alerts for demo, aligned with report metrics
  const alertLogs = [
    {
      id: "ALT-001",
      zone: "Tech Service Desk (Dán máy)",
      camera: "CAM-05",
      type: "IBI Vượt Ngưỡng (Khách sốt ruột)",
      value: "18.2%",
      threshold: "<= 5.0%",
      level: "CRITICAL",
      action: "Tăng cường thêm 1 kỹ thuật viên hỗ trợ dán máy.",
      time: "2026-07-26 15:30:00"
    },
    {
      id: "ALT-002",
      zone: "Mobile Zone (Tư vấn Điện thoại)",
      camera: "CAM-03",
      type: "CBI Vượt Ngưỡng (Khách phân vân)",
      value: "14.5%",
      threshold: "<= 8.0%",
      level: "WARNING",
      action: "Tinh giản thủ tục đối soát giá thu cũ đổi mới (Trade-in).",
      time: "2026-07-26 14:15:00"
    }
  ];

  // Helper stats for summary
  const getSummaryStats = () => {
    if (activeTab === "journeys") {
      return {
        total: journeysData.length,
        label: "Tổng Lượt Hành Trình Quét",
        metric: "30m 0s",
        metricLabel: "Tổng Dwell Time (Min -> Max)"
      };
    } else if (activeTab === "sessions") {
      return {
        total: sessionsData.length,
        label: "Tổng Lượt Ghé Quét",
        metric: "5m 0s",
        metricLabel: "Dwell Time trung bình"
      };
    } else if (activeTab === "events") {
      const delightedCount = eventsData.filter(e => e.experienceState === "DELIGHTED" || e.experienceState === "ENGAGED").length;
      const pct = eventsData.length > 0 ? Math.round((delightedCount / eventsData.length) * 100) : 0;
      return {
        total: eventsData.length,
        label: "Tổng Số Biểu Cảm Quét",
        metric: `${pct}%`,
        metricLabel: "Chỉ số Delight & Hứng thú"
      };
    } else if (activeTab === "orders") {
      const totalAmount = ordersData.reduce((acc, o) => acc + (o.amount || 0), 0);
      const avg = ordersData.length > 0 ? Math.round(totalAmount / ordersData.length) : 0;
      return {
        total: ordersData.length,
        label: "Tổng Số Đơn Hàng",
        metric: `${(avg * 1000).toLocaleString('vi-VN')} đ`,
        metricLabel: "Giá trị đơn hàng trung bình"
      };
    } else if (activeTab === "products") {
      if (productSubTab === "list") {
        return {
          total: products.length,
          label: "Tổng Số Sản Phẩm",
          metric: `${products.length} dòng`,
          metricLabel: "Danh mục sản phẩm mở bán"
        };
      } else {
        const activePromos = promotions.filter(p => p.status === "Active").length;
        return {
          total: promotions.length,
          label: "Tổng Số Khuyến Mãi",
          metric: `${activePromos} active`,
          metricLabel: "Chương trình áp dụng tại quầy"
        };
      }
    } else if (activeTab === "deltas") {
      const improved = deltasData.filter(d => d.experienceDelta > 0).length;
      const pct = deltasData.length > 0 ? Math.round((improved / deltasData.length) * 100) : 0;
      return {
        total: deltasData.length,
        label: "Tổng Số Đơn Đối Soát",
        metric: `${pct}%`,
        metricLabel: "Tỷ lệ trải nghiệm đi lên"
      };
    } else {
      return {
        total: alertLogs.length,
        label: "Số Cảnh Báo Vận Hành",
        metric: "2 điểm nóng",
        metricLabel: "Tech Desk & Mobile Zone"
      };
    }
  };

  // Handle Promotions CRUD actions
  const handleAddPromoClick = () => {
    setEditingPromo(null);
    setPromoFormData({
      code: "",
      name: "",
      type: "Giảm giá",
      value: "",
      trigger: "DELIGHTED",
      appliedProduct: "ALL",
      status: "Active"
    });
    setIsPromoModalOpen(true);
  };

  const handleEditPromoClick = (promo) => {
    setEditingPromo(promo);
    setPromoFormData({
      code: promo.code,
      name: promo.name,
      type: promo.type,
      value: promo.value,
      trigger: promo.trigger,
      appliedProduct: promo.appliedProduct || "ALL",
      status: promo.status
    });
    setIsPromoModalOpen(true);
  };

  const handleSavePromo = () => {
    if (!promoFormData.code || !promoFormData.name) {
      alert("Vui lòng điền đầy đủ Mã và Tên khuyến mãi!");
      return;
    }

    if (editingPromo) {
      // Edit
      setPromotions(prev =>
        prev.map(p => (p.id === editingPromo.id ? { ...p, ...promoFormData } : p))
      );
    } else {
      // Add
      const newPromo = {
        id: promoFormData.code,
        ...promoFormData
      };
      setPromotions(prev => [...prev, newPromo]);
    }
    setIsPromoModalOpen(false);
  };

  const handleDeletePromo = (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa chương trình khuyến mãi này?")) {
      setPromotions(prev => prev.filter(p => p.id !== id));
    }
  };

  // Helper resolver for applicable product label
  const getProductLabel = (applied) => {
    if (applied === "ALL") return "Tất cả sản phẩm";
    const prod = products.find(p => String(p.id) === String(applied));
    return prod ? `${prod.name} (#${prod.id})` : applied;
  };

  const summary = getSummaryStats();
  const isEmbedTab = activeTab === "products";

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Title Header Bar */}
      <div className="bg-[#1e293b] px-6 py-4 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-white text-lg font-bold">Lịch sử & Đối soát Trải nghiệm</h1>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Dữ liệu đối soát camera hành trình qua các camera, biểu cảm và cấu hình sản phẩm đơn hàng
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 font-semibold flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
          </svg>
          Tải lại
        </button>
      </div>

      {/* Tabs Menu in Header style */}
      <div className="bg-white border-b border-slate-200 px-6 flex flex-wrap gap-6 text-sm font-semibold text-slate-500">
        {[
          { id: "journeys", label: "Hành trình (Journeys)" },
          { id: "sessions", label: "Điểm chạm (Sessions)" },
          { id: "events", label: "Biểu cảm (Events)" },
          { id: "orders", label: "Đơn hàng (Orders)" },
          { id: "products", label: "Sản phẩm (Products)" },
          { id: "deltas", label: "Đối soát đơn hàng (Purchase Deltas)" },
          { id: "alerts", label: "Nhật ký cảnh báo (Alerts)" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 border-b-2 px-1 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {/* Filters and Date Period Bar - Hidden for fully embedded views since they have their own filters */}
        {!isEmbedTab && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Bộ lọc</span>
              
              {/* Search Input */}
              <div className="relative min-w-[200px] flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder={activeTab === "orders" ? "Tìm theo mã đơn, khách, sản phẩm..." : "Tìm khách hàng..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
                <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Zone Dropdown */}
              {activeTab === "sessions" && (
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 px-3 py-1.5 focus:outline-none bg-white"
                >
                  <option value="ALL">Mọi Khu vực (Zones)</option>
                  <option value="ENTRANCE">Entrance (Cổng chào)</option>
                  <option value="WAITING">Waiting (Khu Chờ)</option>
                  <option value="CONSULTING">Consulting (Tư vấn)</option>
                  <option value="PRODUCT">Product (Trải nghiệm)</option>
                  <option value="CHECKOUT">Checkout (Thanh toán)</option>
                  <option value="EXIT">Exit (Cổng ra)</option>
                </select>
              )}

              {/* State/Emotion Dropdown */}
              {activeTab === "events" && (
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 px-3 py-1.5 focus:outline-none bg-white"
                >
                  <option value="ALL">Mọi Cảm xúc (Emotions)</option>
                  <option value="DELIGHTED">Delighted (Rất Hài Lòng)</option>
                  <option value="ENGAGED">Engaged (Hứng Thú)</option>
                  <option value="NEUTRAL">Neutral (Trung Tính)</option>
                  <option value="CONFUSED">Confused (Phân Vân)</option>
                  <option value="IMPATIENT">Impatient (Sốt Ruột)</option>
                  <option value="DISSATISFIED">Dissatisfied (Tệ)</option>
                </select>
              )}

              {/* Calendar Date Picker Input */}
              {activeTab !== "orders" && (
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ngày cụ thể:</span>
                  <input
                    type="date"
                    value={specificDate}
                    onChange={handleDateChange}
                    className="text-xs font-semibold text-slate-600 focus:outline-none bg-transparent cursor-pointer"
                  />
                </div>
              )}

              {/* Quick Period Buttons */}
              {activeTab !== "orders" && (
                <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
                  {[
                    { id: "today", label: "Hôm nay" },
                    { id: "all", label: "Tất cả lịch sử" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePeriodChange(p.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                        (p.id === "all" && !specificDate) || (p.id === "today" && specificDate === new Date().toISOString().split("T")[0])
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Summary toggle button */}
              <button
                onClick={() => setShowSummary(!showSummary)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 ml-auto border border-blue-200 rounded-lg hover:bg-blue-50/50"
              >
                {showSummary ? "Ẩn Tóm Tắt" : "Hiện Tóm Tắt"}
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Summary Cards */}
        {showSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{summary.label}</span>
              <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{summary.total}</h2>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Lượt thống kê trong khoảng thời gian lọc</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{summary.metricLabel}</span>
              <h2 className="text-3xl font-extrabold text-blue-600 mt-2">{summary.metric}</h2>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Chỉ số trung bình thực tế toàn chi nhánh</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm bg-gradient-to-br from-blue-50/30 to-violet-50/30">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Múi Giờ Cửa Hàng</span>
              <h2 className="text-lg font-bold text-slate-800 mt-2">ICT (GMT+07:00)</h2>
              <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Báo cáo cập nhật tự động sau mỗi 5s</p>
            </div>
          </div>
        )}

        {/* 1. PRODUCTS MAIN TAB (WITH SUB-TABS) */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Sub-tab Pills */}
            <div className="flex gap-2 border-b border-slate-200 pb-3">
              {[
                { id: "list", label: "Danh sách sản phẩm" },
                { id: "promotions", label: "Khuyến mãi" }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setProductSubTab(sub.id)}
                  className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                    productSubTab === sub.id
                      ? "bg-[#1e293b] text-white border-[#1e293b] shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Sub-tab content */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {productSubTab === "list" && (
                <ProductManagementView products={products} onUpdateProduct={onUpdateProduct} />
              )}
              {productSubTab === "promotions" && (
                <div className="p-6 space-y-4">
                  {/* Title and Add Button */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-800">Quản lý chương trình khuyến mãi (Emotion triggered)</h3>
                    <button
                      onClick={handleAddPromoClick}
                      className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded text-xs font-bold transition-all"
                    >
                      + Thêm khuyến mãi
                    </button>
                  </div>

                  {/* Promotions Grid Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                          <th className="p-3">Mã Khuyến Mãi</th>
                          <th className="p-3">Tên Chương Trình</th>
                          <th className="p-3">Sản Phẩm Áp Dụng</th>
                          <th className="p-3">Hình Thức</th>
                          <th className="p-3">Giá Trị</th>
                          <th className="p-3">Điều Kiện Kích Hoạt (Cảm Xúc)</th>
                          <th className="p-3">Trạng Thái</th>
                          <th className="p-3 text-right">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {promotions.map((promo) => (
                          <tr key={promo.id} className="hover:bg-slate-50/50">
                            <td className="p-3 text-blue-600 font-bold">{promo.code}</td>
                            <td className="p-3 text-slate-900">{promo.name}</td>
                            <td className="p-3">
                              <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-bold border border-slate-200 text-[10px]">
                                {getProductLabel(promo.appliedProduct)}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">{promo.type}</td>
                            <td className="p-3 font-bold text-slate-900">{promo.value}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded font-bold text-[9px] uppercase ${
                                promo.trigger === "DELIGHTED" ? "bg-emerald-100 text-emerald-800" :
                                promo.trigger === "ENGAGED" ? "bg-blue-100 text-blue-800" :
                                promo.trigger === "CONFUSED" ? "bg-yellow-100 text-yellow-800" :
                                promo.trigger === "IMPATIENT" ? "bg-orange-100 text-orange-800" :
                                promo.trigger === "DISSATISFIED" ? "bg-red-100 text-red-800" :
                                "bg-slate-100 text-slate-800"
                              }`}>
                                {promo.trigger}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                promo.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                              }`}>
                                {promo.status === "Active" ? "Hoạt động" : "Tạm dừng"}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-2 text-[10px] font-bold">
                              <button
                                onClick={() => handleEditPromoClick(promo)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeletePromo(promo.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                        {promotions.length === 0 && (
                          <tr>
                            <td colSpan="8" className="p-6 text-center text-slate-400 font-semibold">
                              Không có chương trình khuyến mãi nào được tìm thấy
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Standard Data Results Table (Only for non-embedded logs tabs) */}
        {!isEmbedTab && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <span className="text-xs font-bold text-slate-600">
                Danh sách kết quả ({loading ? "Đang tải..." : `${summary.total} kết quả`})
              </span>
              <div className="flex gap-2">
                <button className="text-[10px] font-bold bg-white text-slate-600 border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50">
                  Xuất Excel
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-slate-400 font-semibold text-xs">
                  Đang truy vấn dữ liệu từ PostgreSQL...
                </div>
              ) : (
                <>
                  {/* Journeys View */}
                  {activeTab === "journeys" && (
                    <div className="divide-y divide-slate-100 font-semibold text-slate-700 text-xs">
                      <div className="grid grid-cols-12 bg-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider p-3">
                        <div className="col-span-3">Khách Hàng</div>
                        <div className="col-span-2">Ngày Thực Hiện</div>
                        <div className="col-span-2">Thời Gian Vào</div>
                        <div className="col-span-2">Thời Gian Ra</div>
                        <div className="col-span-2 text-center">Tổng Điểm Chạm</div>
                        <div className="col-span-1 text-right">Thao Tác</div>
                      </div>

                      {journeysData.map((j) => {
                        const key = `${j.customerId}-${j.journeyDate}`;
                        const isExpanded = !!expandedJourneys[key];
                        return (
                          <div key={key} className="flex flex-col">
                            <div 
                              onClick={() => toggleJourneyExpand(key)}
                              className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50 cursor-pointer transition-colors"
                            >
                              <div className="col-span-3 flex items-center gap-2">
                                <img
                                  src={j.customerImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                  alt=""
                                />
                                <span className="font-bold text-slate-900">{j.customerName}</span>
                              </div>
                              <div className="col-span-2 text-slate-500">{formatDate(j.journeyDate)}</div>
                              <div className="col-span-2 text-slate-600 font-mono">{formatTime(j.arrivalTime)}</div>
                              <div className="col-span-2 text-slate-600 font-mono">{formatTime(j.departureTime)}</div>
                              <div className="col-span-2 text-center">
                                <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  {j.steps?.length || 0} Zone Cameras
                                </span>
                              </div>
                              <div className="col-span-1 text-right text-blue-600 font-bold">
                                {isExpanded ? "Ẩn ▲" : "Xem ▼"}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="bg-[#fafbfc] border-t border-b border-slate-100 p-6 pl-12">
                                <div className="relative border-l-2 border-slate-200 pl-8 space-y-6">
                                  {j.steps?.map((step, idx) => (
                                    <div key={step.id} className="relative">
                                      <span className="absolute -left-[41px] top-0.5 w-6 h-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center font-bold text-[9px] text-blue-600">
                                        {idx + 1}
                                      </span>
                                      
                                      <div className="flex flex-wrap items-center justify-between gap-2 max-w-4xl bg-white border border-slate-100 rounded-lg p-3 shadow-sm">
                                        <div>
                                          <h4 className="font-bold text-slate-800 text-xs">
                                            Khu vực: {step.zone}
                                          </h4>
                                          <p className="text-[10px] text-slate-400 mt-0.5">
                                            Camera: {step.cameraId} | Local Track ID: {step.localTrackId}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                          <div className="text-right">
                                            <div className="text-[10px] text-slate-500">Dwell Time (Thời gian dừng)</div>
                                            <div className="font-bold text-slate-800">{getDwellTime(step.startedAt, step.endedAt)}</div>
                                          </div>
                                          <div className="text-right font-mono text-[10px] text-slate-500">
                                            <div>Vào: {formatTime(step.startedAt)}</div>
                                            <div>Ra: {formatTime(step.endedAt)}</div>
                                          </div>
                                          <div className="min-w-[100px] text-right">
                                            <span className={`px-2.5 py-1 rounded font-bold text-[9px] uppercase tracking-wide ${
                                              step.experienceState === "DELIGHTED" ? "bg-emerald-100 text-emerald-800" :
                                              step.experienceState === "ENGAGED" ? "bg-blue-100 text-blue-800" :
                                              step.experienceState === "CONFUSED" ? "bg-yellow-100 text-yellow-800" :
                                              step.experienceState === "IMPATIENT" ? "bg-orange-100 text-orange-800" :
                                              step.experienceState === "DISSATISFIED" ? "bg-red-100 text-red-800" :
                                              "bg-slate-100 text-slate-800"
                                            }`}>
                                              {step.experienceState || "Neutral"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {journeysData.length === 0 && (
                        <div className="p-12 text-center text-slate-400 font-semibold">
                          Không tìm thấy hành trình nào cho ngày cụ thể này
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sessions View */}
                  {activeTab === "sessions" && (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                          <th className="p-3">Khách Hàng</th>
                          <th className="p-3">Khu Vực (Zone)</th>
                          <th className="p-3">Camera ID</th>
                          <th className="p-3">Local Track ID</th>
                          <th className="p-3">Thời gian Ghé</th>
                          <th className="p-3">Thời gian Rời</th>
                          <th className="p-3 text-right">Dữ Liệu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {sessionsData.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/50">
                            <td className="p-3 flex items-center gap-2">
                              <img
                                src={row.customerImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                alt=""
                              />
                              <span>{row.customerName || "Khách Vãng Lai"}</span>
                            </td>
                            <td className="p-3">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                                {row.zone}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">{row.cameraId}</td>
                            <td className="p-3 text-slate-400 text-[10px]">{row.localTrackId}</td>
                            <td className="p-3 text-slate-500">{formatTime(row.startedAt)}</td>
                            <td className="p-3 text-slate-500">{formatTime(row.endedAt)}</td>
                            <td className="p-3 text-right text-slate-400 text-[9px] uppercase font-bold">{row.dataOrigin}</td>
                          </tr>
                        ))}
                        {sessionsData.length === 0 && (
                          <tr>
                            <td colSpan="7" className="p-6 text-center text-slate-400">Không tìm thấy lượt ghé nào</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* Events View */}
                  {activeTab === "events" && (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                          <th className="p-3">Khách Hàng</th>
                          <th className="p-3">Khu Vực (Zone)</th>
                          <th className="p-3">Biểu cảm (Raw)</th>
                          <th className="p-3">Trạng thái Cảm xúc</th>
                          <th className="p-3 text-center">Độ Tin Cậy</th>
                          <th className="p-3">Thời gian ghi nhận</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {eventsData.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/50">
                            <td className="p-3 flex items-center gap-2">
                              <img
                                src={row.customerImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                alt=""
                              />
                              <span>{row.customerName || "Khách Vãng Lai"}</span>
                            </td>
                            <td className="p-3">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                                {row.zone}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400">
                              {row.rawExpression} ({Math.round(row.rawExpressionConfidence * 100)}%)
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                                row.experienceState === "DELIGHTED" ? "bg-emerald-100 text-emerald-800" :
                                row.experienceState === "ENGAGED" ? "bg-blue-100 text-blue-800" :
                                row.experienceState === "CONFUSED" ? "bg-yellow-100 text-yellow-800" :
                                row.experienceState === "IMPATIENT" ? "bg-orange-100 text-orange-800" :
                                row.experienceState === "DISSATISFIED" ? "bg-red-100 text-red-800" :
                                "bg-slate-100 text-slate-800"
                              }`}>
                                {row.experienceState}
                              </span>
                            </td>
                            <td className="p-3 text-center text-slate-500">
                              {Math.round(row.stateConfidence * 100)}%
                            </td>
                            <td className="p-3 text-slate-500">{formatTime(row.observedAt)}</td>
                          </tr>
                        ))}
                        {eventsData.length === 0 && (
                          <tr>
                            <td colSpan="6" className="p-6 text-center text-slate-400">Không tìm thấy biểu cảm nào</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* Orders View */}
                  {activeTab === "orders" && (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                          <th className="p-3">SO ID</th>
                          <th className="p-3">Khách Hàng</th>
                          <th className="p-3">Số Điện Thoại</th>
                          <th className="p-3">Tên Sản Phẩm</th>
                          <th className="p-3">Giá Trị</th>
                          <th className="p-3">Chi Nhánh</th>
                          <th className="p-3 text-right">Nhân Viên</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {ordersData.map((order, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-bold text-blue-600">{order.id}</td>
                            <td className="p-3 font-bold text-slate-900">{order.name}</td>
                            <td className="p-3 text-slate-500 font-mono">{order.phone}</td>
                            <td className="p-3">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                {order.productName}
                              </span>
                            </td>
                            <td className="p-3 font-extrabold text-slate-900">
                              {order.amount > 0 ? (
                                <span>{(order.amount * 1000).toLocaleString("vi-VN")} đ</span>
                              ) : (
                                <span className="text-slate-400">0 đ</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                                {order.agency}
                              </span>
                            </td>
                            <td className="p-3 text-right text-slate-500 font-medium">{order.assigned}</td>
                          </tr>
                        ))}
                        {ordersData.length === 0 && (
                          <tr>
                            <td colSpan="7" className="p-6 text-center text-slate-400 font-semibold">
                              Không tìm thấy đơn hàng nào
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* Deltas View */}
                  {activeTab === "deltas" && (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                          <th className="p-3">Khách Hàng</th>
                          <th className="p-3">Mã Đơn Hàng</th>
                          <th className="p-3">Trước Mua</th>
                          <th className="p-3">Sau Mua</th>
                          <th className="p-3 text-center">Biến Động Delta</th>
                          <th className="p-3 text-center">Trạng Thái Phục Vụ</th>
                          <th className="p-3 text-right">Tính Toán Lúc</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {deltasData.map((row) => (
                          <tr key={row.orderId} className="hover:bg-slate-50/50">
                            <td className="p-3 flex items-center gap-2">
                              <img
                                src={row.customerImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                alt=""
                              />
                              <span>{row.customerName}</span>
                            </td>
                            <td className="p-3 text-blue-600 font-bold">{row.orderCode}</td>
                            <td className="p-3">
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                                {row.prePurchaseState}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                                {row.postPurchaseState}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`font-bold ${row.experienceDelta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                {row.experienceDelta >= 0 ? "+" : ""}{row.experienceDelta.toFixed(2)}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`text-[10px] font-bold uppercase ${
                                row.experienceDelta > 0.3 ? "text-emerald-500" :
                                row.experienceDelta < 0 ? "text-rose-500" : "text-slate-400"
                              }`}>
                                {row.experienceDelta > 0.3 ? "Tốt (Tăng Hài Lòng)" :
                                 row.experienceDelta < 0 ? "Cần Cải Thiện" : "Bình Thường"}
                              </span>
                            </td>
                            <td className="p-3 text-right text-slate-500">{formatTime(row.calculatedAt)}</td>
                          </tr>
                        ))}
                        {deltasData.length === 0 && (
                          <tr>
                            <td colSpan="7" className="p-6 text-center text-slate-400">Không tìm thấy đơn đối soát nào</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* Alerts View */}
                  {activeTab === "alerts" && (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                          <th className="p-3">Mã Cảnh Báo</th>
                          <th className="p-3">Khu Vực & Camera</th>
                          <th className="p-3">Loại Cảnh Báo</th>
                          <th className="p-3 text-center">Đo Được (Ngưỡng)</th>
                          <th className="p-3">Giải Pháp Đề Xuất</th>
                          <th className="p-3 text-right">Mức Độ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {alertLogs.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-bold text-rose-600">{row.id}</td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{row.zone}</div>
                              <div className="text-[10px] text-slate-400">{row.camera}</div>
                            </td>
                            <td className="p-3 text-slate-600 font-semibold">{row.type}</td>
                            <td className="p-3 text-center font-bold">
                              <span className="text-rose-600">{row.value}</span>
                              <span className="text-slate-400 font-medium text-[10px]"> ({row.threshold})</span>
                            </td>
                            <td className="p-3 text-slate-500 font-medium text-[11px] max-w-sm">
                              {row.action}
                            </td>
                            <td className="p-3 text-right">
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                row.level === "CRITICAL" ? "bg-rose-100 text-rose-800 animate-pulse" : "bg-amber-100 text-amber-800"
                              }`}>
                                {row.level}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Promotion Add/Edit Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col font-sans transition-all">
            {/* Modal Header */}
            <div className="bg-[#1e293b] px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-sm tracking-wide">
                {editingPromo ? `Cập nhật Khuyến mãi ${editingPromo.code}` : "Tạo Khuyến Mãi Mới"}
              </h3>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 flex-1 text-xs font-semibold text-slate-700">
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1.5">Mã Khuyến Mãi</label>
                <input
                  type="text"
                  value={promoFormData.code}
                  disabled={!!editingPromo}
                  onChange={(e) => setPromoFormData(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1.5">Tên chương trình</label>
                <input
                  type="text"
                  value={promoFormData.name}
                  onChange={(e) => setPromoFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1.5">Sản phẩm áp dụng</label>
                <select
                  value={promoFormData.appliedProduct}
                  onChange={(e) => setPromoFormData(prev => ({ ...prev, appliedProduct: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">Tất cả sản phẩm (Toàn chi nhánh)</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1.5">Hình thức</label>
                  <select
                    value={promoFormData.type}
                    onChange={(e) => setPromoFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Giảm giá">Giảm tiền mặt (đ)</option>
                    <option value="Phần trăm">Phần trăm (%)</option>
                    <option value="Quà tặng">Quà tặng</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1.5">Mức giảm / Quà</label>
                  <input
                    type="text"
                    value={promoFormData.value}
                    onChange={(e) => setPromoFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Ví dụ: 50.000 đ hoặc 15%"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1.5">Điều kiện biểu cảm kích hoạt</label>
                <select
                  value={promoFormData.trigger}
                  onChange={(e) => setPromoFormData(prev => ({ ...prev, trigger: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="DELIGHTED">DELIGHTED (Rất hài lòng)</option>
                  <option value="ENGAGED">ENGAGED (Hứng thú)</option>
                  <option value="NEUTRAL">NEUTRAL (Trung tính)</option>
                  <option value="CONFUSED">CONFUSED (Phân vân)</option>
                  <option value="IMPATIENT">IMPATIENT (Sốt ruột)</option>
                  <option value="DISSATISFIED">DISSATISFIED (Thất vọng)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1.5">Trạng thái</label>
                <select
                  value={promoFormData.status}
                  onChange={(e) => setPromoFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Active">Hoạt động (Active)</option>
                  <option value="Inactive">Tạm dừng (Inactive)</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-wider"
              >
                Hủy
              </button>
              <button
                onClick={handleSavePromo}
                className="bg-blue-600 text-white hover:bg-blue-700 transition-colors px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
