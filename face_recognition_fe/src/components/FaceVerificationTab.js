import React from "react";

export function FaceVerificationTab({ viewModel }) {
  const [activeTab, setActiveTab] = React.useState("proposed");
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
                Run 5-Stage Adaptive Verification
              </>
            )}
          </button>
        </div>

        {verifyError && (
          <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-4 text-xs text-rose-300 flex items-center gap-3">
            <p>{verifyError}</p>
          </div>
        )}
      </section>

      {/* Verification Results Panel */}
      <section className="lg:col-span-4 flex flex-col gap-6">
        {/* Status Panel */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden">
          {/* Tab toggles */}
          <div className="flex border-b border-slate-800 mb-4">
            <button
              onClick={() => setActiveTab("proposed")}
              className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider transition ${
                activeTab === "proposed"
                  ? "text-cyan-400 border-b-2 border-cyan-500"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Adaptive Fusion (Ours)
            </button>
            <button
              onClick={() => setActiveTab("original")}
              className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider transition ${
                activeTab === "original"
                  ? "text-slate-200 border-b-2 border-slate-500"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Standard DeepFace
            </button>
          </div>

          {verifyResult ? (
            <div className="flex flex-col gap-4">
              {activeTab === "proposed" ? (
                <>
                  {/* Big Match Badge Proposed */}
                  <div className={`p-4 rounded-xl flex items-center gap-4 ${verifyResult.verified ? "bg-emerald-950/40 border border-emerald-900/40" : "bg-rose-950/40 border border-rose-900/40"}`}>
                    <div>
                      <h4 className={`text-md font-black tracking-wider uppercase ${verifyResult.verified ? "text-emerald-400" : "text-rose-400"}`}>
                        {verifyResult.verified ? "IDENTITY VERIFIED" : "IDENTITY MISMATCH"}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Fused Similarity: {((1.0 - verifyResult.fusedDistance) * 100).toFixed(1)}% (Dist: {verifyResult.fusedDistance.toFixed(3)})
                      </p>
                    </div>
                  </div>

                  {/* Similarity Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Adaptive Fusion Score</span>
                      <span className="font-semibold text-slate-200">{((1.0 - verifyResult.fusedDistance) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${verifyResult.verified ? "bg-emerald-500 shadow-md shadow-emerald-500/35" : "bg-rose-500 shadow-md shadow-rose-500/35"}`}
                        style={{ width: `${Math.max(0, Math.min(100, (1.0 - verifyResult.fusedDistance) * 100))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                      <span>Threshold: {((1.0 - verifyResult.fusedThreshold) * 100).toFixed(0)}% (Dist: {verifyResult.fusedThreshold.toFixed(2)})</span>
                      <span>Target: {((1.0 - verifyResult.fusedDistance) * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Plastic Surgery Alerts */}
                  {verifyResult.eyesDistance <= 0.60 && (verifyResult.noseDistance > 0.60 || verifyResult.mouthDistance > 0.60) ? (
                    <div className="bg-amber-950/30 rounded-xl p-3 border border-amber-500/20 flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Plastic Surgery Detection</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {verifyResult.noseDistance > 0.60 && "• Rhinoplasty (Nose alteration) suspected. "}
                        {verifyResult.mouthDistance > 0.60 && "• Genioplasty/Cheiloplasty (Lower face alteration) suspected. "}
                        Ignoring surgically altered regions, relying on invariant eye structure.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-900 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase">Adaptive Verification Mode</span>
                        <p className="text-xs font-bold text-slate-200 mt-0.5">
                          No heavy alterations detected
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold border bg-slate-900 text-slate-400 border-slate-800">
                        BALANCED
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Big Match Badge Original */}
                  {(() => {
                    const isOriginalVerified = verifyResult.distance < verifyResult.threshold;
                    return (
                      <>
                        <div className={`p-4 rounded-xl flex items-center gap-4 ${isOriginalVerified ? "bg-emerald-950/40 border border-emerald-900/40" : "bg-rose-950/40 border border-rose-900/40"}`}>
                          <div>
                            <h4 className={`text-md font-black tracking-wider uppercase ${isOriginalVerified ? "text-emerald-400" : "text-rose-400"}`}>
                              {isOriginalVerified ? "IDENTITY VERIFIED" : "IDENTITY MISMATCH"}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Global Similarity: {((1.0 - verifyResult.distance) * 100).toFixed(1)}% (Dist: {verifyResult.distance.toFixed(3)})
                            </p>
                          </div>
                        </div>

                        {/* Similarity Progress bar */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-slate-400">Global Holistic Score</span>
                            <span className="font-semibold text-slate-200">{((1.0 - verifyResult.distance) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isOriginalVerified ? "bg-emerald-500" : "bg-rose-500"}`}
                              style={{ width: `${Math.max(0, Math.min(100, (1.0 - verifyResult.distance) * 100))}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                            <span>Threshold: {((1.0 - verifyResult.threshold) * 100).toFixed(0)}% (Dist: {verifyResult.threshold.toFixed(2)})</span>
                            <span>Target: {((1.0 - verifyResult.distance) * 100).toFixed(0)}%</span>
                          </div>
                        </div>

                        {/* Informational limitations alert */}
                        <div className="bg-rose-950/20 rounded-xl p-3 border border-rose-500/20 flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Holistic deepface limitations</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Standard DeepFace matches faces using the entire image. When a specific region (like the nose or jaw) undergoes cosmetic changes, the global embedding drifts, causing false rejections.
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
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
            Adaptive Decision Fusion
          </h2>

          {verifyResult ? (
            <div className="flex flex-col gap-3">
              <div className="text-[11px] text-slate-500 mb-1 leading-relaxed">
                Weights are dynamically shifted away from suspected surgically altered patches.
              </div>

              {/* Upper Face region */}
              <div className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/60">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400">Upper Face (Eyes & Forehead)</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Cosine Dist: {verifyResult.eyesDistance.toFixed(3)} ({((1.0 - verifyResult.eyesDistance) * 100).toFixed(1)}% match)
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-cyan-400">Weight: {(verifyResult.eyesWeight * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Middle Face region */}
              <div className={`flex items-center justify-between p-2.5 rounded-lg border transition ${verifyResult.noseDistance > 0.60
                ? "bg-amber-950/20 border-amber-500/20"
                : "bg-slate-950/40 border-slate-900/60"
              }`}>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Middle Face (Nose) {verifyResult.noseDistance > 0.60 && "⚠️ ALTERED"}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Cosine Dist: {verifyResult.noseDistance.toFixed(3)} ({((1.0 - verifyResult.noseDistance) * 100).toFixed(1)}% match)
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-cyan-400">Weight: {(verifyResult.noseWeight * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Lower Face region */}
              <div className={`flex items-center justify-between p-2.5 rounded-lg border transition ${verifyResult.mouthDistance > 0.60
                ? "bg-amber-950/20 border-amber-500/20"
                : "bg-slate-950/40 border-slate-900/60"
              }`}>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Lower Face (Mouth & Chin) {verifyResult.mouthDistance > 0.60 && "⚠️ ALTERED"}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Cosine Dist: {verifyResult.mouthDistance.toFixed(3)} ({((1.0 - verifyResult.mouthDistance) * 100).toFixed(1)}% match)
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-cyan-400">Weight: {(verifyResult.mouthWeight * 100).toFixed(0)}%</span>
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
                <span className="text-slate-500 font-bold uppercase text-[9px]">Global DeepFace Engine:</span>
                <div className="text-slate-400 ml-2">Model: {verifyResult.model}</div>
                <div className="text-slate-400 ml-2">Metric: {verifyResult.similarityMetric}</div>
                <div className="text-slate-400 ml-2">Global Distance: {verifyResult.distance.toFixed(4)} (Threshold: {verifyResult.threshold.toFixed(2)})</div>
              </div>
              <div className="border-t border-slate-800/50 my-1 pt-1">
                <span className="text-slate-500 font-bold uppercase text-[9px]">Target BBox:</span> [{verifyResult.targetBbox?.join(", ")}]
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase text-[9px]">Gallery BBox:</span> [{verifyResult.galleryBbox?.join(", ")}]
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
