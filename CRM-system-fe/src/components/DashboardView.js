"use client";

import React from "react";

export default function DashboardView({ stats, onNavigate, specificDate, onDateChange }) {
  const retail = stats?.retailAnalytics;

  const totalVisitors = retail?.totalVisitors || stats?.totalMembers || 1273;

  // Retail Emotion KPIs
  const cbiValue = retail?.cbi !== undefined ? Number(retail.cbi) : 7.0;
  const ibiValue = retail?.ibi !== undefined ? Number(retail.ibi) : 6.0;
  const driValue = retail?.dri !== undefined ? Number(retail.dri) : 3.1;
  const edcValue = retail?.edc !== undefined ? Number(retail.edc) : 65.5;

  const kpis = [
    {
      title: "Tổng Lượng Khách",
      value: totalVisitors.toLocaleString(),
      label: "Lượt ghé cửa hàng",
      textColor: "text-slate-800",
      status: "Bình thường",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "Chỉ số Phân vân (CBI)",
      value: `${cbiValue.toFixed(1)}%`,
      label: "Mục tiêu: <= 8.0%",
      textColor: "text-blue-600",
      status: "Tốt",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "Chỉ số Sốt ruột (IBI)",
      value: `${ibiValue.toFixed(1)}%`,
      label: "Mục tiêu: <= 5.0%",
      textColor: "text-amber-600",
      status: "Cảnh báo",
      statusColor: "bg-amber-100 text-amber-800 animate-pulse",
    },
    {
      title: "Chỉ số Không Hài Lòng (DRI)",
      value: `${driValue.toFixed(1)}%`,
      label: "Mục tiêu: <= 6.0%",
      textColor: "text-emerald-600",
      status: "Rất Tốt",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "Tỷ lệ Chuyển đổi Hài lòng (EDC)",
      value: `${edcValue.toFixed(1)}%`,
      label: "Engage -> Delighted",
      textColor: "text-violet-600",
      status: "Tốt",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
  ];

  // Emotion segments for Donut chart
  const emotions = [
    { label: "Delighted (Rất hài lòng)", pct: retail?.emotions?.delighted?.pct ?? 45, val: retail?.emotions?.delighted?.val ?? 572, color: "#10b981" },
    { label: "Engaged (Hứng thú)", pct: retail?.emotions?.engaged?.pct ?? 28, val: retail?.emotions?.engaged?.val ?? 356, color: "#3b82f6" },
    { label: "Neutral (Trung tính)", pct: retail?.emotions?.neutral?.pct ?? 11, val: retail?.emotions?.neutral?.val ?? 140, color: "#6b7280" },
    { label: "Confused (Phân vân)", pct: retail?.emotions?.confused?.pct ?? 7, val: retail?.emotions?.confused?.val ?? 89, color: "#eab308" },
    { label: "Impatient (Sốt ruột)", pct: retail?.emotions?.impatient?.pct ?? 6, val: retail?.emotions?.impatient?.val ?? 76, color: "#f97316" },
    { label: "Dissatisfied (Tệ)", pct: retail?.emotions?.dissatisfied?.pct ?? 3, val: retail?.emotions?.dissatisfied?.val ?? 40, color: "#ef4444" },
  ];

  // Calculate coordinates/offsets for visual representation
  const circ = 314.16; // for r=50
  let accumulatedPercent = 0;

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans">
      {/* Title Header Bar */}
      <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] px-6 py-5 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-white text-xl font-bold tracking-wide">
            Báo cáo Hành trình Trải nghiệm & Cảm xúc Khách hàng
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Hệ thống đối soát camera thời gian thực, đánh giá chất lượng vận hành chi nhánh
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 font-medium">
            Phân tích AI: Active
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase">Bộ lọc</span>
          
          <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Ngày phân tích:</span>
            <input
              type="date"
              value={specificDate || ""}
              onChange={(e) => onDateChange && onDateChange(e.target.value)}
              className="text-xs font-semibold text-slate-600 focus:outline-none bg-transparent cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
            {[
              { id: "today", label: "Hôm nay" },
              { id: "all", label: "Tất cả lịch sử" }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  if (onDateChange) {
                    if (p.id === "today") {
                      onDateChange(new Date().toISOString().split("T")[0]);
                    } else {
                      onDateChange("");
                    }
                  }
                }}
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
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm flex flex-col justify-between min-h-[150px] hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${kpi.statusColor}`}>
                  {kpi.status}
                </span>
              </div>
              <div className="my-3 flex flex-col justify-center">
                <span className={`text-4xl font-extrabold tracking-tight ${kpi.textColor}`}>
                  {kpi.value}
                </span>
              </div>
              <span className="text-slate-400 text-[11px] font-medium">
                {kpi.label}
              </span>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Emotion Distribution Donut (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-wide">
                Phân bổ Cảm xúc Khách hàng (6 Thái cực)
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Tỷ lệ phần trăm tính trên tổng lượng khách quét qua camera
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6">
              <div className="relative w-[160px] h-[160px]">
                <svg width="160" height="160" viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  {emotions.map((em, index) => {
                    const strokeOffset = circ - (em.pct / 100) * circ;
                    const strokeDashoffset = circ - (accumulatedPercent / 100) * circ;
                    accumulatedPercent += em.pct;
                    return (
                      <circle
                        key={index}
                        cx="60"
                        cy="60"
                        r="50"
                        fill="transparent"
                        stroke={em.color}
                        strokeWidth="12"
                        strokeDasharray={circ}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Tổng Mẫu Quét</span>
                  <span className="text-xl font-extrabold text-slate-800">{(retail?.totalEvents || 1273).toLocaleString()}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-1.5 w-full">
                {emotions.map((em, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: em.color }}></span>
                      <span>{em.label}</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">{em.pct}% ({em.val} lượt)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shift Capacity & Emotion Analysis (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-wide">
                Hiệu suất & Trải nghiệm Cảm xúc theo Ca Làm Việc
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Đối soát tỷ lệ bức xúc (Impatient) và công suất phục vụ
              </p>
            </div>

            <div className="overflow-x-auto my-4 flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5">Ca Làm Việc</th>
                    <th className="py-2.5">Khách Ghé</th>
                    <th className="py-2.5 text-center">Công Suất (Tải)</th>
                    <th className="py-2.5 text-center">Delight (Hài Lòng)</th>
                    <th className="py-2.5 text-center">Impatient (Sốt Ruột)</th>
                    <th className="py-2.5 text-right">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  <tr>
                    <td className="py-3 font-bold text-slate-900">Ca Sáng (08:00 - 15:00)</td>
                    <td className="py-3">{retail?.morningShift?.visitors ?? 420} khách</td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={retail?.morningShift?.capacity > 100 ? "bg-rose-500 h-full" : "bg-emerald-500 h-full"} style={{ width: `${retail?.morningShift?.capacity ?? 85}%` }}></div>
                        </div>
                        <span>{Number(retail?.morningShift?.capacity ?? 85).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-emerald-600">{Number(retail?.morningShift?.delight ?? 52).toFixed(1)}%</td>
                    <td className="py-3 text-center text-slate-500">{Number(retail?.morningShift?.impatient ?? 2.1).toFixed(1)}%</td>
                    <td className="py-3 text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        retail?.morningShift?.status === "Quá Tải" ? "bg-rose-100 text-rose-800 animate-pulse" :
                        retail?.morningShift?.status === "Không hoạt động" ? "bg-slate-100 text-slate-500" :
                        "bg-emerald-100 text-emerald-800"
                      }`}>
                        {retail?.morningShift?.status ?? "Ổn Định"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-900">Ca Tối (15:00 - 22:00)</td>
                    <td className="py-3">{retail?.eveningShift?.visitors ?? 853} khách</td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={retail?.eveningShift?.capacity > 100 ? "bg-rose-500 h-full" : "bg-emerald-500 h-full"} style={{ width: `${retail?.eveningShift?.capacity ?? 100}%` }}></div>
                        </div>
                        <span className={retail?.eveningShift?.capacity > 100 ? "text-rose-600 font-bold" : ""}>
                          {Number(retail?.eveningShift?.capacity ?? 108).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-slate-500">{Number(retail?.eveningShift?.delight ?? 41).toFixed(1)}%</td>
                    <td className="py-3 text-center text-rose-600 font-bold">{Number(retail?.eveningShift?.impatient ?? 11.4).toFixed(1)}%</td>
                    <td className="py-3 text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        retail?.eveningShift?.status === "Quá Tải" ? "bg-rose-100 text-rose-800 animate-pulse" :
                        retail?.eveningShift?.status === "Không hoạt động" ? "bg-slate-100 text-slate-500" :
                        "bg-emerald-100 text-emerald-800"
                      }`}>
                        {retail?.eveningShift?.status ?? "Quá Tải"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800 font-medium">
              <span className="font-bold">💡 Khuyến nghị tối ưu:</span> Ca Tối đang gặp tình trạng quá tải nghiêm trọng (108%) dẫn đến tỷ lệ khách hàng sốt ruột (Impatient) tăng vọt lên 11.4%. Chi nhánh cần điều phối thêm nhân sự hỗ trợ từ 17h00 - 20h00.
            </div>
          </div>
        </div>

        {/* Zone Alerts & Customer Journey Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Zone Performance & Alerts */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 tracking-wide">
              Theo dõi Cảnh báo & Hiệu suất theo Khu vực (Zones)
            </h3>
            <div className="space-y-3 font-semibold">
              {/* Tech Desk */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-rose-200 bg-rose-50/50">
                <div>
                  <h4 className="text-xs font-bold text-rose-900">Tech Service Desk (Quầy Kỹ Thuật / Dán Máy)</h4>
                  <p className="text-[10px] text-rose-700 mt-0.5">Chỉ số Impatience: {Number(retail?.techDeskIbi ?? 18.2).toFixed(1)}% (Vượt ngưỡng 5.0%)</p>
                </div>
                <div className="text-right">
                  <span className="bg-rose-100 text-rose-800 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                    Cảnh Báo Đỏ
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1">Dán máy/Cài đặt quá lâu</p>
                </div>
              </div>

              {/* Mobile Zone */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/50">
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Mobile Zone (Khu vực Tư vấn Điện thoại)</h4>
                  <p className="text-[10px] text-amber-700 mt-0.5">Chỉ số Confusion: {Number(retail?.mobileZoneCbi ?? 14.5).toFixed(1)}% (Vượt ngưỡng 8.0%)</p>
                </div>
                <div className="text-right">
                  <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                    Cảnh Báo Vàng
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1">Thủ tục Trade-in phức tạp</p>
                </div>
              </div>

              {/* Laptop Zone */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/30">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Laptop Zone (Khu vực Laptop)</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Chỉ số Confusion: 4.2% (Ngưỡng an toàn)</p>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                    Tốt
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1">Tư vấn rõ ràng</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Journey Aggregation Highlights */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1 tracking-wide">
                Hành trình Cảm xúc & Điểm chạm
              </h3>
              <p className="text-[11px] text-slate-400">
                Phân tích diễn tiến biểu cảm của khách hàng qua chuỗi camera giám sát hành trình
              </p>
            </div>
            
            <div className="flex-1 flex flex-col justify-center space-y-4 my-4">
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center"></span>
                  <h4 className="text-xs font-bold text-slate-800">Điểm Chạm Entrance (Cổng chào)</h4>
                  <p className="text-[10px] text-slate-500">
                    Biểu cảm khởi điểm: <span className="text-slate-900 font-semibold">Neutral (Trung tính)</span>. Khách bắt đầu bước vào.
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center"></span>
                  <h4 className="text-xs font-bold text-slate-800">Điểm Chạm Consulting & Product Zones</h4>
                  <p className="text-[10px] text-slate-500">
                    Trải nghiệm tương tác: <span className="text-slate-900 font-semibold">Engaged / Confused</span>. Thảo luận thông số máy và chính sách.
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center"></span>
                  <h4 className="text-xs font-bold text-slate-800">Điểm Chạm Checkout & Exit</h4>
                  <p className="text-[10px] text-slate-500">
                    Trải nghiệm đích: <span className="text-slate-900 font-semibold">Delighted (Vui vẻ/Hài lòng)</span>. Tỷ lệ chuyển đổi đạt mốc cao nhất khi được chăm sóc cuối hành trình.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <button 
                onClick={() => onNavigate("faceSearch")}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Mở Nhận diện khuôn mặt & 360° &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible System Health Panel at bottom */}
        <details className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden transition-all group">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors select-none">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Trạng Thái Hệ Thống (Live System Status)</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Xem trạng thái kết nối container</span>
          </summary>
          <div className="p-5 border-t border-[#f1f5f9] space-y-3 bg-[#fafbfc]">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">Cơ sở dữ liệu (PostgreSQL Container)</span>
              <span className={`flex items-center gap-1.5 font-bold ${
                stats.postgresStatus?.includes("Active") ? "text-emerald-500" : "text-rose-500"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  stats.postgresStatus?.includes("Active") ? "bg-emerald-500 animate-ping" : "bg-rose-500"
                }`}></span>
                {stats.postgresStatus || "Offline"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">Extension Vector (pgvector)</span>
              <span className={`font-bold ${
                stats.pgvectorStatus === "Loaded" ? "text-emerald-500" : "text-rose-500"
              }`}>{stats.pgvectorStatus || "Not Loaded"}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">Python AI Microservice (Nhận diện & Cảm xúc)</span>
              <span className={`flex items-center gap-1.5 font-bold ${
                stats.pythonStatus?.includes("Active") ? "text-emerald-500" : "text-amber-500"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  stats.pythonStatus?.includes("Active") ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                }`}></span>
                {stats.pythonStatus || "Pending Java Connection"}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium border-t border-slate-200 pt-3 mt-4">
              Múi giờ hệ thống: Indochina Time (GMT+7).
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
