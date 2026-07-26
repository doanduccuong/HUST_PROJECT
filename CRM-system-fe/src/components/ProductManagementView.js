"use client";

import React, { useState } from "react";

export default function ProductManagementView({ products = [], onUpdateProduct }) {
  const [selectedCountry, setSelectedCountry] = useState("VN");
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Local state for product shelf locations mapping
  const [shelves, setShelves] = useState({
    953: "Bàn trải nghiệm A1",
    951: "Tủ trưng bày B2 (Điện thoại cũ)",
    949: "Kệ phụ kiện C3",
    948: "Kệ trưng bày D4 (Máy tính)",
    1: "Bàn trải nghiệm A1",
    2: "Bàn trải nghiệm A2",
    3: "Kệ phụ kiện C1",
    4: "Tủ trưng bày D1"
  });

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalData, setModalData] = useState({
    name: "",
    code: "",
    category: "",
    commercialName: "",
    price: "",
    status: "Active",
    shelf: ""
  });

  // Filter products by country (defaulting to VN) and search term
  const filteredProducts = products.filter((prod) => {
    const matchesCountry = selectedCountry ? prod.country === selectedCountry || !prod.country : true;
    
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (prod.name && prod.name.toLowerCase().includes(term)) ||
      (prod.code && prod.code.toLowerCase().includes(term)) ||
      (prod.category && prod.category.toLowerCase().includes(term)) ||
      (prod.commercialName && prod.commercialName.toLowerCase().includes(term));
      
    return matchesCountry && matchesSearch;
  });

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  
  // Slice and attach shelf mapping dynamically
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex).map(p => ({
    ...p,
    shelf: shelves[p.id] || "Kệ kho tổng"
  }));

  // Edit action handler
  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setModalData({
      name: prod.name,
      code: prod.code,
      category: prod.category,
      commercialName: prod.commercialName,
      price: prod.price.join(","),
      status: prod.status,
      shelf: shelves[prod.id] || "Kệ kho tổng"
    });
    setIsEditModalOpen(true);
  };

  const handleModalSave = async () => {
    if (!editingProduct || !onUpdateProduct) return;
    
    // Save shelf locally in state
    setShelves(prev => ({
      ...prev,
      [editingProduct.id]: modalData.shelf
    }));

    const result = await onUpdateProduct(editingProduct.id, {
      ...modalData,
      price: modalData.price.split(",").map(p => p.trim()).filter(Boolean)
    });
    
    if (result && result.success) {
      setIsEditModalOpen(false);
      setEditingProduct(null);
    } else {
      alert("Failed to update product: " + (result?.error || "Unknown error"));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans relative">
      {/* Top Filter and Action Bar */}
      <div className="bg-[#1e293b] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              Quốc gia / Chi nhánh *
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-800 text-white text-xs rounded border border-slate-700 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 font-semibold"
            >
              <option value="VN">Vietnam (Hà Nội)</option>
              <option value="SG">Singapore</option>
              <option value="MY">Malaysia</option>
              <option value="TH">Thailand</option>
              <option value="PE">Peru</option>
            </select>
          </div>
        </div>

        <button className="bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded shadow-md flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
          </svg>
          Thêm Sản phẩm
        </button>
      </div>

      {/* Main Table Container */}
      <div className="m-6 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        {/* Table Title and Search Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Danh sách sản phẩm chi nhánh</h2>
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded-md pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase bg-slate-50 tracking-wider">
                <th className="py-4 px-6">Mã sản phẩm</th>
                <th className="py-4 px-6">Code</th>
                <th className="py-4 px-6">Phân loại</th>
                <th className="py-4 px-6">Tên sản phẩm</th>
                <th className="py-4 px-6">Mô tả</th>
                <th className="py-4 px-6">Vị trí kệ hàng</th>
                <th className="py-4 px-6">Giá (VNĐ)</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-blue-600">
                      {prod.id}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {prod.code || "—"}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {prod.category || "—"}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {prod.name}
                    </td>
                    <td className="py-4 px-6 text-slate-500 max-w-xs truncate" title={prod.commercialName}>
                      {prod.commercialName}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-blue-50 text-blue-800 text-[10px] px-2.5 py-1 rounded font-bold border border-blue-100">
                        {prod.shelf}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {prod.price.map((pr, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px] border border-slate-200"
                          >
                            {(Number(pr) * 1000).toLocaleString("vi-VN")} đ
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          prod.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {prod.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleEditClick(prod)}
                        className="text-slate-400 hover:text-blue-600 hover:bg-slate-100 p-1.5 rounded transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    Không tìm thấy sản phẩm nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>Dòng hiển thị:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-1.5 py-1 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <span>
            {totalItems > 0 ? `${startIndex + 1}-${endIndex} của ${totalItems}` : "0-0 của 0"}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col font-sans transition-all transform scale-100">
            {/* Modal Header */}
            <div className="bg-[#1e293b] px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-sm tracking-wide">Cập nhật sản phẩm #{editingProduct?.id}</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên sản phẩm</label>
                <input
                  type="text"
                  value={modalData.name}
                  onChange={(e) => setModalData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Code</label>
                  <input
                    type="text"
                    value={modalData.code}
                    onChange={(e) => setModalData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phân loại</label>
                  <input
                    type="text"
                    value={modalData.category}
                    onChange={(e) => setModalData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mô tả sản phẩm</label>
                <input
                  type="text"
                  value={modalData.commercialName}
                  onChange={(e) => setModalData(prev => ({ ...prev, commercialName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Vị trí kệ hàng</label>
                <input
                  type="text"
                  value={modalData.shelf}
                  onChange={(e) => setModalData(prev => ({ ...prev, shelf: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mức Giá (Cách nhau bởi dấu phẩy)</label>
                <input
                  type="text"
                  value={modalData.price}
                  onChange={(e) => setModalData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Ví dụ: 149,169,199"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Trạng thái</label>
                <select
                  value={modalData.status}
                  onChange={(e) => setModalData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active (Hoạt động)</option>
                  <option value="Inactive">Inactive (Dừng)</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-wider"
              >
                Hủy
              </button>
              <button
                onClick={handleModalSave}
                className="bg-blue-600 text-white hover:bg-blue-700 transition-colors px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Lưu Thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
