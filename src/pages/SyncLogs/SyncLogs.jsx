import React, { useState, useEffect, useCallback } from 'react';
import './SyncLogs.css';
import { logsService } from '../../services/logsService';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Eye,
  X,
  Copy,
  Check,
  RefreshCw,
  Activity,
  ArrowRightLeft,
  FileCode2,
} from 'lucide-react';

export const SyncLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalLogs: 0,
    successCount: 0,
    failedCount: 0,
    pendingCount: 0,
    retryingCount: 0,
    successRate: 100,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchLogs = useCallback(
    async (pageToLoad = 1) => {
      try {
        setLoading(true);
        const params = {
          page: pageToLoad,
          limit: 20,
        };

        if (statusFilter !== 'ALL') {
          params.status = statusFilter;
        }

        if (entityFilter !== 'ALL') {
          params.entityType = entityFilter;
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const [logsRes, statsRes] = await Promise.all([
          logsService.getLogs(params),
          logsService.getLogStats(),
        ]);

        if (logsRes) {
          setLogs(logsRes.logs || []);
          if (logsRes.pagination) {
            setPagination(logsRes.pagination);
          }
        }

        if (statsRes) {
          setStats(statsRes);
        }
      } catch (err) {
        console.error('Failed to load sync logs:', err);
        setFeedback({
          type: 'error',
          message: 'تعذر تحميل سجل العمليات من السيرفر. يرجى إعادة المحاولة.',
        });
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, entityFilter, searchQuery]
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  // Handle Retry Action with Optimistic Lock
  const handleRetry = async (logId) => {
    if (retryingId) return; // Prevent concurrent retries

    // 🔒 Optimistic UI update: Mark log as RETRYING immediately to prevent double-clicks
    setRetryingId(logId);
    setLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, status: 'RETRYING' } : l))
    );

    try {
      const response = await logsService.retryLog(logId);
      setFeedback({
        type: 'success',
        message: response.message || 'تمت إعادة المحاولة بنجاح!',
      });

      // Update log record in current table view
      if (response.log) {
        setLogs((prev) =>
          prev.map((l) => (l.id === logId ? response.log : l))
        );
      }

      // Also update selectedLog if modal is currently open
      if (selectedLog && selectedLog.id === logId) {
        setSelectedLog(response.log);
      }

      // Refresh stats
      const updatedStats = await logsService.getLogStats();
      if (updatedStats) setStats(updatedStats);
    } catch (err) {
      console.error('Retry failed:', err);
      const errorMsg =
        err.response?.data?.message || err.message || 'فشلت عملية إعادة المحاولة';
      setFeedback({
        type: 'error',
        message: errorMsg,
      });

      // Revert status to FAILED in view
      setLogs((prev) =>
        prev.map((l) =>
          l.id === logId ? { ...l, status: 'FAILED', errorMessage: errorMsg } : l
        )
      );
    } finally {
      setRetryingId(null);
    }
  };

  const copyToClipboard = (text, sectionName) => {
    try {
      navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
      setCopiedSection(sectionName);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard', err);
    }
  };

  const formatDirection = (direction) => {
    switch (direction) {
      case 'DAFTRA_TO_ZID':
        return 'دفترة ⟵ زد (نشر منتج)';
      case 'DAFTRA_TO_TRENDYOL':
        return 'دفترة ⟵ ترينديول (نشر منتج)';
      case 'ZID_TO_DAFTRA':
        return 'زد ⟵ دفترة (فاتورة طلب)';
      case 'TRENDYOL_TO_DAFTRA':
        return 'ترينديول ⟵ دفترة (فاتورة طلب)';
      default:
        return direction || 'مزامنة';
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="sync-logs-page">
      {/* Header */}
      <div className="sync-logs-header">
        <div>
          <h1 className="sync-logs-title">سجل العمليات والمزامنة (Sync Logs)</h1>
          <p className="sync-logs-subtitle">
            متابعة شاملة لكافة حركات الربط بين دفترة، زد، وترينديول مع فحص الأخطاء وإعادة المحاولة الذكية.
          </p>
        </div>
        <div className="sync-logs-actions">
          <button
            className="filter-chip active"
            onClick={() => fetchLogs(pagination.page)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            تحديث السجلات
          </button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`error-alert-box ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : ''
          }`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
            borderColor: feedback.type === 'success' ? '#a7f3d0' : '#fecaca',
            color: feedback.type === 'success' ? '#065f46' : '#991b1b',
          }}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="logs-stats-grid">
        <div className="log-stat-card">
          <div
            className="log-stat-icon"
            style={{ background: '#f0fdf4', color: '#16a34a' }}
          >
            <Activity size={24} />
          </div>
          <div className="log-stat-content">
            <span className="log-stat-value">{stats.totalLogs}</span>
            <span className="log-stat-label">إجمالي العمليات المسجلة</span>
          </div>
        </div>

        <div className="log-stat-card">
          <div
            className="log-stat-icon"
            style={{ background: '#ecfdf5', color: '#059669' }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div className="log-stat-content">
            <span className="log-stat-value">{stats.successCount}</span>
            <span className="log-stat-label">
              عمليات ناجحة ({stats.successRate}%)
            </span>
          </div>
        </div>

        <div className="log-stat-card">
          <div
            className="log-stat-icon"
            style={{ background: '#fef2f2', color: '#dc2626' }}
          >
            <AlertTriangle size={24} />
          </div>
          <div className="log-stat-content">
            <span className="log-stat-value">{stats.failedCount}</span>
            <span className="log-stat-label">عمليات متعثرة (تتطلب تدخلاً)</span>
          </div>
        </div>

        <div className="log-stat-card">
          <div
            className="log-stat-icon"
            style={{ background: '#eff6ff', color: '#2563eb' }}
          >
            <Clock size={24} />
          </div>
          <div className="log-stat-content">
            <span className="log-stat-value">
              {stats.retryingCount + stats.pendingCount}
            </span>
            <span className="log-stat-label">قيد المعالجة والإعادة</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="logs-controls-panel">
        <div className="logs-controls-row">
          {/* Status Filter Chips */}
          <div className="logs-filter-group">
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                marginLeft: '4px',
              }}
            >
              الحالة:
            </span>
            {[
              { label: 'الكل', value: 'ALL' },
              { label: 'ناجحة', value: 'SUCCESS' },
              { label: 'فاشلة', value: 'FAILED' },
              { label: 'قيد الإعادة', value: 'RETRYING' },
            ].map((chip) => (
              <button
                key={chip.value}
                className={`filter-chip ${
                  statusFilter === chip.value ? 'active' : ''
                }`}
                onClick={() => setStatusFilter(chip.value)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon-inside" />
            <input
              type="text"
              className="logs-search-input"
              placeholder="بحث برابط الطلب أو نص الخطأ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Entity Type Filter */}
        <div className="logs-filter-group">
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              marginLeft: '4px',
            }}
          >
            الكيان:
          </span>
          {[
            { label: 'كافة الكيانات', value: 'ALL' },
            { label: 'طلبات وفواتير (Orders)', value: 'ORDER' },
            { label: 'منتجات (Products)', value: 'PRODUCT' },
          ].map((chip) => (
            <button
              key={chip.value}
              className={`filter-chip ${
                entityFilter === chip.value ? 'active' : ''
              }`}
              onClick={() => setEntityFilter(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="logs-table-card">
        <div className="logs-table-scroll">
          <table className="logs-table">
            <thead>
              <tr>
                <th>التاريخ والوقت</th>
                <th>نوع الحركة والكيان</th>
                <th>المسار والمنصة</th>
                <th>المصدر</th>
                <th>الحالة</th>
                <th>المدة (ms)</th>
                <th>المحاولات</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                      }}
                    >
                      <RefreshCw size={20} className="animate-spin" />
                      <span>جاري جلب السجلات الحية...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                      لا توجد سجلات مطابقة لمعايير البحث الحالية.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    {/* Timestamp */}
                    <td style={{ whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'right' }}>
                      {formatTimestamp(log.createdAt)}
                    </td>

                    {/* Entity & Action */}
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {log.entityType === 'ORDER' ? 'طلب مبيعات' : 'منتج مخزني'}
                        {log.entityId ? ` #${log.entityId}` : ''}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {log.action}
                      </div>
                    </td>

                    {/* Direction */}
                    <td>
                      <span className="direction-badge">
                        <ArrowRightLeft size={12} />
                        {formatDirection(log.direction)}
                      </span>
                    </td>

                    {/* Source */}
                    <td style={{ fontSize: '12px' }}>
                      {log.source === 'WEBHOOK'
                        ? 'ويب هوك فوري'
                        : log.source === 'POLLER'
                        ? 'مجدول كل 5 د'
                        : 'يدوي'}
                    </td>

                    {/* Status Pill */}
                    <td>
                      <span
                        className={`status-pill ${
                          log.status === 'SUCCESS'
                            ? 'success'
                            : log.status === 'FAILED'
                            ? 'failed'
                            : log.status === 'RETRYING'
                            ? 'retrying'
                            : 'pending'
                        }`}
                      >
                        {log.status === 'SUCCESS' && <CheckCircle2 size={12} />}
                        {log.status === 'FAILED' && <AlertTriangle size={12} />}
                        {log.status === 'RETRYING' && (
                          <RefreshCw size={12} className="animate-spin" />
                        )}
                        {log.status === 'SUCCESS'
                          ? 'ناجحة'
                          : log.status === 'FAILED'
                          ? 'فاشلة'
                          : log.status === 'RETRYING'
                          ? 'قيد الإعادة...'
                          : 'معلقة'}
                      </span>
                    </td>

                    {/* Duration */}
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>
                      {log.durationMs ? `${log.durationMs} ms` : '-'}
                    </td>

                    {/* Retries Count */}
                    <td style={{ textAlign: 'center' }}>
                      {log.retriesCount > 0 ? (
                        <span
                          style={{
                            fontWeight: 'bold',
                            color: log.retriesCount > 2 ? '#dc2626' : '#d97706',
                          }}
                        >
                          {log.retriesCount}
                        </span>
                      ) : (
                        '0'
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="log-actions-cell">
                        <button
                          className="btn-inspect"
                          onClick={() => setSelectedLog(log)}
                          title="فحص التفاصيل الدقيقة"
                        >
                          <Eye size={13} />
                          فحص
                        </button>

                        {log.status === 'FAILED' && (
                          <button
                            className="btn-retry-log"
                            onClick={() => handleRetry(log.id)}
                            disabled={retryingId === log.id}
                            title="إعادة المحاولة بنقرة واحدة"
                          >
                            <RotateCcw
                              size={13}
                              className={retryingId === log.id ? 'animate-spin' : ''}
                            />
                            {retryingId === log.id ? 'جاري الإعادة...' : 'إعادة'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="logs-pagination">
          <span>
            عرض الصفحة {pagination.page} من أصل {pagination.totalPages} (إجمالي{' '}
            {pagination.total} عملية)
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={pagination.page <= 1 || loading}
              onClick={() => fetchLogs(pagination.page - 1)}
            >
              السابق
            </button>
            <button
              className="page-btn"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => fetchLogs(pagination.page + 1)}
            >
              التالي
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Log Details Modal */}
      {selectedLog && (
        <div className="log-modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div className="log-modal" onClick={(e) => e.stopPropagation()}>
            <div className="log-modal-header">
              <div className="log-modal-title">
                <FileCode2 size={20} color="var(--color-primary)" />
                تفاصيل العملية #{selectedLog.id} (
                {selectedLog.entityType === 'ORDER' ? 'طلب' : 'منتج'})
              </div>
              <button
                className="log-modal-close"
                onClick={() => setSelectedLog(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="log-modal-body">
              {/* Meta details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  background: 'var(--color-surface-hover)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                }}
              >
                <div>
                  <strong>المسار: </strong>
                  {formatDirection(selectedLog.direction)}
                </div>
                <div>
                  <strong>الحالة: </strong>
                  {selectedLog.status}
                </div>
                <div>
                  <strong>رمز الاستجابة (Status): </strong>
                  {selectedLog.responseStatus || '-'}
                </div>
                <div>
                  <strong>زمن الاستجابة: </strong>
                  {selectedLog.durationMs ? `${selectedLog.durationMs} ms` : '-'}
                </div>
              </div>

              {/* Error Message Box if FAILED */}
              {selectedLog.errorMessage && (
                <div>
                  <div className="modal-section-title" style={{ color: '#dc2626' }}>
                    رسالة الخطأ المسجلة:
                  </div>
                  <div className="error-alert-box">{selectedLog.errorMessage}</div>
                </div>
              )}

              {/* Request URL */}
              <div>
                <div className="modal-section-title">
                  <span>الرابط المطلوب (Request URL):</span>
                </div>
                <div
                  style={{
                    background: '#1e293b',
                    color: '#38bdf8',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    direction: 'ltr',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                    {selectedLog.requestMethod}{' '}
                  </span>
                  {selectedLog.requestUrl}
                </div>
              </div>

              {/* Request Payload (Masked & Cleaned) */}
              <div>
                <div className="modal-section-title">
                  <span>بيانات الطلب المرسلة (Request Payload - مشفر ومحجوب):</span>
                  <button
                    className="btn-copy-json"
                    onClick={() =>
                      copyToClipboard(selectedLog.requestPayload, 'payload')
                    }
                  >
                    {copiedSection === 'payload' ? (
                      <>
                        <Check size={12} color="#16a34a" /> تم النسخ
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> نسخ JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="json-viewer-box">
                  {selectedLog.requestPayload
                    ? JSON.stringify(selectedLog.requestPayload, null, 2)
                    : '// لا يوجد Payload مرسل'}
                </pre>
              </div>

              {/* Response Body (Masked & Cleaned) */}
              <div>
                <div className="modal-section-title">
                  <span>استجابة السيرفر (Response Body):</span>
                  <button
                    className="btn-copy-json"
                    onClick={() =>
                      copyToClipboard(selectedLog.responseBody, 'response')
                    }
                  >
                    {copiedSection === 'response' ? (
                      <>
                        <Check size={12} color="#16a34a" /> تم النسخ
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> نسخ JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="json-viewer-box">
                  {selectedLog.responseBody
                    ? JSON.stringify(selectedLog.responseBody, null, 2)
                    : '// لا توجد استجابة'}
                </pre>
              </div>

              {/* Modal Footer with Retry */}
              {selectedLog.status === 'FAILED' && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '8px',
                  }}
                >
                  <button
                    className="btn-retry-log"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                    onClick={() => handleRetry(selectedLog.id)}
                    disabled={retryingId === selectedLog.id}
                  >
                    <RotateCcw
                      size={14}
                      className={retryingId === selectedLog.id ? 'animate-spin' : ''}
                    />
                    {retryingId === selectedLog.id
                      ? 'جاري إعادة المحاولة...'
                      : 'إعادة محاولة هذه العملية الآن'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncLogs;
