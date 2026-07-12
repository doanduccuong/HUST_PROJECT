"use client";

import React, { useState } from "react";

export default function Sidebar({ activeTab, onTabChange }) {
  const [openMenus, setOpenMenus] = useState({
    customers: true,
    orders: true,
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
          TMS
        </div>
        <span className="font-bold text-white text-lg tracking-tight">TMS CRM</span>
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
              <button
                onClick={() => onTabChange("cdrs")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  activeTab === "cdrs"
                    ? "text-blue-500 font-semibold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                CDRs
              </button>
            </div>
          )}
        </div>

        {/* Orders Menu Group */}
        <div className="pt-2">
          <button
            onClick={() => toggleMenu("orders")}
            className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium hover:bg-slate-800 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <span>Orders</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                openMenus.orders ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {openMenus.orders && (
            <div className="pl-8 pr-2 mt-1 space-y-1">
              <button
                onClick={() => onTabChange("orderList")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  activeTab === "orderList"
                    ? "text-blue-500 font-semibold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Order List
              </button>
              <button
                onClick={() => onTabChange("orders")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  activeTab === "orders"
                    ? "text-blue-500 font-semibold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Order Management
              </button>
              <button
                onClick={() => onTabChange("bulkDistribution")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  activeTab === "bulkDistribution"
                    ? "text-blue-500 font-semibold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Bulk Distribution
              </button>
              <button
                onClick={() => onTabChange("validation")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  activeTab === "validation"
                    ? "text-blue-500 font-semibold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Validation
              </button>
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
