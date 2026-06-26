import React from "react";

export function FaceVerificationTab({ viewModel }) {
  const {
    currentImg,
    galleryImg,
    currentPreview,
    galleryPreview,
    currentCanvasRef,
    galleryCanvasRef,
    currentImgRef,
    galleryImgRef,
    isVerifying,
    verifyResult,
    verifyError,
    handleCurrentChange,
    handleGalleryChange,
    clearCurrent,
    clearGallery,
    handleVerify,
  } = viewModel;

  return (
    <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl w-full mx-auto">
      {/* Image Uploader & Visualizers */}
      <section className="lg:col-span-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Image (Check-in) Slot */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Target Image (Check-in)</h3>
              {currentImg && <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{currentImg.name}</span>}
            </div>

            <div className="relative border border-slate-800 bg-slate-950/80 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center">
              {currentPreview ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    ref={currentImgRef}
                    src={currentPreview}
                    alt="Current checkin face"
                    className="max-w-full max-h-full object-contain"
                    onLoad={() => {
                      if (verifyResult) viewModel.drawVerificationOverlays(verifyResult);
                    }}
                  />
                  <canvas
                    ref={currentCanvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full h-full hover:bg-slate-900/20 transition p-6 text-center">
                  <span className="text-3xl">👤</span>
                  <span className="text-xs font-bold text-slate-300">Upload Target Photo</span>
                  <span className="text-[10px] text-slate-500">Supports JPG, PNG (Max 10MB)</span>
                  <input type="file" accept="image/*" onChange={handleCurrentChange} className="hidden" />
                </label>
              )}
              {currentPreview && (
                <button
                  onClick={clearCurrent}
                  className="absolute top-3 right-3 bg-slate-950/80 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 p-1.5 rounded-full border border-slate-850 transition"
                  title="Remove image"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Gallery Reference Image Slot */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Gallery Reference Photo</h3>
              {galleryImg && <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{galleryImg.name}</span>}
            </div>

            <div className="relative border border-slate-800 bg-slate-950/80 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center">
              {galleryPreview ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    ref={galleryImgRef}
                    src={galleryPreview}
                    alt="Gallery reference face"
                    className="max-w-full max-h-full object-contain"
                    onLoad={() => {
                      if (verifyResult) viewModel.drawVerificationOverlays(verifyResult);
                    }}
                  />
                  <canvas
                    ref={galleryCanvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full h-full hover:bg-slate-900/20 transition p-6 text-center">
                  <span className="text-3xl">🗃️</span>
                  <span className="text-xs font-bold text-slate-300">Upload Reference Photo</span>
                  <span className="text-[10px] text-slate-500">Unmasked original registration photo</span>
                  <input type="file" accept="image/*" onChange={handleGalleryChange} className="hidden" />
                </label>
              )}
              {galleryPreview && (
                <button
                  onClick={clearGallery}
                  className="absolute top-3 right-3 bg-slate-950/80 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 p-1.5 rounded-full border border-slate-850 transition"
                  title="Remove image"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Inference Action Button */}
        <div className="flex justify-center mt-2">
          <button
            onClick={handleVerify}
            disabled={!currentImg || !galleryImg || isVerifying}
            className={`px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-sm tracking-wide transition shadow-lg flex items-center gap-3 ${(!currentImg || !galleryImg || isVerifying)
              ? "opacity-50 cursor-not-allowed"
              : "hover:from-cyan-400 hover:to-blue-500 active:scale-98 shadow-cyan-500/10"
            }`}
          >
            {isVerifying ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                Running 5-Stage Verification...
              </>
            ) : (
              <>
                <span>🛡️</span>
                Run 5-Stage Adaptive Verification
              </>
            )}
          </button>
        </div>

        {verifyError && (
          <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-4 text-xs text-rose-300 flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <p>{verifyError}</p>
          </div>
        )}
      </section>

      {/* Verification Results Panel */}
      <section className="lg:col-span-4 flex flex-col gap-6">
        {/* Status Panel */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-900 pb-2">
            Verification Result
          </h2>

          {verifyResult ? (
            <div className="flex flex-col gap-4">
              {/* Big Match Badge */}
              <div className={`p-4 rounded-xl flex items-center gap-4 ${verifyResult.verified ? "bg-emerald-950/40 border border-emerald-900/40" : "bg-rose-950/40 border border-rose-900/40"}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${verifyResult.verified ? "bg-emerald-500/10 text-emerald-400 animate-pulse" : "bg-rose-500/10 text-rose-400"}`}>
                  {verifyResult.verified ? "✅" : "❌"}
                </div>
                <div>
                  <h4 className={`text-md font-black tracking-wider uppercase ${verifyResult.verified ? "text-emerald-400" : "text-rose-400"}`}>
                    {verifyResult.verified ? "MATCHED (SAFE)" : "MISMATCH (ALERT)"}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Weighted Fusion Score: {verifyResult.matchingScore.toFixed(3)}
                  </p>
                </div>
              </div>

              {/* Similarity Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Decision Match Score</span>
                  <span className="font-semibold text-slate-200">{(verifyResult.matchingScore * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${verifyResult.verified ? "bg-emerald-500 shadow-md shadow-emerald-500/35" : "bg-rose-500 shadow-md shadow-rose-500/35"}`}
                    style={{ width: `${Math.max(0, Math.min(100, verifyResult.matchingScore * 100))}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                  <span>Threshold: 65%</span>
                  <span>Target: {(verifyResult.matchingScore * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Mask Info */}
              <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Adaptive Mode</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">
                    {verifyResult.maskDetected ? "Masked Mode Activated" : "Normal Mode"}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${verifyResult.maskDetected
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-slate-900 text-slate-400 border-slate-800"
                }`}>
                  {verifyResult.maskDetected ? "MASKED" : "UNMASKED"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              Upload photos and click verify to view adaptive decision details.
            </div>
          )}
        </div>

        {/* Fusion weights breakdown */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-900 pb-2">
            Adaptive Decision Fusion (Stage 5)
          </h2>

          {verifyResult ? (
            <div className="flex flex-col gap-3">
              <div className="text-[11px] text-slate-500 mb-1 leading-relaxed">
                The system dynamically allocates fusion weights based on the presence of a face mask.
              </div>

              {/* Upper Face region */}
              <div className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/60">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400">Upper Face (Eyes/Forehead)</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">Sim: {verifyResult.similarities.upper_face.toFixed(3)}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-cyan-400">wt: {verifyResult.appliedWeights.alpha_1_upper.toFixed(2)}</span>
                </div>
              </div>

              {/* Middle Face region */}
              <div className={`flex items-center justify-between p-2.5 rounded-lg border transition ${verifyResult.maskDetected
                ? "bg-slate-950/10 border-slate-950/40 opacity-40"
                : "bg-slate-950/40 border-slate-900/60"
              }`}>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400">Middle Face (Nose/Cheeks)</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">Sim: {verifyResult.similarities.middle_face.toFixed(3)}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-cyan-400">wt: {verifyResult.appliedWeights.alpha_2_middle.toFixed(2)}</span>
                </div>
              </div>

              {/* Lower Face region */}
              <div className={`flex items-center justify-between p-2.5 rounded-lg border transition ${verifyResult.maskDetected
                ? "bg-slate-950/10 border-slate-950/40 opacity-40"
                : "bg-slate-950/40 border-slate-900/60"
              }`}>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400">Lower Face (Mouth/Chin)</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">Sim: {verifyResult.similarities.lower_face.toFixed(3)}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-cyan-400">wt: {verifyResult.appliedWeights.alpha_3_lower.toFixed(2)}</span>
                </div>
              </div>

              {/* Dynamic FACS region */}
              <div className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/60">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400">Dynamic FACS Expression</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">Sim: {verifyResult.similarities.dynamic_facs.toFixed(3)}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-cyan-400">wt: {verifyResult.appliedWeights.beta_dynamic.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              Run verification to view the adaptive weights layout.
            </div>
          )}
        </div>

        {/* Coordinates Telemetry */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex-1 flex flex-col">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-900 pb-2">
            Verification Telemetry
          </h2>
          {verifyResult ? (
            <div className="font-mono text-[9px] text-cyan-400/80 flex-1 overflow-y-auto max-h-[160px] flex flex-col gap-2">
              <div>
                <span className="text-slate-500 font-bold uppercase">Target BBox:</span> [{verifyResult.targetBbox?.join(", ")}]
                <div className="text-slate-400 ml-2">Landmarks: [{verifyResult.targetLandmarks?.map(pt => `(${pt[0]},${pt[1]})`).join(", ")}]</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase">Gallery BBox:</span> [{verifyResult.galleryBbox?.join(", ")}]
                <div className="text-slate-400 ml-2">Landmarks: [{verifyResult.galleryLandmarks?.map(pt => `(${pt[0]},${pt[1]})`).join(", ")}]</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs my-auto">
              No telemetry logs.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
