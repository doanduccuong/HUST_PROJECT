"use client";

import React, { useState } from "react";
import { useExperienceCaptureViewModel } from "../viewmodels/useExperienceCaptureViewModel";

const STATE_COLORS = {
  NEUTRAL: "bg-slate-100 text-slate-700",
  DELIGHTED: "bg-emerald-100 text-emerald-700",
  ENGAGED: "bg-blue-100 text-blue-700",
  CONFUSED: "bg-amber-100 text-amber-700",
  IMPATIENT: "bg-orange-100 text-orange-700",
  DISSATISFIED: "bg-rose-100 text-rose-700",
};

export default function ExperienceCaptureView() {
  const {
    videoRef,
    canvasRef,
    sourceType,
    sourceName,
    status,
    latestResult,
    transitions,
    summary,
    error,
    selectVideoFile,
    openWebcam,
    startSession,
    stopSession,
  } = useExperienceCaptureViewModel();
  const [cameraId, setCameraId] = useState("CAM-DEMO-01");
  const [zone, setZone] = useState("PRODUCT");
  const running = status === "RUNNING" || status === "STARTING";

  return (
    <div className="max-w-[1500px] mx-auto p-6 space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Realtime experience</p>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Video/Webcam Experience Session</h1>
        <p className="text-sm text-slate-500 mt-1">Lấy mẫu 1 frame/giây, xử lý bằng pipeline AI thật và lưu transition vào CRM.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="aspect-video bg-slate-950 relative flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              controls={sourceType === "VIDEO_FILE"}
              muted
              playsInline
              preload="metadata"
              onEnded={stopSession}
              aria-label="Nguồn video phân tích trải nghiệm"
            >
              Trình duyệt không hỗ trợ video HTML5.
            </video>
            {!sourceName && (
              <div className="absolute text-center text-slate-400">
                <div className="text-4xl mb-2">◉</div>
                <p className="text-sm">Chọn MP4 hoặc mở webcam</p>
              </div>
            )}
            <div className="absolute left-4 top-4 flex gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${running ? "bg-red-500 text-white" : "bg-slate-800 text-slate-300"}`}>
                {running ? "● LIVE" : status}
              </span>
              {sourceName && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white">{sourceName}</span>}
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

          <div className="p-4 flex flex-wrap items-center gap-3 border-t border-slate-100">
            <label className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer hover:bg-slate-800">
              Chọn video MP4
              <input
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                disabled={running}
                onChange={(event) => selectVideoFile(event.target.files?.[0])}
              />
            </label>
            <button
              type="button"
              onClick={openWebcam}
              disabled={running}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 disabled:opacity-50"
            >
              Mở webcam
            </button>
            {!running ? (
              <button
                type="button"
                onClick={() => startSession({ cameraId, zone })}
                disabled={!sourceName || status === "STARTING"}
                className="ml-auto px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold disabled:opacity-50"
              >
                Bắt đầu session
              </button>
            ) : (
              <button
                type="button"
                onClick={stopSession}
                className="ml-auto px-5 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold"
              >
                Kết thúc session
              </button>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <h2 className="font-bold text-sm text-slate-800">Cấu hình điểm chạm</h2>
            <label className="block text-xs font-semibold text-slate-500">
              Camera ID
              <input value={cameraId} onChange={(event) => setCameraId(event.target.value)} disabled={running} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800" />
            </label>
            <label className="block text-xs font-semibold text-slate-500">
              Zone
              <select value={zone} onChange={(event) => setZone(event.target.value)} disabled={running} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white">
                <option value="ENTRANCE">Entrance</option>
                <option value="WAITING">Waiting</option>
                <option value="CONSULTING">Consulting</option>
                <option value="PRODUCT">Product</option>
                <option value="CHECKOUT">Checkout</option>
                <option value="EXIT">Exit</option>
              </select>
            </label>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h2 className="font-bold text-sm text-slate-800 mb-3">Kết quả frame mới nhất</h2>
            {latestResult ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Quality</span><span className={latestResult.accepted ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{latestResult.accepted ? "ACCEPTED" : "REJECTED"} · {(latestResult.qualityScore * 100).toFixed(1)}%</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Raw emotion</span><span className="font-bold text-slate-800">{latestResult.rawExpression} · {(latestResult.rawConfidence * 100).toFixed(1)}%</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">Experience state</span><span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATE_COLORS[latestResult.experienceState] || STATE_COLORS.NEUTRAL}`}>{latestResult.experienceState}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Inference</span><span className="font-bold text-slate-800">{latestResult.inferenceMs} ms</span></div>
                {latestResult.rejectReasons?.length > 0 && <div className="p-2 rounded-lg bg-rose-50 text-rose-700 text-xs">{latestResult.rejectReasons.join(", ")}</div>}
              </div>
            ) : <p className="text-xs text-slate-400">Chưa có frame được phân tích.</p>}
          </div>

          {error && <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">{error}</div>}
        </aside>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">Transition timeline</h2>
          <span className="text-xs text-slate-400">{transitions.length} transitions</span>
        </div>
        {transitions.length === 0 ? (
          <p className="text-sm text-slate-400">Timeline sẽ chỉ ghi khi trạng thái đã ổn định và thực sự thay đổi.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {transitions.map((event) => (
              <div key={`${event.sequence}-${event.observedAt}`} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                <span className="text-xs text-slate-400">#{event.sequence}</span>
                <span className="text-xs font-semibold text-slate-500">{event.previousState}</span>
                <span className="text-slate-300">→</span>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${STATE_COLORS[event.experienceState] || STATE_COLORS.NEUTRAL}`}>{event.experienceState}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {summary && (
        <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-900">
          Session đã đóng: {summary.totalFrames} frames · {summary.acceptedFrames} accepted · {summary.rejectedFrames} rejected · {summary.transitionCount} transitions · Final state: <strong>{summary.finalState}</strong>
        </section>
      )}
    </div>
  );
}
