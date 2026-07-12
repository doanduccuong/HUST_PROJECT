"use client";

import React from "react";

export default function CdrsView({ cdrs }) {
  return (
    <div className="flex-1 bg-slate-50 flex flex-col h-full font-sans">
      {/* Header toolbar */}
      <div className="bg-white border-b border-slate-200 py-3 px-6 flex items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Call Detail Records (CDRs)</h2>
          <p className="text-[10px] text-slate-400 font-medium">Log list of outbound calls executed by agents, including durations and recordings.</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18"></path>
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Call ID</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Agent Assigned</th>
                  <th className="py-3 px-4">Call Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recording</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {cdrs.map((cdr, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{cdr.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{cdr.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{cdr.phone}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {cdr.callType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{cdr.agent}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{cdr.time}</td>
                    <td className="py-3 px-4 font-semibold">
                      {cdr.duration > 0 ? `${cdr.duration}s` : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cdr.status === "ANSWERED" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {cdr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {cdr.duration > 0 ? (
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>Listen</span>
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
