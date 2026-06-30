"use client";

import { useCustomerViewModel } from "../viewmodels/useCustomerViewModel";
import ImageUpload from "../components/ImageUpload";
import ResultCard from "../components/ResultCard";
import MembersList from "../components/MembersList";

export default function Home() {
  const {
    previewUrl,
    loading,
    error,
    customer,
    newName,
    registerStatus,
    activeTab,
    customersList,
    listLoading,
    listError,
    setNewName,
    selectFile,
    checkin,
    register,
    changeTab,
    fetchCustomers,
  } = useCustomerViewModel();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-5 px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-200">
              C
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">CRM Face Recognizer</h1>
              <p className="text-xs text-slate-500 font-medium">Hệ thống nhận diện & phân tích dữ liệu khách hàng (Clean Architecture)</p>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => changeTab("checkin")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === "checkin"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Nhận diện & Đăng ký
            </button>
            <button
              onClick={() => changeTab("members")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === "members"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Danh sách thành viên
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
        {activeTab === "checkin" ? (
          /* Checkin / Register Tab */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Column: Image Upload Component */}
            <ImageUpload
              previewUrl={previewUrl}
              onFileSelect={selectFile}
              onCheckin={checkin}
              disabled={!previewUrl}
              loading={loading}
            />

            {/* Right Column: Result Card Component */}
            <div className="flex flex-col gap-6">
              {error && (
                <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl flex gap-3 text-rose-800">
                  <svg className="w-6 h-6 flex-shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold text-sm">Đã xảy ra lỗi hệ thống</h3>
                    <p className="text-xs text-rose-600/90 mt-1">{error}</p>
                  </div>
                </div>
              )}
              
              {loading && !customer && (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center py-16 flex flex-col items-center justify-center animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="h-5 bg-slate-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded w-64"></div>
                </div>
              )}

              {!loading && (
                <ResultCard
                  customer={customer}
                  newName={newName}
                  onNameChange={setNewName}
                  onRegister={register}
                  registerStatus={registerStatus}
                  loading={loading}
                />
              )}
            </div>
          </div>
        ) : (
          /* Members List Tab */
          <MembersList
            customers={customersList}
            loading={listLoading}
            error={listError}
            onRefresh={fetchCustomers}
          />
        )}
      </main>
    </div>
  );
}
