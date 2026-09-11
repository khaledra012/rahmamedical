import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import './MainLayout.css';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'لوحة التحكم والمؤشرات';
      case '/products':
        return 'إدارة المنتجات والنشر';
      case '/orders':
        return 'إدارة الطلبات والفوترة والمحاسبة';
      case '/sync-logs':
        return 'سجل عمليات المزامنة وإعادة المحاولة';
      case '/analytics':
        return 'تقارير المبيعات والإحصائيات';
      default:
        return 'لوحة التحكم';
    }
  };

  return (
    <div className="layout-root">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="layout-main-wrapper">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title={getPageTitle(location.pathname)}
        />

        <main className="layout-content">
          <div className="layout-container">
            <Outlet />
          </div>
          <footer className="layout-footer">
            <span>رحمة للمستلزمات الطبية</span>
            <span className="layout-footer-divider">•</span>
            <span className="layout-footer-by">By Tadween</span>
          </footer>
        </main>
      </div>
    </div>
  );
};
