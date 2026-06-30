export default function ResultCard({ customer, newName, onNameChange, onRegister, registerStatus, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister();
  };

  if (!customer) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center py-16 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 className="text-slate-800 font-bold text-base">Chưa có kết quả check-in</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">Hãy tải ảnh khách hàng lên ở cột bên trái và nhấn nút đối sánh.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {customer.identified ? (
        // Khách hàng cũ
        <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Đã nhận diện</span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Chào mừng quay lại!</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Họ và tên khách hàng</p>
              <p className="text-lg font-black text-slate-800 mt-0.5">{customer.name}</p>
            </div>
            <div className="h-px bg-slate-100"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Khoảng cách tương đồng (Cosine)</span>
              <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                {customer.distance.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Khách hàng mới
        <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-2xl shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div>
              <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Khách hàng mới</span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Phát hiện gương mặt mới</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Đăng ký Họ và Tên</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn A"
                value={newName}
                onChange={(e) => onNameChange(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            {registerStatus && (
              <div className={`text-xs p-3 rounded-lg font-medium ${
                registerStatus.status === "success" 
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                  : "bg-rose-50 text-rose-800 border border-rose-100"
              }`}>
                {registerStatus.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !newName.trim()}
              className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-sm transition-all"
            >
              {loading ? "Đang xử lý..." : "Đăng ký thành viên"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
