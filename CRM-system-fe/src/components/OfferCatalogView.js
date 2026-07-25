"use client";

import React from "react";

function goalValue(value, currency) {
  if (value == null) return "—";
  return `${value.toLocaleString("vi-VN")} ${currency || ""}`.trim();
}

export default function OfferCatalogView({ vm }) {
  return (
    <div className="min-h-full bg-slate-50">
      <div className="bg-[#2a4d60] px-6 py-4">
        <h1 className="text-xl font-semibold text-white">Offer Catalog</h1>
        <p className="mt-1 text-xs text-slate-300">
          Đồng bộ từ products.xlsx; tách biệt với lịch sử đơn hàng CRM.
        </p>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            value={vm.search}
            onChange={(event) => vm.setSearch(event.target.value)}
            placeholder="Tìm offer, advertiser hoặc tag…"
            className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-500"
          />
          {vm.data && (
            <div className="flex gap-4 text-xs">
              <span>Tổng <b>{vm.data.total}</b></span>
              <span className="text-emerald-600">Active <b>{vm.data.active}</b></span>
              <span className="text-slate-500">Inactive <b>{vm.data.inactive}</b></span>
            </div>
          )}
        </div>
        {vm.error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{vm.error}</div>}
        {vm.data && (
          <>
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              {vm.data.revenueFieldMeaning}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID / Offer</th>
                    <th className="px-4 py-3">Advertiser</th>
                    <th className="px-4 py-3">Category / Tag</th>
                    <th className="px-4 py-3">Goal</th>
                    <th className="px-4 py-3 text-right">Revenue config</th>
                    <th className="px-4 py-3 text-right">Payout config</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vm.data.offers.map((offer) => (
                    <tr key={offer.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{offer.name}</p>
                        <p className="text-xs text-slate-400">#{offer.id}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{offer.advertiser || "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {offer.tags || offer.categories || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{offer.goalType || "—"}</td>
                      <td className="px-4 py-3 text-right">{goalValue(offer.goalRevenue, offer.currency)}</td>
                      <td className="px-4 py-3 text-right">{goalValue(offer.goalPayout, offer.currency)}</td>
                      <td className={`px-4 py-3 text-right text-xs font-bold ${
                        offer.status === "Active" ? "text-emerald-600" : "text-slate-400"
                      }`}>
                        {offer.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {vm.loading && <p className="text-sm text-slate-400">Đang tải offer…</p>}
      </div>
    </div>
  );
}
