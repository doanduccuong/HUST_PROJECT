"use client";

import React from "react";

export default function DashboardView({ stats, onNavigate }) {
  const cards = [
    {
      title: "Total Registered Members",
      value: stats.totalMembers.toLocaleString(),
      color: "border-blue-500",
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
    },
    {
      title: "Total Sales Orders",
      value: stats.totalOrders.toLocaleString(),
      color: "border-violet-500",
      icon: (
        <svg className="w-6 h-6 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
      ),
    },
    {
      title: "Total Revenue",
      value: `RM ${stats.totalRevenue.toLocaleString()}`,
      color: "border-emerald-500",
      icon: (
        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v-1m-10-4a9 9 0 1118 0 9 9 0 01-18 0z"></path>
        </svg>
      ),
    },
    {
      title: "Avg. Conversion Rate",
      value: `${stats.conversionRate}%`,
      color: "border-amber-500",
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">System Dashboard</h2>
          <p className="text-xs text-slate-400 font-medium">Real-time overview of sales operations, customer metrics, and agent performance.</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm border-l-4 ${card.color} flex items-center justify-between`}>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{card.title}</span>
              <div className="text-xl font-black text-slate-800">{card.value}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Status Panel */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Live Operation Status</h3>
            <div className="space-y-3">
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
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-3 mt-4">
            System timezone set to Indochina Time (GMT+7).
          </div>
        </div>
      </div>
    </div>
  );
}
