export default function ImageUpload({ previewUrl, onFileSelect, onCheckin, disabled, loading }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">1. Tải ảnh Khách hàng check-in</h2>
        <p className="text-sm text-slate-500 mt-1">Chọn hoặc kéo thả ảnh chân dung để bắt đầu kiểm tra đối sánh.</p>
      </div>

      {/* Upload Box */}
      <div className="relative group">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {previewUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-900 flex items-center justify-center">
            <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-semibold bg-slate-800/80 px-4 py-2 rounded-full backdrop-blur-sm">Thay đổi ảnh</span>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 group-hover:border-indigo-400 rounded-xl aspect-[4/3] flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 group-hover:bg-slate-50 transition-all">
            <svg className="w-12 h-12 text-slate-400 group-hover:text-indigo-500 mb-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p className="text-sm font-semibold text-slate-700">Tải lên tệp ảnh chân dung</p>
            <p className="text-xs text-slate-400 mt-1">Hỗ trợ PNG, JPG, JPEG</p>
          </div>
        )}
      </div>

      {/* Check-in Button */}
      <button
        onClick={onCheckin}
        disabled={disabled || loading}
        className={`w-full py-3.5 px-4 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2 ${
          disabled || loading
            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
            : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-100"
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang đối sánh ảnh...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Kiểm tra Check-in
          </>
        )}
      </button>
    </section>
  );
}
