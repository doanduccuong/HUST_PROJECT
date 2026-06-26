import React from "react";

export function LiveStreamTab({ viewModel, streamInterval, setStreamInterval }) {
  const {
    videoRef,
    canvasRef,
    isConnected,
    isConnecting,
    streamActive,
    latency,
    fps,
    detectionData,
    stats,
    errorMsg,
    startStream,
    stopStream,
  } = viewModel;

  return (
    <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl w-full mx-auto">
      {/* Camera Frame */}
      <section className="lg:col-span-8 flex flex-col gap-4">
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[480px] overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

          <video ref={videoRef} autoPlay playsInline muted className="absolute w-0 h-0 opacity-0 pointer-events-none" />

          {streamActive ? (
            <canvas
              ref={canvasRef}
              className="w-full max-w-[640px] aspect-[4/3] bg-black rounded-xl border border-slate-800 shadow-xl"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 animate-bounce">
                📹
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Camera is turned off</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Click the "Start Camera" button in the upper right to request media stream permission and connect to the backend detector.
                </p>
              </div>
              <button
                onClick={startStream}
                className="mt-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm border border-slate-700 transition"
              >
                Enable Camera
              </button>
            </div>
          )}

          {streamActive && isConnected && (
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
              <div className="bg-slate-950/80 backdrop-blur-md border border-slate-900 rounded-lg px-3 py-1.5 flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><span className="text-cyan-400">FPS:</span> {fps}</span>
                <span className="w-px h-3 bg-slate-800"></span>
                <span className="flex items-center gap-1.5"><span className="text-cyan-400">Latency:</span> {latency} ms</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900/20 border border-slate-900/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stream Update Interval</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">Adjust frequency of sent frames to balance network load</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-cyan-400">{streamInterval}ms</span>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={streamInterval}
              onChange={(e) => setStreamInterval(Number(e.target.value))}
              className="w-40 accent-cyan-500"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-4 text-xs text-rose-300 flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <p>{errorMsg}</p>
          </div>
        )}
      </section>

      {/* Diagnostics Panel */}
      <section className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-900 pb-2">
            Inference Status (Stage 1)
          </h2>
          {streamActive && isConnected && detectionData ? (
            <div className="flex flex-col gap-4">
              {!detectionData.face_detected ? (
                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-6 text-center">
                  <span className="text-3xl">👤</span>
                  <h3 className="text-sm font-bold text-slate-400 mt-2">No Face Detected</h3>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className={`p-4 rounded-xl flex items-center gap-4 ${detectionData.mask_detected ? "bg-emerald-950/40 border border-emerald-900/40" : "bg-rose-950/40 border border-rose-900/40"}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${detectionData.mask_detected ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      {detectionData.mask_detected ? "🛡️" : "🚨"}
                    </div>
                    <div>
                      <h4 className={`text-sm font-extrabold tracking-wide uppercase ${detectionData.mask_detected ? "text-emerald-400" : "text-rose-400"}`}>
                        {detectionData.mask_detected ? "MASK DETECTED" : "NO MASK DETECTED"}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Confidence Score: {(detectionData.mask_probability * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Mask Probability Score</span>
                      <span className="font-semibold text-slate-200">{(detectionData.mask_probability * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${detectionData.mask_detected ? "bg-emerald-500" : "bg-rose-500"}`}
                        style={{ width: `${detectionData.mask_probability * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              Start camera to view real-time model telemetry.
            </div>
          )}
        </div>

        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-900 pb-2">
            Session Metrics
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl">
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Total Frames</span>
              <p className="text-lg font-bold text-white mt-0.5">{stats.totalFrames}</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl">
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Faces Found</span>
              <p className="text-lg font-bold text-cyan-400 mt-0.5">{stats.facesDetected}</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl">
              <span className="text-emerald-500/80 text-[10px] uppercase font-semibold">With Mask</span>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{stats.masksDetected}</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl">
              <span className="text-rose-500/80 text-[10px] uppercase font-semibold">Without Mask</span>
              <p className="text-lg font-bold text-rose-400 mt-0.5">{stats.noMasksDetected}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex-1 flex flex-col">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-900 pb-2">
            Active Telemetry Logs
          </h2>
          {streamActive && isConnected && detectionData && detectionData.face_detected ? (
            <div className="font-mono text-[10px] text-cyan-400/85 flex-1 overflow-y-auto max-h-[160px] flex flex-col gap-1.5">
              <div>
                <span className="text-slate-500">BBox:</span> [{detectionData.bbox.join(", ")}]
              </div>
              <div>
                <span className="text-slate-500">Landmarks:</span>
                <div className="grid grid-cols-2 gap-x-2 ml-2 mt-0.5 text-slate-300">
                  {detectionData.landmarks?.map((pt, idx) => (
                    <span key={idx}>Pt{idx + 1}: ({pt[0]}, {pt[1]})</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs my-auto">
              No active coordinates telemetry.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
