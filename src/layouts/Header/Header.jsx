import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { Menu, User, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ChangePasswordModal } from '../../components/ChangePasswordModal/ChangePasswordModal';

export const Header = ({ onToggleSidebar, title = 'لوحة التحكم المركزية' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <button
          className="header-menu-btn"
          onClick={onToggleSidebar}
          aria-label="فتح القائمة"
        >
          <Menu size={22} />
        </button>
        <h2 className="header-page-title">{title}</h2>
      </div>

      <div className="header-right">
        {/* Sync Status Badge */}
        <div className="header-badge-status">
          <span className="live-pulse-dot" />
          <span className="live-text">المزامنة نشطة</span>
        </div>

        {/* User Profile */}
        <div className="header-user-section">
          <div className="user-avatar">
            <User size={18} />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'مدير النظام'}</span>
            <span className="user-role">
              {user?.role === 'admin' ? 'مدير عام' : 'مشرف'}
            </span>
          </div>
          <button
            className="header-key-btn"
            onClick={() => setIsPasswordModalOpen(true)}
            title="تغيير كلمة المرور"
            aria-label="تغيير كلمة المرور"
          >
            <KeyRound size={17} />
          </button>
          <button
            className="header-logout-btn"
            onClick={handleLogout}
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </header>
  );
};
