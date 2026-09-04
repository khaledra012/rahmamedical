import React from 'react';
import './Alert.css';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const Alert = ({
  variant = 'info', // 'success' | 'warning' | 'error' | 'info'
  title,
  children,
  onClose,
  className = '',
}) => {
  const icons = {
    success: <CheckCircle2 size={20} className="alert-icon" />,
    warning: <AlertTriangle size={20} className="alert-icon" />,
    error: <AlertCircle size={20} className="alert-icon" />,
    info: <Info size={20} className="alert-icon" />,
  };

  return (
    <div className={`alert alert-${variant} ${className}`} role="alert">
      <div className="alert-icon-wrapper">{icons[variant]}</div>
      <div className="alert-content">
        {title && <h4 className="alert-title">{title}</h4>}
        <div className="alert-message">{children}</div>
      </div>
      {onClose && (
        <button className="alert-close-btn" onClick={onClose} aria-label="إغلاق التنبيه">
          <X size={16} />
        </button>
      )}
    </div>
  );
};
