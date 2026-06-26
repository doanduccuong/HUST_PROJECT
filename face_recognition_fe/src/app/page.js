"use client";

import { useState } from "react";
import {
  useLiveStreamViewModel,
  useSingleDetectViewModel,
  useFaceVerificationViewModel,
} from "@/viewmodels";
import {
  LiveStreamTab,
  SingleDetectTab,
  FaceVerificationTab,
} from "@/components";

export default function Home() {
  const [activeTab, setActiveTab] = useState("live"); // "live", "detect", or "verify"
  const [streamInterval, setStreamInterval] = useState(150); // ms

  const liveStreamViewModel = useLiveStreamViewModel({ activeTab, streamInterval });
  const singleDetectViewModel = useSingleDetectViewModel();
  const faceVerificationViewModel = useFaceVerificationViewModel();

  const handleTabChange = (tab) => {
    if (tab !== "live") {
      liveStreamViewModel.stopStream();
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-lg tracking-wider text-white shadow-lg shadow-cyan-500/20">
            AG
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              ANTIGRAVITY SHIELD
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-cyan-400 font-medium border border-slate-800">
                v1.0 Stage 1-5 Adaptive
              </span>
            </h1>
            <p className="text-xs text-slate-500">Real-Time Adaptive Face Verification & Telemetry</p>
          </div>
        </div>

        {/* Tab Switcher & Status Indicators */}
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleTabChange("live")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "live"
                  ? "bg-slate-800 text-cyan-400 border border-slate-700/50 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📹 Live Web Stream
            </button>
            <button
              onClick={() => handleTabChange("detect")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "detect"
                  ? "bg-slate-800 text-cyan-400 border border-slate-700/50 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🔍 Single Image Detect
            </button>
            <button
              onClick={() => handleTabChange("verify")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "verify"
                  ? "bg-slate-800 text-cyan-400 border border-slate-700/50 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🛡️ Face Verification
            </button>
          </div>

          {activeTab === "live" && (
            <div className="flex items-center gap-4 border-l border-slate-900 pl-4">
              <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-full px-3 py-1 text-xs">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    liveStreamViewModel.isConnected
                      ? "bg-emerald-500 animate-pulse"
                      : liveStreamViewModel.isConnecting
                      ? "bg-amber-500 animate-ping"
                      : "bg-rose-500"
                  }`}
                ></span>
                <span className="font-semibold text-slate-300">
                  {liveStreamViewModel.isConnected
                    ? "CONNECTED"
                    : liveStreamViewModel.isConnecting
                    ? "CONNECTING"
                    : "DISCONNECTED"}
                </span>
              </div>

              {!liveStreamViewModel.streamActive ? (
                <button
                  onClick={liveStreamViewModel.startStream}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition shadow-md shadow-cyan-500/10 active:scale-95"
                >
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={liveStreamViewModel.stopStream}
                  className="px-4 py-2 bg-rose-600/90 text-white rounded-lg font-semibold text-sm hover:bg-rose-500 transition active:scale-95"
                >
                  Stop Camera
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Tab Render */}
      {activeTab === "live" && (
        <LiveStreamTab
          viewModel={liveStreamViewModel}
          streamInterval={streamInterval}
          setStreamInterval={setStreamInterval}
        />
      )}
      {activeTab === "detect" && (
        <SingleDetectTab viewModel={singleDetectViewModel} />
      )}
      {activeTab === "verify" && (
        <FaceVerificationTab viewModel={faceVerificationViewModel} />
      )}
    </div>
  );
}
