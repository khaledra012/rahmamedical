import React from 'react';
import './Spinner.css';

export const Spinner = ({ size = 'md', color = 'var(--color-primary)', className = '' }) => {
  return (
    <div
      className={`spinner spinner-${size} ${className}`}
      style={{ borderTopColor: color }}
      role="status"
      aria-label="جار التحميل..."
    />
  );
};
