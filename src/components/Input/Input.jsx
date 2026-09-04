import React, { forwardRef } from 'react';
import './Input.css';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon = null,
  iconPosition = 'start',
  fullWidth = true,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className={`input-wrapper ${fullWidth ? 'input-full-width' : ''} ${error ? 'input-has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {props.required && <span className="input-required-mark">*</span>}
        </label>
      )}
      <div className="input-field-container">
        {icon && iconPosition === 'start' && (
          <span className="input-icon input-icon-start">{icon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`input-field ${icon ? (iconPosition === 'start' ? 'input-pad-start' : 'input-pad-end') : ''}`}
          {...props}
        />
        {icon && iconPosition === 'end' && (
          <span className="input-icon input-icon-end">{icon}</span>
        )}
      </div>
      {error && <span className="input-error-msg">{error}</span>}
      {!error && helperText && <span className="input-helper-msg">{helperText}</span>}
    </div>
  );
});

Input.displayName = 'Input';
