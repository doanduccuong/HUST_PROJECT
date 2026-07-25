"use client";

import React from "react";

const stateStyles = {
  DELIGHTED: "bg-emerald-100 text-emerald-700",
  ENGAGED: "bg-blue-100 text-blue-700",
  CONFUSED: "bg-amber-100 text-amber-700",
  IMPATIENT: "bg-orange-100 text-orange-700",
  DISSATISFIED: "bg-rose-100 text-rose-700",
  NEUTRAL: "bg-slate-100 text-slate-700",
};

const statusLabels = {
  MATCH: "Đã nhận diện",
  REVIEW: "Cần quản lý xác nhận",
  NEW_CUSTOMER: "Khách hàng mới",
  QUALITY_REJECTED: "Ảnh không đạt chất lượng",
};

function formatDate(value) {
  return value ? new Date(value).toLocaleString("vi-VN") : "—";
}

function formatMoney(value, currency = "USD") {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function PercentageBar({ label, value }) {
  const percent = Math.max(0, Math.min(100, (value || 0) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-slate-500">
        <span className="capitalize">{label}</span>
        <span>{percent.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function Profile360({ profile }) {
  const current = profile.currentExperience;
  const customer = profile.customer;

  return (
    <section className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Customer 360
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{customer.name}</h2>
            <p className="text-sm text-slate-500">
              ID #{customer.id} · {customer.gender || "Chưa có giới tính"} ·{" "}
              {customer.age ? `${customer.age} tuổi` : "Chưa có tuổi"}
            </p>
          </div>
          {current && (
            <div className="text-right">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                stateStyles[current.experienceState] || stateStyles.NEUTRAL
              }`}>
                {current.experienceState || "NEUTRAL"}
              </span>
              <p className="mt-2 text-xs text-slate-500">
                Biểu cảm: <b className="capitalize">{current.rawExpression || "unknown"}</b>
              </p>
              <p className="text-[11px] text-slate-400">{formatDate(current.observedAt)}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {[
            ["Đơn hàng", profile.commerce.orderCount],
            ["Đã thanh toán", profile.commerce.paidOrderCount],
            ["Doanh thu thực", formatMoney(profile.commerce.paidRevenue)],
            ["Giá trị TB", formatMoney(profile.commerce.averagePaidOrderValue)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] uppercase font-semibold text-slate-400">{label}</p>
              <p className="mt-1 font-bold text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-800">Lịch sử mua hàng</h3>
          <div className="mt-4 space-y-3">
            {profile.orders.length === 0 && (
              <p className="text-sm text-slate-400">Chưa có đơn hàng được gắn với khách này.</p>
            )}
            {profile.orders.map((order) => (
              <div key={order.id} className="border-b border-slate-100 pb-3 last:border-0">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {order.productName || "Sản phẩm chưa xác định"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.code} · Sale: {order.assignedSale || "Chưa gán"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">
                      {formatMoney(order.amount, order.currency)}
                    </p>
                    <p className="text-[11px] font-semibold text-blue-600">{order.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-800">Sale đã tư vấn</h3>
          <div className="mt-4 space-y-3">
            {profile.salesInteractions.length === 0 && (
              <p className="text-sm text-slate-400">Chưa có interaction của sale.</p>
            )}
            {profile.salesInteractions.map((interaction) => (
              <div key={interaction.id} className="rounded-xl bg-slate-50 p-3">
                <div className="flex justify-between">
                  <p className="text-sm font-semibold text-slate-700">{interaction.saleName}</p>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(interaction.startedAt)}
                  </span>
                </div>
                <p className="text-xs text-blue-600">
                  {interaction.interactionType} · {interaction.channel}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {interaction.outcome || interaction.notes || "Không có ghi chú"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-slate-800">Cảm xúc trước và sau mua hàng</h3>
        <p className="text-xs text-slate-400 mt-1">
          So sánh theo cửa sổ thời gian quanh sự kiện thanh toán, không dùng một frame đơn lẻ.
        </p>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          {profile.purchaseExperienceHistory.length === 0 && (
            <p className="text-sm text-slate-400">Chưa đủ evidence để tạo bản tổng hợp.</p>
          )}
          {profile.purchaseExperienceHistory.map((item) => (
            <div key={item.orderId} className="rounded-xl border border-slate-100 p-4">
              <div className="flex justify-between text-xs">
                <b className="text-slate-700">{item.orderCode}</b>
                <span className={item.delta >= 0 ? "text-emerald-600" : "text-rose-600"}>
                  Δ {item.delta == null ? "—" : item.delta.toFixed(2)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                <span className={`px-2 py-1 rounded ${stateStyles[item.prePurchaseState] || stateStyles.NEUTRAL}`}>
                  {item.prePurchaseState || "N/A"}
                </span>
                <span className="text-slate-300">→</span>
                <span className={`px-2 py-1 rounded ${stateStyles[item.postPurchaseState] || stateStyles.NEUTRAL}`}>
                  {item.postPurchaseState || "N/A"}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                {item.evidenceCount} evidence · confidence {(item.confidence * 100).toFixed(0)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function FaceSearchView({ vm }) {
  const result = vm.searchResult;

  return (
    <div className="min-h-full bg-slate-50">
      <div className="bg-[#2a4d60] px-6 py-4">
        <h1 className="text-xl font-semibold text-white">Tìm khách bằng khuôn mặt</h1>
        <p className="mt-1 text-xs text-slate-300">
          Import ảnh thật; camera, zone và thời gian demo là metadata mô phỏng riêng.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Ảnh truy vấn</span>
              <span className="mt-1 block text-xs text-slate-400">
                JPEG/PNG/WebP, tối đa 10 MB, đúng một khuôn mặt.
              </span>
              <input
                className="mt-4 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => vm.selectFile(event.target.files?.[0])}
              />
            </label>
            <div className="mt-4 aspect-square rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
              {vm.previewUrl ? (
                // Blob preview is local-only and is never used as recognition output.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vm.previewUrl} alt="Ảnh khuôn mặt đã chọn" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-slate-400">Chưa chọn ảnh</span>
              )}
            </div>
            <button
              type="button"
              disabled={!vm.file || vm.loading}
              onClick={vm.identify}
              className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-700"
            >
              {vm.loading ? "Đang phân tích…" : "Nhận diện khách hàng"}
            </button>
          </div>

          <div className="space-y-5">
            {!result && !vm.error && (
              <div className="h-full min-h-[360px] border border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-center p-8">
                <div>
                  <p className="font-semibold text-slate-600">Kết quả sẽ hiện tại đây</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Hệ thống trả top candidate; kết quả mơ hồ luôn cần quản lý xác nhận.
                  </p>
                </div>
              </div>
            )}
            {vm.error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {vm.error}
              </div>
            )}
            {result && (
              <>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase font-semibold text-slate-400">Quyết định</p>
                      <p className="mt-1 text-lg font-bold text-slate-800">
                        {statusLabels[result.status]}
                      </p>
                      <p className="text-[11px] text-slate-400">searchId: {result.searchId}</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <p className="text-[10px] uppercase text-slate-400">Biểu cảm thô</p>
                        <p className="font-bold capitalize text-slate-700">
                          {result.currentExpression.dominant}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {(result.currentExpression.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <p className="text-[10px] uppercase text-slate-400">Trải nghiệm</p>
                        <span className={`mt-1 inline-flex px-2 py-1 rounded text-xs font-bold ${
                          stateStyles[result.currentExperience.state] || stateStyles.NEUTRAL
                        }`}>
                          {result.currentExperience.state}
                        </span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <p className="text-[10px] uppercase text-slate-400">Chất lượng ảnh</p>
                        <p className="font-bold text-slate-700">
                          {(result.quality.score * 100).toFixed(0)}%
                        </p>
                        <p className={`text-[11px] ${result.quality.accepted ? "text-emerald-600" : "text-rose-600"}`}>
                          {result.quality.accepted ? "Đạt" : "Không đạt"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(result.currentExpression.probabilities)
                      .sort(([, left], [, right]) => right - left)
                      .slice(0, 4)
                      .map(([label, value]) => (
                        <PercentageBar key={label} label={label} value={value} />
                      ))}
                  </div>
                  <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                    {result.currentExperience.limitation}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800">Top candidate</h3>
                  <div className="mt-3 space-y-2">
                    {result.candidates.length === 0 && (
                      <p className="text-sm text-slate-400">
                        Không có candidate phù hợp. Có thể đăng ký như khách mới.
                      </p>
                    )}
                    {result.candidates.map((candidate, index) => (
                      <div
                        key={candidate.customerId}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-700">
                            #{index + 1} {candidate.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            ID {candidate.customerId} · distance {candidate.distance.toFixed(4)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-blue-600">
                            {(candidate.similarity * 100).toFixed(1)}%
                          </span>
                          <button
                            type="button"
                            onClick={() => vm.confirmCandidate(candidate.customerId)}
                            disabled={vm.loading}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                          >
                            Xác nhận & mở 360
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {vm.profileLoading && (
          <div className="rounded-xl bg-white p-5 text-sm text-slate-500 shadow-sm">
            Đang tải Customer 360…
          </div>
        )}
        {vm.profile && <Profile360 profile={vm.profile} />}
      </div>
    </div>
  );
}
