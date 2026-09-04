import React, { useState } from 'react';
import './ChangePasswordModal.css';
import { authService } from '../../services/authService';
import { KeyRound, Lock, Eye, EyeOff, X, Check, RefreshCw } from 'lucide-react';
import { Button } from '../Button/Button';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword) {
      setError('يرجى إدخال كلمة المرور الحالية');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب ألا تقل عن 6 خانات');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Password change error:', err);
      const msg = err.response?.data?.message || err.message || 'فشل تغيير كلمة المرور';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <div className="change-password-backdrop" onClick={handleClose}>
      <div className="change-password-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="change-password-header">
          <div className="change-password-title">
            <KeyRound size={18} />
            تغيير كلمة المرور
          </div>
          <button className="change-password-close" onClick={handleClose} aria-label="إغلاق">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="change-password-body">
            {error && <div className="change-alert change-alert-error">{error}</div>}
            {success && (
              <div className="change-alert change-alert-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={16} />
                تم تحديث كلمة المرور بنجاح!
              </div>
            )}

            {/* Current Password */}
            <div className="form-field-group">
              <label className="form-label">كلمة المرور الحالية</label>
              <div className="form-input-wrapper">
                <Lock size={15} className="form-input-icon" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className="form-password-input"
                  placeholder="أدخل كلمة المرور الحالية"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn-toggle-show"
                  onClick={() => setShowCurrent(!showCurrent)}
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-field-group">
              <label className="form-label">كلمة المرور الجديدة (6 خانات كحد أدنى)</label>
              <div className="form-input-wrapper">
                <Lock size={15} className="form-input-icon" />
                <input
                  type={showNew ? 'text' : 'password'}
                  className="form-password-input"
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="btn-toggle-show"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-field-group">
              <label className="form-label">تأكيد كلمة المرور الجديدة</label>
              <div className="form-input-wrapper">
                <Lock size={15} className="form-input-icon" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="form-password-input"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="btn-toggle-show"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="change-password-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
              icon={loading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
