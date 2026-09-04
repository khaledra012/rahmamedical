import React, { useEffect } from 'react';
import './Modal.css';
import { Button } from '../Button/Button';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  onConfirm,
  isConfirmLoading = false,
  confirmVariant = 'primary',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-container modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="إغلاق">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {(footer || onConfirm) && (
          <div className="modal-footer">
            {footer || (
              <>
                <Button variant="ghost" onClick={onClose} disabled={isConfirmLoading}>
                  {cancelText}
                </Button>
                <Button
                  variant={confirmVariant}
                  onClick={onConfirm}
                  isLoading={isConfirmLoading}
                >
                  {confirmText}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
