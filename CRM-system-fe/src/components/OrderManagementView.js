"use client";

import React from "react";

export default function OrderManagementView({ orders, searchTerm, onSearch }) {
  return (
    <div className="flex-1 bg-slate-50 flex flex-col h-full font-sans">
      {/* Header toolbar */}
      <div className="bg-white border-b border-slate-200 py-3 px-6 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by name, phone, product or agent..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 focus:bg-white text-slate-700"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18"></path>
            </svg>
            <span>Refresh</span>
          </button>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">SO ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Delivery Service</th>
                  <th className="py-3 px-4">Product Cross Sell</th>
                  <th className="py-3 px-4">Affiliate ID</th>
                  <th className="py-3 px-4">Sub ID 1</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Agency</th>
                  <th className="py-3 px-4">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="py-8 text-center text-slate-400 font-medium">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  orders.map((order, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-blue-600">{order.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{order.name}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{order.phone}</td>
                      <td className="py-3 px-4"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">{order.productName}</span></td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.deliveryService === "DHL" 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {order.deliveryService}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{order.crossSell || "-"}</td>
                      <td className="py-3 px-4 font-medium">{order.affiliateId}</td>
                      <td className="py-3 px-4 text-slate-500">{order.subId1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {order.amount > 0 ? (
                          <span className="flex items-center gap-1">
                            <span className="bg-blue-50 text-blue-700 text-[10px] px-1 py-0.2 rounded font-extrabold">RM</span>
                            {order.amount}
                          </span>
                        ) : (
                          <span className="text-slate-400">RM 0</span>
                        )}
                      </td>
                      <td className="py-3 px-4"><span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{order.agency}</span></td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{order.assigned}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer pagination */}
          <div className="bg-white border-t border-slate-200 py-3.5 px-6 flex items-center justify-between text-xs text-slate-500 font-medium">
            <div>
              Showing <span className="text-slate-700 font-semibold">{orders.length}</span> of <span className="text-slate-700 font-semibold">{orders.length}</span> entries
            </div>
            <div className="flex items-center gap-1">
              <button disabled className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed">Previous</button>
              <button className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold shadow-sm shadow-blue-100">1</button>
              <button className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
