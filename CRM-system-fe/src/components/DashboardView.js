"use client";

import React from "react";

export default function DashboardView({ stats, onNavigate }) {
  const leadStats = stats?.lead || {};
  const mySaleStats = stats?.mySale || {};
  const totalCallStats = stats?.totalCall || {};

  const approved = leadStats.approved || 0;
  const rejected = leadStats.rejected || 0;
  const uncalled = leadStats.unCall || 0;
  const callback = leadStats.callback || 0;
  const trash = leadStats.trash || 0;

  const totalCalls = totalCallStats.total || 0;
  const connectedCalls = totalCallStats.connected || 0;
  const busyCalls = totalCallStats.busy || 0;
  const invalidCalls = totalCallStats.invalid || 0;

  const funnelLead = mySaleStats.lead || 0;
  const funnelDelivery = mySaleStats.delivered || 0;
  const funnelSaleOrder = mySaleStats.saleOrder || 0;

  // Chart Percentages
  const connectedPct = totalCalls > 0 ? ((connectedCalls / totalCalls) * 100).toFixed(1) : "0.0";
  const busyPct = totalCalls > 0 ? ((busyCalls / totalCalls) * 100).toFixed(1) : "0.0";
  const invalidPct = totalCalls > 0 ? ((invalidCalls / totalCalls) * 100).toFixed(1) : "0.0";

  // Donut SVG parameters
  // Circumference for r=50 is 314.16
  const circ = 314.16;
  const connectedOffset = 0;
  const busyOffset = totalCalls > 0 ? -((connectedCalls / totalCalls) * circ) : 0;
  const invalidOffset = totalCalls > 0 ? -(((connectedCalls + busyCalls) / totalCalls) * circ) : 0;

  // Performance Comparison values
  const totalRevenueVal = stats?.totalRevenue || 0;
  const approveRateVal = totalCalls > 0 ? ((approved / totalCalls) * 100) : 0.0;
  const avgOrderValueVal = funnelSaleOrder > 0 ? (totalRevenueVal / funnelSaleOrder) : 0.0;

  // Performance Comparison bars width scale: 100 is 0, 480 is 5000. Scale factor = 380 / 5000 = 0.076
  const scale = 0.076;
  const wLead = Math.min(380, funnelLead * scale);
  const wOrderValue = Math.min(380, totalRevenueVal * scale);
  const wSaleOrder = Math.min(380, funnelSaleOrder * scale);
  const wApproveRate = Math.min(380, approveRateVal * scale);
  const wAvgOrderValue = Math.min(380, avgOrderValueVal * scale);

  const kpis = [
    { title: "Approved", value: approved, label: "Orders", textColor: "text-[#4caf50]" },
    { title: "Rejected", value: rejected, label: "Orders", textColor: "text-[#f44336]" },
    { title: "Uncalled", value: uncalled, label: "Orders", textColor: "text-[#ff9800]" },
    { title: "Callback", value: callback, label: "Orders", textColor: "text-[#2196f3]" },
    { title: "Trash", value: trash, label: "Orders", textColor: "text-[#333333]" },
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans">
      {/* Title Header Bar */}
      <div className="bg-[#2a4d60] px-6 py-4 shadow-sm">
        <h1 className="text-white text-xl font-semibold tracking-wide">Dashboard</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-[#e9ecef] p-6 shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow"
            >
              <span className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                {kpi.title}
              </span>
              <div className="flex flex-col items-center justify-center my-3">
                <span className={`text-6xl font-light ${kpi.textColor}`}>
                  {kpi.value.toLocaleString()}
                </span>
              </div>
              <span className="text-slate-400 text-xs text-center font-semibold">
                {kpi.label}
              </span>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Donut Card */}
          <div className="bg-white rounded-lg border border-[#e9ecef] p-5 shadow-sm flex flex-col justify-between min-h-[340px]">
            <h3 className="text-sm font-bold text-slate-700 mb-4 tracking-wide">
              Performance
            </h3>
            <div className="flex items-center justify-center gap-4 flex-1">
              <div className="relative w-[150px] h-[150px]">
                <svg width="150" height="150" viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                  {/* Background Track */}
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                  
                  {/* Connected (Blue: #2196f3) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#2196f3"
                    strokeWidth="10"
                    strokeDasharray="314.16"
                    strokeDashoffset={connectedOffset}
                  />

                  {/* Busy (Green: #4caf50) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#4caf50"
                    strokeWidth="10"
                    strokeDasharray="314.16"
                    strokeDashoffset={isNaN(busyOffset) ? -32.73 : busyOffset}
                  />

                  {/* Invalid (Orange: #ff9800) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#ff9800"
                    strokeWidth="10"
                    strokeDasharray="314.16"
                    strokeDashoffset={isNaN(invalidOffset) ? -306.11 : invalidOffset}
                  />
                </svg>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Calls</span>
                  <span className="text-xl font-bold text-slate-800">{totalCalls.toLocaleString()}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#2196f3]"></span>
                  <span>Connected ({connectedPct}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#4caf50]"></span>
                  <span>Busy ({busyPct}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff9800]"></span>
                  <span>Invalid ({invalidPct}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sale Funnel Card */}
          <div className="bg-white rounded-lg border border-[#e9ecef] p-5 shadow-sm flex flex-col justify-between min-h-[340px]">
            <h3 className="text-sm font-bold text-slate-700 mb-4 tracking-wide">
              Sale Funnel
            </h3>
            <div className="flex-1 flex items-center justify-center py-2">
              <svg width="100%" height="200" viewBox="0 0 400 200" className="max-w-[280px]">
                {/* Lead Stage */}
                <polygon points="10,10 390,10 295,60 105,60" fill="#3a9ad9" />
                <text x="200" y="28" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">Lead</text>
                <text x="200" y="45" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">{funnelLead.toLocaleString()}</text>

                {/* Delivery Stage */}
                <polygon points="110,65 290,65 245,115 155,115" fill="#7c3aed" />
                <text x="200" y="83" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">Delivery</text>
                <text x="200" y="100" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">{funnelDelivery.toLocaleString()}</text>

                {/* Sale Order Stage */}
                <polygon points="160,120 240,120 220,160 220,185 180,185 180,160" fill="#eab308" />
                <text x="200" y="138" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">Sale Order</text>
                <text x="200" y="155" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">{funnelSaleOrder.toLocaleString()}</text>
              </svg>
            </div>
          </div>

          {/* Performance Comparison Card */}
          <div className="bg-white rounded-lg border border-[#e9ecef] p-5 shadow-sm flex flex-col justify-between min-h-[340px] relative">
            {/* Top Right Menu Burger Button */}
            <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h3 className="text-sm font-bold text-slate-700 mb-4 tracking-wide">
              Performance Comparison
            </h3>
            <div className="flex-1 flex items-center justify-center">
              <svg width="100%" height="200" viewBox="0 0 500 220" className="w-full">
                {/* Horizontal Grid Lines */}
                <line x1="110" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="110" y1="65" x2="480" y2="65" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="110" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="110" y1="135" x2="480" y2="135" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="110" y1="170" x2="480" y2="170" stroke="#f1f5f9" strokeWidth="1" />

                {/* Vertical Axis Scale Lines & Labels */}
                <line x1="110" y1="10" x2="110" y2="185" stroke="#cbd5e1" strokeWidth="1" />
                <text x="110" y="200" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">0</text>
                
                <line x1="184" y1="10" x2="184" y2="185" stroke="#f1f5f9" strokeWidth="1" />
                <text x="184" y="200" fill="#94a3b8" fontSize="9" textAnchor="middle">1000</text>
                
                <line x1="258" y1="10" x2="258" y2="185" stroke="#f1f5f9" strokeWidth="1" />
                <text x="258" y="200" fill="#94a3b8" fontSize="9" textAnchor="middle">2000</text>
                
                <line x1="332" y1="10" x2="332" y2="185" stroke="#f1f5f9" strokeWidth="1" />
                <text x="332" y="200" fill="#94a3b8" fontSize="9" textAnchor="middle">3000</text>
                
                <line x1="406" y1="10" x2="406" y2="185" stroke="#f1f5f9" strokeWidth="1" />
                <text x="406" y="200" fill="#94a3b8" fontSize="9" textAnchor="middle">4000</text>
                
                <line x1="480" y1="10" x2="480" y2="185" stroke="#cbd5e1" strokeWidth="1" />
                <text x="480" y="200" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">5000</text>

                {/* Y-Axis Label Texts */}
                <text x="100" y="33" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="end">Total Lead</text>
                <text x="100" y="68" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="end">Total Order Value</text>
                <text x="100" y="103" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="end">Sale Order</text>
                <text x="100" y="138" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="end">Approve Rate</text>
                <text x="100" y="173" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="end">Avg Order Value</text>

                {/* Data Bars */}
                {/* Total Lead */}
                <rect x="110" y="22" width={isNaN(wLead) ? 320.7 : wLead} height="15" fill="#2196f3" rx="1.5" />
                <text x={Math.max(120, (isNaN(wLead) ? 320.7 : wLead) + 100)} y="33" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="end">{funnelLead}</text>

                {/* Total Order Value */}
                <rect x="110" y="57" width={isNaN(wOrderValue) ? 18.1 : wOrderValue} height="15" fill="#2196f3" rx="1.5" />
                <text x={Math.max(120, (isNaN(wOrderValue) ? 18.1 : wOrderValue) + 115)} y="68" fill="#475569" fontSize="8" fontWeight="bold">{totalRevenueVal.toLocaleString()}</text>

                {/* Sale Order */}
                <rect x="110" y="92" width={isNaN(wSaleOrder) ? 7.0 : wSaleOrder} height="15" fill="#2196f3" rx="1.5" />
                <text x={Math.max(120, (isNaN(wSaleOrder) ? 7.0 : wSaleOrder) + 115)} y="103" fill="#475569" fontSize="8" fontWeight="bold">{funnelSaleOrder}</text>

                {/* Approve Rate */}
                <rect x="110" y="127" width={Math.max(3, isNaN(wApproveRate) ? 1 : wApproveRate)} height="15" fill="#2196f3" rx="1.5" />
                <text x={Math.max(120, (isNaN(wApproveRate) ? 1 : wApproveRate) + 115)} y="138" fill="#475569" fontSize="8" fontWeight="bold">{approveRateVal.toFixed(2)}%</text>

                {/* Avg Order Value */}
                <rect x="110" y="162" width={Math.max(3, isNaN(wAvgOrderValue) ? 1 : wAvgOrderValue)} height="15" fill="#2196f3" rx="1.5" />
                <text x={Math.max(120, (isNaN(wAvgOrderValue) ? 1 : wAvgOrderValue) + 115)} y="173" fill="#475569" fontSize="8" fontWeight="bold">{avgOrderValueVal.toFixed(1)}</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Collapsible System Health Panel at bottom */}
        <details className="bg-white rounded-lg border border-[#e9ecef] shadow-sm overflow-hidden transition-all group">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors select-none">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Operation Status</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Click to expand system health indicators</span>
          </summary>
          <div className="p-5 border-t border-[#f1f5f9] space-y-3 bg-[#fafbfc]">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">PostgreSQL Container</span>
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
              <span className="text-slate-500">pgvector Extension</span>
              <span className={`font-bold ${
                stats.pgvectorStatus === "Loaded" ? "text-emerald-500" : "text-rose-500"
              }`}>{stats.pgvectorStatus || "Not Loaded"}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">Python AI Microservice</span>
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
              System timezone set to Indochina Time (GMT+7).
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
