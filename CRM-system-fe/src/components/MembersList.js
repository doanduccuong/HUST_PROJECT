"use client";

import { useState } from "react";

export default function MembersList({ customers, loading, error, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Danh sách thành viên</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách khách hàng và các mẫu ảnh khuôn mặt đã đăng ký.</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3.5 py-2 rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L21 4"></path>
          </svg>
          Làm mới danh sách
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm thành viên theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
        />
      </div>

      {/* Loading & Error States */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-800 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Đang tải danh sách thành viên...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-xl">
          <p className="text-slate-400 text-sm">Không tìm thấy thành viên nào trùng khớp.</p>
        </div>
      ) : (
        /* Table Container */
        <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-[500px]">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Ảnh</th>
                <th className="px-6 py-4">Họ và Tên</th>
                <th className="px-6 py-4">Giới tính</th>
                <th className="px-6 py-4">Tuổi</th>
                <th className="px-6 py-4">Ngày đăng ký</th>
                <th className="px-6 py-4 text-center">Số ảnh đối chiếu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-400">#{c.id}</td>
                  <td className="px-6 py-4">
                    {c.user_image ? (
                      <a href={c.user_image} target="_blank" rel="noopener noreferrer" title="Click để xem ảnh gốc">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={c.user_image} 
                          alt={c.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm hover:scale-110 active:scale-95 transition-all cursor-zoom-in"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{ display: 'none' }} className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">
                          {c.name ? c.name.split(" ").slice(-1)[0][0] : "?"}
                        </div>
                      </a>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs">
                        {c.name ? c.name.split(" ").slice(-1)[0][0] : "?"}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      c.gender === "Male" 
                        ? "bg-blue-50 text-blue-700" 
                         : "bg-pink-50 text-pink-700"
                    }`}>
                      {c.gender === "Male" ? "Nam" : "Nữ"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{c.age} tuổi</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }) : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      c.photo_count > 1 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    }`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {c.photo_count} ảnh
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
