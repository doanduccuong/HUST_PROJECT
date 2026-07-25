"use client";

import React from "react";

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function SalesPerformanceView({ vm }) {
  const data = vm.data;
  return (
    <div className="min-h-full bg-slate-50">
      <div className="bg-[#2a4d60] px-6 py-4">
        <h1 className="text-xl font-semibold text-white">Hiệu suất Sale</h1>
        <p className="mt-1 text-xs text-slate-300">
          Chỉ tính doanh thu từ đơn có trạng thái PAID; không dùng Revenue 1 trong products.xlsx.
        </p>
      </div>
      <div className="p-6 space-y-5">
        {vm.loading && <p className="text-sm text-slate-500">Đang tải dữ liệu…</p>}
        {vm.error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {vm.error}
          </div>
        )}
        {data && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                ["Doanh thu đã trả", formatMoney(data.paidRevenue)],
                ["Đơn đã trả", data.paidOrders],
                ["Tổng đơn", data.totalOrders],
                ["Tỷ lệ paid", `${data.paidConversionRate.toFixed(1)}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[11px] uppercase font-semibold text-slate-400">{label}</p>
                  <p className="mt-2 text-xl font-bold text-slate-800">{value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Sale</th>
                    <th className="px-4 py-3">Chuyên môn chính</th>
                    <th className="px-4 py-3 text-right">Đơn / Paid</th>
                    <th className="px-4 py-3 text-right">Doanh thu paid</th>
                    <th className="px-4 py-3 text-right">AOV</th>
                    <th className="px-4 py-3 text-right">Conversion</th>
                    <th className="px-4 py-3 text-right">Tương tác</th>
                    <th className="px-4 py-3 text-right">Cuộc gọi</th>
                    <th className="px-4 py-3 text-right">Δ trải nghiệm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.sales.map((sale) => (
                    <tr key={sale.staffId} className="text-slate-600">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-800">{sale.name || sale.username}</p>
                        <p className="text-xs text-slate-400">@{sale.username}</p>
                      </td>
                      <td className="px-4 py-4">{sale.specialty}</td>
                      <td className="px-4 py-4 text-right">{sale.orderCount} / {sale.paidOrderCount}</td>
                      <td className="px-4 py-4 text-right font-semibold">{formatMoney(sale.paidRevenue)}</td>
                      <td className="px-4 py-4 text-right">{formatMoney(sale.averagePaidOrderValue)}</td>
                      <td className="px-4 py-4 text-right">{sale.paidConversionRate.toFixed(1)}%</td>
                      <td className="px-4 py-4 text-right">{sale.interactionCount}</td>
                      <td className="px-4 py-4 text-right">{sale.callsHandled}</td>
                      <td className={`px-4 py-4 text-right font-semibold ${
                        (sale.averageExperienceDelta || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {sale.averageExperienceDelta == null
                          ? "—"
                          : sale.averageExperienceDelta.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
