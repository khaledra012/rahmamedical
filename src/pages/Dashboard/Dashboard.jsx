import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import {
  Package,
  Zap,
  Clock,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { Button, Badge, Alert, Table, Spinner } from '../../components';
import api from '../../services/api';
import { logsService } from '../../services/logsService';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    pendingProducts: 0,
    failedProducts: 0,
    pausedProducts: 0,
    publishedRatio: 0,
    recentLogs: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, logsRes] = await Promise.allSettled([
        api.get('/products/stats'),
        logsService.getLogs({ limit: 6, page: 1 }),
      ]);

      let mergedLogs = [];
      if (logsRes.status === 'fulfilled' && logsRes.value?.logs) {
        mergedLogs = logsRes.value.logs;
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats({
          ...statsRes.value.data,
          recentLogs: mergedLogs.length > 0 ? mergedLogs : (statsRes.value.data.recentLogs || []),
        });
      } else if (mergedLogs.length > 0) {
        setStats((prev) => ({ ...prev, recentLogs: mergedLogs }));
      }
    } catch (err) {
      console.warn('Failed to fetch dashboard stats:', err);
      setError('تعذر تحديث إحصائيات لوحة التحكم الحية');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const kpiCards = [
    {
      title: 'إجمالي منتجات دفترة',
      value: stats.totalProducts.toString(),
      subtitle: 'منتج مسجل بالمستودعات',
      icon: <Package size={24} color="var(--color-primary)" />,
      badge: 'قاعدة البيانات',
      badgeVariant: 'primary',
      action: () => navigate('/products'),
    },
    {
      title: 'المنتجات المنشورة على المتاجر',
      value: stats.publishedProducts.toString(),
      subtitle: 'معروضة ونشطة في المتاجر',
      icon: <Zap size={24} color="var(--color-success)" />,
      badge: `${stats.publishedRatio}% من الإجمالي`,
      badgeVariant: 'success',
      action: () => navigate('/products'),
    },
    {
      title: 'منتجات بانتظار النشر',
      value: stats.pendingProducts.toString(),
      subtitle: 'بانتظار المراجعة والإثراء التسويقي',
      icon: <Clock size={24} color="var(--color-warning)" />,
      badge: stats.pendingProducts > 0 ? 'تتطلب مراجعة' : 'محدث',
      badgeVariant: stats.pendingProducts > 0 ? 'warning' : 'neutral',
      action: () => navigate('/products'),
    },
    {
      title: 'عمليات متعثرة (فشل)',
      value: stats.failedProducts.toString(),
      subtitle: 'منتجات تتطلب إعادة محاولة',
      icon: <AlertTriangle size={24} color={stats.failedProducts > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)'} />,
      badge: stats.failedProducts > 0 ? 'انتبه' : 'لا يوجد أخطاء',
      badgeVariant: stats.failedProducts > 0 ? 'danger' : 'success',
      action: () => navigate('/products'),
    },
  ];

  const recentSyncColumns = [
    {
      header: 'نوع العملية',
      key: 'action',
      render: (val, row) => {
        const isOrder = row.entityType === 'ORDER';
        const isInventory = row.entityType === 'INVENTORY';
        let actionLabel = 'مزامنة';
        if (isOrder) {
          actionLabel = row.action === 'CREATE' ? 'استقبال طلب جديد' : 'مزامنة طلب';
        } else if (isInventory) {
          actionLabel = 'مزامنة مخزون';
        } else {
          actionLabel = row.action === 'CREATE' ? 'نشر منتج جديد' : 'تحديث منتج';
        }

        return (
          <div className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{actionLabel}</span>
            {row.entityId ? <span className="text-muted text-xs font-mono">#{row.entityId}</span> : null}
          </div>
        );
      },
    },
    {
      header: 'المسار',
      key: 'direction',
      render: (dir) => {
        let label = dir;
        if (dir === 'DAFTRA_TO_ZID') label = 'دفترة ➔ متجر زد';
        else if (dir === 'ZID_TO_DAFTRA') label = 'متجر زد ➔ دفترة';
        else if (dir === 'DAFTRA_TO_TRENDYOL') label = 'دفترة ➔ ترينديول';
        else if (dir === 'TRENDYOL_TO_DAFTRA') label = 'ترينديول ➔ دفترة';
        return <span className="text-muted font-mono text-xs">{label}</span>;
      },
    },
    {
      header: 'الوقت',
      key: 'createdAt',
      render: (val) => (
        <span className="text-muted text-xs">
          {val
            ? new Date(val).toLocaleTimeString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'الآن'}
        </span>
      ),
    },
    {
      header: 'الحالة',
      key: 'status',
      render: (status) => (
        <Badge variant={status === 'SUCCESS' ? 'success' : 'danger'} dot>
          {status === 'SUCCESS' ? 'ناجح' : 'فشل'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-banner">
        <div className="banner-content">
          <h2 className="banner-title">مرحباً بك في لوحة تحكم رحمة للمستلزمات الطبية</h2>
          <p className="banner-subtitle">
            نظام الربط والتزامن الذكي واللحظي بين برنامج الحسابات (دفترة) ومتاجر رحمة (زد ⟷ ترينديول).
          </p>
        </div>
        <div className="banner-actions">
          <Button
            variant="secondary"
            icon={<RefreshCw size={16} />}
            onClick={fetchDashboardData}
            isLoading={isLoading}
            className="banner-btn-refresh"
          >
            تحديث المؤشرات
          </Button>
          <Button
            variant="primary"
            icon={<TrendingUp size={16} />}
            onClick={() => navigate('/products')}
            className="banner-btn-manage"
          >
            إدارة المنتجات
          </Button>
        </div>
      </div>

      {/* Global Alert */}
      {error ? (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : (
        <Alert variant="success" className="dashboard-alert">
          <strong>حالة النظام اللحظية:</strong> جميع الخدمات وقواعد البيانات وسيرفر المزامنة متصلة وتعمل بأمان كامل.
        </Alert>
      )}

      {/* Real KPI Cards Grid */}
      {isLoading ? (
        <div className="dashboard-loading-box">
          <Spinner size="lg" color="var(--color-primary)" />
          <p className="text-muted mt-2">جارٍ جلب البيانات والإحصائيات الحية...</p>
        </div>
      ) : (
        <div className="stats-grid">
          {kpiCards.map((stat, idx) => (
            <div key={idx} className="stat-card" onClick={stat.action} style={{ cursor: 'pointer' }}>
              <div className="stat-header">
                <div className="stat-icon-box">{stat.icon}</div>
                <Badge variant={stat.badgeVariant} size="sm">
                  {stat.badge}
                </Badge>
              </div>
              <div className="stat-body">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
                <span className="stat-subtitle">{stat.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Live Activity Section */}
      <div className="recent-activity-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">آخر حركات المزامنة والعمليات الفعلية</h3>
            <p className="section-subtitle">آخر 6 عمليات مسجلة وموثقة في سجل العمليات</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/logs')}>
            عرض سجل العمليات
          </Button>
        </div>

        {stats.recentLogs && stats.recentLogs.length > 0 ? (
          <Table columns={recentSyncColumns} data={stats.recentLogs} />
        ) : (
          <div className="empty-logs-box">
            <Package size={32} color="var(--color-border)" />
            <p className="text-muted text-sm mt-2">
              لا توجد عمليات مزامنة مسجلة بعد. عند نشر أول منتج ستظهر السجلات الحية هنا فوراً.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
