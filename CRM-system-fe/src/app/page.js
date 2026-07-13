"use client";

import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DashboardView from "../components/DashboardView";
import OrderManagementView from "../components/OrderManagementView";
import CdrsView from "../components/CdrsView";
import MembersList from "../components/MembersList";
import LoginView from "../components/LoginView";
import ProductManagementView from "../components/ProductManagementView";

import { useCrmViewModel } from "../viewmodels/useCrmViewModel";
import { useCustomerViewModel } from "../viewmodels/useCustomerViewModel";
import { useAuthViewModel } from "../viewmodels/useAuthViewModel";

export default function Home() {
  const authVm = useAuthViewModel();
  const crmVm = useCrmViewModel(authVm.token);
  const customerVm = useCustomerViewModel();

  const renderContent = () => {
    switch (crmVm.activeTab) {
      case "dashboard":
        return (
          <DashboardView
            stats={crmVm.dashboardStats}
            onNavigate={crmVm.setActiveTab}
          />
        );
      case "orders":
      case "orderList":
        return (
          <OrderManagementView
            orders={crmVm.orders}
            searchTerm={crmVm.searchTerm}
            onSearch={crmVm.handleSearch}
          />
        );
      case "products":
        return (
          <ProductManagementView
            products={crmVm.products}
            onUpdateProduct={crmVm.updateProduct}
          />
        );
      case "cdrs":
        return <CdrsView cdrs={crmVm.cdrs} />;
      case "members":
        return (
          <div className="p-6">
            <MembersList
              customers={customerVm.customersList}
              loading={customerVm.listLoading}
              error={customerVm.listError}
              onRefresh={customerVm.fetchCustomers}
            />
          </div>
        );
      case "bulkDistribution":
      case "validation":
      default:
        return (
          <div className="p-12 text-center border border-dashed border-slate-300 rounded-2xl m-8">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
            <h3 className="font-bold text-slate-700 text-sm">Feature Under Construction</h3>
            <p className="text-xs text-slate-400 mt-1">This module is prepared in the UI structure and waiting for Java CRM API hooks.</p>
          </div>
        );
    }
  };

  // Render Login Screen if not authenticated
  if (!authVm.isAuthenticated) {
    return (
      <LoginView
        onLogin={authVm.login}
        error={authVm.error}
        loading={authVm.loading}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar activeTab={crmVm.activeTab} onTabChange={crmVm.setActiveTab} />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          agentStatus={crmVm.agentStatus}
          onStatusChange={crmVm.handleStatusChange}
          userName={authVm.user?.fullname || "User"}
          userRole={authVm.user?.role || "Agent"}
          onLogout={authVm.logout}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
