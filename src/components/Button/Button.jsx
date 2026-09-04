import React from 'react';
import './Button.css';
import { Spinner } from '../Spinner/Spinner';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  icon = null,
  iconPosition = 'start',
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="btn-spinner-wrapper">
          <Spinner size={size === 'sm' ? 'sm' : 'sm'} color="currentColor" />
          <span className="btn-loading-text">{children}</span>
        </span>
      ) : (
        <>
          {icon && iconPosition === 'start' && <span className="btn-icon btn-icon-start">{icon}</span>}
          <span className="btn-text">{children}</span>
          {icon && iconPosition === 'end' && <span className="btn-icon btn-icon-end">{icon}</span>}
        </>
      )}
    </button>
  );
};
