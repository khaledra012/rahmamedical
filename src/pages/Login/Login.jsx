import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Alert, RahmaLogo } from '../../components';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import './Login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-wrapper">
        {/* Brand Header with Rahma Official Logo */}
        <div className="login-header">
          <div className="login-logo-container">
            <RahmaLogo size="lg" showSubtitle={true} />
          </div>
          <p className="login-subtitle">نظام الربط والتزامن الذكي (دفترة ⟷ زد)</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="login-alert" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            required
            autoComplete="email"
          />

          <div className="password-input-group">
            <Input
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="login-submit-btn"
          >
            تسجيل الدخول
          </Button>
        </form>

        {/* Secure Footer */}
        <div className="login-footer">
          <ShieldCheck size={16} color="var(--color-success)" />
          <span>رحمة للمستلزمات الطبية — اتصال مشفّر وآمن</span>
        </div>
        <div className="login-by-tadween">
          <span>By Tadween</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
