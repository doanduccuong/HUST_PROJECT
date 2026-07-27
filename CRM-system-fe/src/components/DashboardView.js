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
      textColor: "text-slate-900",
      status: "Bình thường",
      statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
      iconBg: "bg-emerald-50 text-emerald-600",
      glowBg: "group-hover:bg-emerald-100/50",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 18M14.214 16.06A8.196 8.196 0 0020.25 8.25M20.25 8.25A8.197 8.197 0 0014.214 1.94M20.25 8.25h.008v.008H20.25V8.25zm-9.012 4.012a4.5 4.5 0 11.196-.06l-.196.06zm0 0v.003c0 1.113-.285 2.16-.786 3.07M11.238 12.062A8.196 8.196 0 0017.25 4.25M17.25 4.25A8.197 8.197 0 0011.238 1.94M17.25 4.25h.008v.008H17.25V4.25zM3 16.06a8.196 8.196 0 006.036-7.81M3 16.06A8.197 8.197 0 019.036 9.75M3 16.06h.008v.008H3v-.008zm0-4.012a4.5 4.5 0 11.196-.06L3 12.048zm0 0v.003c0 1.113-.285 2.16-.786 3.07M3 12.048A8.196 8.196 0 009.036 4.25M9.036 4.25A8.197 8.197 0 003 1.94M9.036 4.25h.008v.008H9.036V4.25z" />
        </svg>
      )
    },
    {
      title: "Chỉ số Phân vân (CBI)",
      value: `${cbiValue.toFixed(1)}%`,
      label: "Mục tiêu: <= 8.0%",
      textColor: "text-blue-600",
      status: "Tốt",
      statusColor: "bg-blue-50 text-blue-700 border border-blue-200/50",
      iconBg: "bg-blue-50 text-blue-600",
      glowBg: "group-hover:bg-blue-100/50",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      )
    },
    {
      title: "Chỉ số Sốt ruột (IBI)",
      value: `${ibiValue.toFixed(1)}%`,
      label: "Mục tiêu: <= 5.0%",
      textColor: "text-amber-600",
      status: "Cảnh báo",
      statusColor: "bg-amber-50 text-amber-700 border border-amber-200/50 animate-pulse",
      iconBg: "bg-amber-50 text-amber-600",
      glowBg: "group-hover:bg-amber-100/50",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Chỉ số Không Hài Lòng (DRI)",
      value: `${driValue.toFixed(1)}%`,
      label: "Mục tiêu: <= 6.0%",
      textColor: "text-rose-600",
      status: "Rất Tốt",
      statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
      iconBg: "bg-rose-50 text-rose-600",
      glowBg: "group-hover:bg-rose-100/50",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10.5h.008v.008H9v-.008zm6 0h.008v.008H15v-.008z" />
        </svg>
      )
    },
    {
      title: "Tỷ lệ Chuyển đổi EDC",
      value: `${edcValue.toFixed(1)}%`,
      label: "Engage -> Delighted",
      textColor: "text-violet-600",
      status: "Tốt",
      statusColor: "bg-violet-50 text-violet-700 border border-violet-200/50",
      iconBg: "bg-violet-50 text-violet-600",
      glowBg: "group-hover:bg-violet-100/50",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-9 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M7.5 12l-3 3m3-3l3 3" />
        </svg>
      )
    },
  ];

  // Emotion segments for Donut chart
  const emotions = [
    { label: "Delighted (Rất hài lòng)", pct: retail?.emotions?.delighted?.pct ?? 45, val: retail?.emotions?.delighted?.val ?? 572, color: "#10b981", activeBg: "bg-emerald-500" },
    { label: "Engaged (Hứng thú)", pct: retail?.emotions?.engaged?.pct ?? 28, val: retail?.emotions?.engaged?.val ?? 356, color: "#3b82f6", activeBg: "bg-blue-500" },
    { label: "Neutral (Trung tính)", pct: retail?.emotions?.neutral?.pct ?? 11, val: retail?.emotions?.neutral?.val ?? 140, color: "#6b7280", activeBg: "bg-gray-500" },
    { label: "Confused (Phân vân)", pct: retail?.emotions?.confused?.pct ?? 7, val: retail?.emotions?.confused?.val ?? 89, color: "#eab308", activeBg: "bg-yellow-500" },
    { label: "Impatient (Sốt ruột)", pct: retail?.emotions?.impatient?.pct ?? 6, val: retail?.emotions?.impatient?.val ?? 76, color: "#f97316", activeBg: "bg-orange-500" },
    { label: "Dissatisfied (Tệ)", pct: retail?.emotions?.dissatisfied?.pct ?? 3, val: retail?.emotions?.dissatisfied?.val ?? 40, color: "#ef4444", activeBg: "bg-red-500" },
  ];

  // Calculate coordinates/offsets for visual representation
  const circ = 314.16; // for r=50
  let accumulatedPercent = 0;

  return (
    <div className="bg-[#f3f4f6]/60 min-h-screen font-sans pb-12">
      {/* Title Header Bar */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] px-8 py-6 shadow-lg border-b border-slate-800/80 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Báo cáo Hành trình Trải nghiệm & Cảm xúc Khách hàng
              </h1>
              <p className="text-slate-400 text-sm mt-0.5 font-medium">
                Hệ thống đối soát camera thời gian thực, phân tích hành vi và chất lượng dịch vụ
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3.5 py-1.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider">
            Phân tích AI: Active
          </span>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md">Bộ lọc</span>
            
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span className="text-xs font-bold text-slate-500">Ngày phân tích:</span>
              <input
                type="date"
                value={specificDate || ""}
                onChange={(e) => onDateChange && onDateChange(e.target.value)}
                className="text-xs font-bold text-slate-700 focus:outline-none bg-transparent cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200/30">
            {[
              { id: "today", label: "Hôm nay" },
              { id: "all", label: "Tất cả lịch sử" }
            ].map((p) => {
              const isActive = (p.id === "all" && !specificDate) || (p.id === "today" && specificDate === new Date().toISOString().split("T")[0]);
              return (
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
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-md shadow-slate-200/50"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[160px] hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
            >
              {/* Soft decorative background gradient on card hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="flex justify-between items-start relative z-10">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {kpi.title}
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide ${kpi.statusColor}`}>
                  {kpi.status}
                </span>
              </div>
              <div className="my-4 flex items-center gap-4 relative z-10">
                <div className={`p-3 rounded-xl transition-all duration-300 ${kpi.iconBg} ${kpi.glowBg}`}>
                  {kpi.icon}
                </div>
                <div className="flex flex-col">
                  <span className={`text-3xl font-black tracking-tight ${kpi.textColor}`}>
                    {kpi.value}
                  </span>
                </div>
              </div>
              <span className="text-slate-400 text-xs font-semibold relative z-10">
                {kpi.label}
              </span>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Emotion Distribution Donut (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                  Phân bổ Cảm xúc Khách hàng
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Tỷ lệ phần trăm tính trên tổng lượng khách quét qua camera
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-6">
              <div className="relative w-[170px] h-[170px] flex-shrink-0">
                <svg width="170" height="170" viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
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
                        className="transition-all duration-500 hover:stroke-[14px]"
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white rounded-full m-3 shadow-inner">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Tổng Mẫu</span>
                  <span className="text-2xl font-black text-slate-800">{(retail?.totalEvents || 1273).toLocaleString()}</span>
                  <span className="text-[9px] font-semibold text-slate-400">quét</span>
                </div>
              </div>

              {/* Legend with styled progress visualizer bars */}
              <div className="flex-1 space-y-2.5 w-full">
                {emotions.map((em, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: em.color }}></span>
                        <span className="text-slate-700">{em.label.split(" (")[0]}</span>
                      </div>
                      <span className="text-slate-500 text-[11px]">{em.pct}% <span className="text-slate-400 font-normal">({em.val})</span></span>
                    </div>
                    {/* Visual bar share */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${em.activeBg}`} style={{ width: `${em.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shift Capacity & Emotion Analysis (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                  Hiệu suất & Trải nghiệm Cảm xúc theo Ca Làm Việc
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Đối soát tỷ lệ bức xúc (Impatient) và công suất phục vụ
              </p>
            </div>

            <div className="overflow-x-auto my-4 flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-widest pb-3">
                    <th className="py-3 px-1">Ca Làm Việc</th>
                    <th className="py-3 text-center">Khách Ghé</th>
                    <th className="py-3 text-center">Công Suất (Tải)</th>
                    <th className="py-3 text-center">Delight (Hài Lòng)</th>
                    <th className="py-3 text-center">Impatient (Sốt Ruột)</th>
                    <th className="py-3 text-right">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-amber-50 text-amber-500 rounded-md">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                          </svg>
                        </span>
                        <span className="text-slate-800">Ca Sáng (08:00 - 15:00)</span>
                      </div>
                    </td>
                    <td className="py-4 text-center font-black text-slate-900">{retail?.morningShift?.visitors ?? 420} khách</td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/20">
                          <div className={retail?.morningShift?.capacity > 100 ? "bg-rose-500 h-full rounded-full" : "bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full"} style={{ width: `${retail?.morningShift?.capacity ?? 85}%` }}></div>
                        </div>
                        <span className="font-extrabold text-slate-600">{Number(retail?.morningShift?.capacity ?? 85).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-center text-emerald-600 font-extrabold">{Number(retail?.morningShift?.delight ?? 52).toFixed(1)}%</td>
                    <td className="py-4 text-center text-slate-400 font-semibold">{Number(retail?.morningShift?.impatient ?? 2.1).toFixed(1)}%</td>
                    <td className="py-4 text-right">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                        retail?.morningShift?.status === "Quá Tải" ? "bg-rose-55 text-rose-700 border border-rose-200/50 animate-pulse" :
                        retail?.morningShift?.status === "Không hoạt động" ? "bg-slate-100 text-slate-500 border border-slate-200/40" :
                        "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                      }`}>
                        {retail?.morningShift?.status ?? "Ổn Định"}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-indigo-50 text-indigo-500 rounded-md">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                          </svg>
                        </span>
                        <span className="text-slate-800">Ca Tối (15:00 - 22:00)</span>
                      </div>
                    </td>
                    <td className="py-4 text-center font-black text-slate-900">{retail?.eveningShift?.visitors ?? 853} khách</td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/20">
                          <div className={retail?.eveningShift?.capacity > 100 ? "bg-gradient-to-r from-rose-400 to-rose-500 h-full rounded-full" : "bg-emerald-500 h-full rounded-full"} style={{ width: `${retail?.eveningShift?.capacity ?? 100}%` }}></div>
                        </div>
                        <span className={retail?.eveningShift?.capacity > 100 ? "text-rose-600 font-extrabold" : "font-extrabold text-slate-600"}>
                          {Number(retail?.eveningShift?.capacity ?? 108).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center text-slate-400 font-semibold">{Number(retail?.eveningShift?.delight ?? 41).toFixed(1)}%</td>
                    <td className="py-4 text-center text-rose-600 font-black">{Number(retail?.eveningShift?.impatient ?? 11.4).toFixed(1)}%</td>
                    <td className="py-4 text-right">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                        retail?.eveningShift?.status === "Quá Tải" ? "bg-rose-50 text-rose-700 border border-rose-200/50 animate-pulse" :
                        retail?.eveningShift?.status === "Không hoạt động" ? "bg-slate-100 text-slate-500 border border-slate-200/40" :
                        "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                      }`}>
                        {retail?.eveningShift?.status ?? "Quá Tải"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/60 backdrop-blur-sm rounded-2xl p-4 text-xs text-amber-800 font-bold flex items-start gap-3 shadow-inner">
              <span className="text-lg leading-none">💡</span>
              <p className="leading-relaxed">
                <span className="text-amber-900 font-black">Khuyến nghị tối ưu:</span> Ca Tối đang gặp tình trạng quá tải nghiêm trọng ({Number(retail?.eveningShift?.capacity ?? 108).toFixed(0)}%) dẫn đến tỷ lệ khách hàng sốt ruột (Impatient) tăng vọt lên {Number(retail?.eveningShift?.impatient ?? 11.4).toFixed(1)}%. Chi nhánh cần điều phối thêm nhân sự hỗ trợ từ 17h00 - 20h00.
              </p>
            </div>
          </div>
        </div>

        {/* Zone Alerts & Customer Journey Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Zone Performance & Alerts */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                  Theo dõi Cảnh báo & Hiệu suất theo Khu vực (Zones)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium mb-4">
                Các điểm nóng về cảm xúc tiêu cực được phát hiện tại chi nhánh
              </p>
            </div>
            
            <div className="space-y-4 font-bold flex-1 flex flex-col justify-center">
              {/* Tech Desk */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0"></span>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Tech Service Desk (Quầy Kỹ Thuật / Dán Máy)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Chỉ số Impatience: <span className="text-rose-600 font-bold">{Number(retail?.techDeskIbi ?? 18.2).toFixed(1)}%</span> (Vượt ngưỡng 5.0%)</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="bg-rose-100/70 border border-rose-200 text-rose-700 text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
                    Cảnh Báo Đỏ
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1.5 font-medium">Dán máy/Cài đặt lâu</p>
                </div>
              </div>

              {/* Mobile Zone */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-amber-100 bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></span>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Mobile Zone (Khu vực Tư vấn Điện thoại)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Chỉ số Confusion: <span className="text-amber-600 font-bold">{Number(retail?.mobileZoneCbi ?? 14.5).toFixed(1)}%</span> (Vượt ngưỡng 8.0%)</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="bg-amber-100/70 border border-amber-200 text-amber-700 text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
                    Cảnh Báo Vàng
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1.5 font-medium">Thủ tục Trade-in lâu</p>
                </div>
              </div>

              {/* Laptop Zone */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Laptop Zone (Khu vực Laptop)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Chỉ số Confusion: <span className="text-emerald-600 font-bold">4.2%</span> (Ngưỡng an toàn)</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="bg-emerald-50/70 border border-emerald-200 text-emerald-700 text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
                    An Toàn
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1.5 font-medium">Tư vấn rõ ràng</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Journey Aggregation Highlights */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                  Hành trình Cảm xúc & Điểm chạm
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Phân tích diễn tiến biểu cảm của khách hàng qua chuỗi camera giám sát hành trình
              </p>
            </div>
            
            <div className="flex-1 flex flex-col justify-center space-y-4 my-6">
              <div className="relative pl-6 border-l-2 border-slate-200/80 space-y-6">
                <div className="relative">
                  <span className="absolute -left-[32px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow flex items-center justify-center"></span>
                  <h4 className="text-xs font-bold text-slate-800">Điểm Chạm Entrance (Cổng chào)</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
                    Biểu cảm khởi điểm: <span className="text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded">Neutral (Trung tính)</span>. Khách bắt đầu bước vào.
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[32px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow flex items-center justify-center"></span>
                  <h4 className="text-xs font-bold text-slate-800">Điểm Chạm Consulting & Product Zones</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
                    Trải nghiệm tương tác: <span className="text-slate-850 font-bold bg-blue-50/50 text-blue-700 border border-blue-100/50 px-1.5 py-0.5 rounded">Engaged / Confused</span>. Thảo luận thông số máy và chính sách.
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[32px] top-0 w-4 h-4 rounded-full bg-violet-500 border-4 border-white shadow flex items-center justify-center"></span>
                  <h4 className="text-xs font-bold text-slate-800">Điểm Chạm Checkout & Exit</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
                    Trải nghiệm đích: <span className="text-slate-850 font-bold bg-violet-50 text-violet-750 border border-violet-100/50 px-1.5 py-0.5 rounded">Delighted (Vui vẻ)</span>. Tỷ lệ chuyển đổi đạt mốc cao nhất khi được chăm sóc cuối hành trình.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <button 
                onClick={() => onNavigate("faceSearch")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1.5 justify-end ml-auto group"
              >
                <span>Mở Nhận diện khuôn mặt & 360°</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible System Health Panel at bottom */}
        <details className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 group">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors select-none font-bold">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Trạng Thái Hệ Thống (Live System Status)</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold group-hover:text-slate-600 transition-colors">Xem trạng thái kết nối container</span>
          </summary>
          <div className="p-6 border-t border-slate-100 space-y-4 bg-slate-50/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold text-xs">
              
              {/* PostgreSQL status */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">Cơ sở dữ liệu</h4>
                  <p className="text-slate-800 font-black mt-1">PostgreSQL Container</p>
                </div>
                <span className={`flex items-center gap-2 text-[11px] font-extrabold px-3 py-1 rounded-full ${
                  stats.postgresStatus?.includes("Active") ? "bg-emerald-50 text-emerald-700 border border-emerald-200/30" : "bg-rose-50 text-rose-700 border border-rose-200/30"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    stats.postgresStatus?.includes("Active") ? "bg-emerald-500 animate-ping" : "bg-rose-500"
                  }`}></span>
                  {stats.postgresStatus || "Offline"}
                </span>
              </div>

              {/* Vector Status */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">Extension Vector</h4>
                  <p className="text-slate-800 font-black mt-1">pgvector Module</p>
                </div>
                <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${
                  stats.pgvectorStatus === "Loaded" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/30" : "bg-rose-50 text-rose-700 border border-rose-200/30"
                }`}>
                  {stats.pgvectorStatus || "Not Loaded"}
                </span>
              </div>

              {/* AI Microservice status */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">AI Service</h4>
                  <p className="text-slate-800 font-black mt-1">Python AI Microservice</p>
                </div>
                <span className={`flex items-center gap-2 text-[11px] font-extrabold px-3 py-1 rounded-full ${
                  stats.pythonStatus?.includes("Active") ? "bg-emerald-50 text-emerald-700 border border-emerald-200/30" : "bg-amber-50 text-amber-700 border border-amber-200/30"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    stats.pythonStatus?.includes("Active") ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                  }`}></span>
                  {stats.pythonStatus || "Pending Connection"}
                </span>
              </div>

            </div>
            
            <div className="text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-3 mt-4 flex justify-between">
              <span>Múi giờ hệ thống: Indochina Time (GMT+7).</span>
              <span>API Gateway: v2.8.3.9</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

