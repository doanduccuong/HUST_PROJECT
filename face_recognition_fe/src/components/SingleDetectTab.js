import React from "react";

const emotionEmojis = {
  angry: "Angry",
  disgust: "Disgust",
  fear: "Fear",
  happy: "Happy",
  sad: "Sad",
  surprise: "Surprise",
  neutral: "Neutral",
};

const getDominantEmotion = (emotions) => {
  if (!emotions || Object.keys(emotions).length === 0) return { name: "neutral", confidence: 0 };
  let maxEmotion = "neutral";
  let maxVal = -1;
  for (const [emotion, val] of Object.entries(emotions)) {
    if (val > maxVal) {
      maxVal = val;
      maxEmotion = emotion;
    }
  }
  return { name: maxEmotion, confidence: maxVal };
};

export function SingleDetectTab({ viewModel }) {
  const {
    detectImg,
    detectPreview,
    isDetecting,
    detectResult,
    detectError,
    canvasRef,
    imgRef,
    handleImageChange,
    clearImage,
    runDetection,
  } = viewModel;

  return (
    <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl w-full mx-auto">
      {/* Upload & Image Viewer Slot */}
      <section className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4 shadow-lg relative min-h-[450px]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Target Image</h3>
            {detectImg && <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">{detectImg.name}</span>}
          </div>

          <div className="relative border border-slate-800 bg-slate-950/80 rounded-xl overflow-hidden flex-1 flex items-center justify-center min-h-[300px] max-h-[500px]">
            {detectPreview ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  ref={imgRef}
                  src={detectPreview}
                  alt="Target single face"
                  className="max-w-full max-h-full object-contain"
                  onLoad={() => {
                    if (detectResult) viewModel.drawOverlay(detectResult);
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 cursor-pointer w-full h-full hover:bg-slate-900/20 transition p-8 text-center">
                <span className="text-sm font-bold text-slate-300">Upload Target Photo</span>
                <span className="text-xs text-slate-500">Click to import one image file</span>
                <span className="text-[10px] text-slate-650">Supports JPEG, PNG (Max 10MB)</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}

            {detectPreview && (
              <button
                onClick={clearImage}
                className="absolute top-4 right-4 bg-slate-950/80 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 p-2 rounded-full border border-slate-850 transition"
                title="Remove image"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Trigger */}
          <div className="flex justify-center">
            <button
              onClick={runDetection}
              disabled={!detectImg || isDetecting}
              className={`px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-sm tracking-wide transition shadow-lg flex items-center gap-3 ${(!detectImg || isDetecting)
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-cyan-400 hover:to-blue-500 active:scale-98 shadow-cyan-500/10"
              }`}
            >
              {isDetecting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  Detecting Face & Mask...
                </>
              ) : (
                <>
                  Run Face Detection
                </>
              )}
            </button>
          </div>
        </div>

        {detectError && (
          <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-4 text-xs text-rose-300 flex items-center gap-3">
            <p>{detectError}</p>
          </div>
        )}
      </section>

      {/* Diagnostics Panel */}
      <section className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-900 pb-2">
            Inference Result
          </h2>

          {detectResult ? (
            <div className="flex flex-col gap-4">
              {!detectResult.faceDetected ? (
                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-6 text-center">
                  <h3 className="text-sm font-bold text-slate-400 mt-2">No Face Detected</h3>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className={`p-4 rounded-xl flex items-center gap-4 ${detectResult.maskDetected ? "bg-emerald-950/40 border border-emerald-900/40" : "bg-rose-950/40 border border-rose-900/40"}`}>
                    <div>
                      <h4 className={`text-md font-black tracking-wider uppercase ${detectResult.maskDetected ? "text-emerald-400" : "text-rose-400"}`}>
                        {detectResult.maskDetected ? "MASK DETECTED" : "NO MASK"}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Confidence: {(detectResult.maskProbability * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Mask Probability Score</span>
                      <span className="font-semibold text-slate-200">{(detectResult.maskProbability * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${detectResult.maskDetected ? "bg-emerald-500" : "bg-rose-500"}`}
                        style={{ width: `${detectResult.maskProbability * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              Upload photo and click detect to view results.
            </div>
          )}
        </div>

        {/* DeepFace Facial Analytics Card */}
        {detectResult && detectResult.faceDetected && (
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-900 pb-2 flex items-center justify-between">
              <span>DeepFace Facial Attributes</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-900">Standard API</span>
            </h2>

            <div className="flex flex-col gap-4">
              {/* Dominant Emotion */}
              <div className="bg-slate-950/50 rounded-xl p-3.5 border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Dominant Emotion</span>
                  <h4 className="text-sm font-black text-slate-200 mt-1 capitalize">
                    {emotionEmojis[getDominantEmotion(detectResult.emotions).name] || getDominantEmotion(detectResult.emotions).name}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/30 px-2.5 py-1 rounded-lg border border-cyan-900/50">
                    {getDominantEmotion(detectResult.emotions).confidence.toFixed(1)}% Conf
                  </span>
                </div>
              </div>

              {/* Age */}
              <div className="bg-slate-950/50 rounded-xl p-3.5 border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Estimated Age</span>
                  <h4 className="text-sm font-black text-slate-200 mt-1">
                    {detectResult.age} years old
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500">Regression Model</span>
                </div>
              </div>

              {/* Gender */}
              <div className="bg-slate-950/50 rounded-xl p-3.5 border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Gender Classification</span>
                  <h4 className="text-sm font-black text-slate-200 mt-1 capitalize">
                    {detectResult.gender === "Man" ? "Man" : detectResult.gender === "Woman" ? "Woman" : detectResult.gender}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500">Binary Classifier</span>
                </div>
              </div>

              {/* Race */}
              <div className="bg-slate-950/50 rounded-xl p-3.5 border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Dominant Race / Ethnicity</span>
                  <h4 className="text-sm font-black text-slate-200 mt-1 capitalize">
                    {detectResult.race}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500">Multi-class Model</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coordinates Telemetry */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex-1 flex flex-col">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-900 pb-2">
            Inference Telemetry
          </h2>
          {detectResult && detectResult.faceDetected ? (
            <div className="font-mono text-[10px] text-cyan-400/80 flex-1 overflow-y-auto max-h-[220px] flex flex-col gap-3">
              <div>
                <span className="text-slate-500 font-bold uppercase block mb-1">Bounding Box:</span>
                <span className="text-slate-350 bg-slate-950 px-2 py-1 rounded">[{detectResult.bbox.join(", ")}]</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase block mb-1">Landmarks:</span>
                <div className="grid grid-cols-2 gap-2 text-slate-350">
                  {detectResult.landmarks?.map((pt, idx) => (
                    <span key={idx} className="bg-slate-950 px-2 py-0.5 rounded text-center">
                      Pt{idx + 1}: ({pt[0]}, {pt[1]})
                    </span>
                  ))}
                </div>
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
