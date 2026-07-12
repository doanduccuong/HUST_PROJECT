"use client";

import React, { useState } from "react";

export default function Header({ agentStatus, onStatusChange, userName = "Dino Nguyen", userRole = "Manager" }) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const statuses = [
    { id: "available", label: "Available", color: "bg-emerald-500", text: "text-emerald-600" },
    { id: "busy", label: "Busy", color: "bg-rose-500", text: "text-rose-600" },
    { id: "break", label: "Break", color: "bg-amber-500", text: "text-amber-600" },
    { id: "unavailable", label: "Unavailable", color: "bg-slate-400", text: "text-slate-500" },
  ];

  const currentStatusObj = statuses.find((s) => s.id === agentStatus) || statuses[3];

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between font-sans">
      {/* Left side: Timezone / Info */}
      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>GMT+7</span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-700">EN</span>
        </div>
      </div>

      {/* Right side: Status and User Profile */}
      <div className="flex items-center gap-6">
        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 transition-colors"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${currentStatusObj.color}`}></span>
            <span>{currentStatusObj.label}</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {showStatusDropdown && (
            <>
              {/* Overlay to close */}
              <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)}></div>
              
              <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-white border border-slate-200 shadow-lg z-20 overflow-hidden py-1">
                {statuses.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => {
                      onStatusChange(status.id);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition-colors ${
                      agentStatus === status.id ? "bg-slate-50 text-blue-600" : "text-slate-600"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${status.color}`}></span>
                    <span>{status.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800">{userName}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{userRole}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm shadow-sm overflow-hidden">
            {userName ? userName.split(" ").map(n => n[0]).join("") : "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
