import React from 'react';
import './Badge.css';

export const Badge = ({
  children,
  variant = 'primary', // 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size = 'md',        // 'sm' | 'md'
  dot = false,
  className = '',
}) => {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {dot && <span className="badge-dot" />}
      <span className="badge-content">{children}</span>
    </span>
  );
};
