import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  RotateCcw,
  X,
} from 'lucide-react';
import { RahmaLogo } from '../../components/RahmaLogo/RahmaLogo';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    {
      name: 'لوحة المؤشرات',
      path: '/',
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: 'المنتجات والنشر',
      path: '/products',
      icon: <Package size={20} />,
    },
    {
      name: 'الطلبات والفوترة',
      path: '/orders',
      icon: <ShoppingCart size={20} />,
    },
    {
      name: 'سجل العمليات (Logs)',
      path: '/sync-logs',
      icon: <RotateCcw size={20} />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header with Rahma Official Logo */}
        <div className="sidebar-brand">
          <RahmaLogo size="sm" />
          <button className="sidebar-mobile-close" onClick={onClose} aria-label="إغلاق القائمة">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-title">القائمة الرئيسية</span>
          <ul className="sidebar-menu">
            {navItems.map((item) => (
              <li key={item.path} className="sidebar-menu-item">
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                  }
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-link-text">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Integration Status Footer */}
        <div className="sidebar-footer">
          <div className="integration-card">
            <div className="integration-indicator">
              <span className="indicator-dot indicator-online"></span>
              <span className="indicator-label">دفترة ⟷ زد (ترينديول قريباً)</span>
            </div>
            <p className="integration-status-text">رحمة للمستلزمات الطبية</p>
          </div>
        </div>
      </aside>
    </>
  );
};
