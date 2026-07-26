"use client";

import React, { useState } from "react";

export default function Sidebar({ activeTab, onTabChange, userRole }) {
  const canManage = ["MANAGER", "ADMIN"].includes((userRole || "").toUpperCase());
  const [openMenus, setOpenMenus] = useState({
    customers: true,
    orders: true,
    product: true,
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path>
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen flex-shrink-0 border-r border-slate-800 font-sans">
      {/* Brand Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm tracking-wider">
          RE
        </div>
        <span className="font-bold text-white text-lg tracking-tight">Retail Emotion CRM</span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase px-3 mb-2 tracking-widest">
          Applications
        </div>

        {/* Main Static Items */}
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.id
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        {canManage && (
          <button
            onClick={() => onTabChange("salesPerformance")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "salesPerformance"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3v18h18M7 16l4-4 3 3 5-7" />
            </svg>
            <span>Sale Performance</span>
          </button>
        )}

        {/* Customers Menu Group */}
        <div className="pt-2">
          <button
            onClick={() => toggleMenu("customers")}
            className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium hover:bg-slate-800 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span>Customers</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                openMenus.customers ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {openMenus.customers && (
            <div className="pl-8 pr-2 mt-1 space-y-1">
              <button
                onClick={() => onTabChange("members")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  activeTab === "members"
                    ? "text-blue-500 font-semibold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Customer List
              </button>
              {canManage && (
                <button
                  onClick={() => onTabChange("faceSearch")}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    activeTab === "faceSearch"
                      ? "text-blue-500 font-semibold"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Face Search & 360
                </button>
              )}
              {canManage && (
                <button
                  onClick={() => onTabChange("experienceLogs")}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    activeTab === "experienceLogs"
                      ? "text-blue-500 font-semibold"
                      : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Nhật ký & Đối soát
              </button>
              )}
            </div>
          )}
        </div>

      </nav>
      
      <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        v2.8.3.9
      </div>
    </aside>
  );
}
