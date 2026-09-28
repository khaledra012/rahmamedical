import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { Alert, Badge, Button, Input, Table } from '../../components';
import { auditService } from '../../services/auditService';
import './AuditLogs.css';

const actionLabels = {
  AUTH_LOGIN: 'تسجيل دخول', AUTH_LOGOUT: 'تسجيل خروج', AUTH_CHANGE_PASSWORD: 'تغيير كلمة المرور', USER_CREATE: 'إضافة مستخدم', USER_UPDATE: 'تعديل مستخدم', USER_RESET_PASSWORD: 'إعادة تعيين كلمة المرور',
  PRODUCT_SYNC: 'مزامنة منتجات دفترة', PRODUCT_AUTO_LINK: 'ربط منتجات زد', PRODUCT_ENRICH: 'تعديل بيانات منتج', PRODUCT_PUBLISH_ZID: 'نشر منتج في زد', PRODUCT_PUBLISH_TRENDYOL: 'نشر منتج في ترينديول', PRODUCT_PUBLISH_ALL: 'نشر منتج', PRODUCT_RETRY: 'إعادة محاولة منتج', PRODUCT_TOGGLE_PAUSE: 'إيقاف أو تفعيل منتج',
  ORDER_RETRY: 'إعادة محاولة طلب', ORDER_RETRY_CANCELLATION: 'إعادة محاولة مرتجع', ORDER_SIMULATE: 'إنشاء طلب تجريبي', SYNC_LOG_RETRY: 'إعادة محاولة عملية مزامنة',
};

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await auditService.getLogs({ page, limit: 20, ...(search.trim() ? { search: search.trim() } : {}), ...(status ? { status } : {}) });
      setLogs(result.logs || []);
      setPagination(result.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'تعذر تحميل سجل النشاط');
    } finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { load(1); }, [load]);

  const columns = [
    { header: 'التاريخ والوقت', key: 'createdAt', render: (value) => new Date(value).toLocaleString('ar-EG') },
    { header: 'المستخدم', key: 'userName', render: (_, row) => <div><strong>{row.userName}</strong><div className="audit-muted">{row.userEmail || 'عملية نظام'}</div></div> },
    { header: 'الدور', key: 'userRole', render: (role) => role === 'admin' ? 'مدير' : role === 'operator' ? 'تشغيل' : role === 'viewer' ? 'مشاهدة' : 'النظام' },
    { header: 'العملية', key: 'action', render: (value, row) => <div><strong>{actionLabels[value] || value}</strong><div className="audit-muted">{row.entityType || ''}{row.entityId ? ` #${row.entityId}` : ''}</div></div> },
    { header: 'النتيجة', key: 'status', render: (value) => <Badge variant={value === 'SUCCESS' ? 'success' : 'danger'} dot>{value === 'SUCCESS' ? 'نجحت' : 'فشلت'}</Badge> },
    { header: 'المسار', key: 'path', render: (value, row) => <span className="audit-path">{row.method} {value}</span> },
  ];

  return <div className="audit-page">
    <div className="audit-header"><div><h2>سجل نشاط المستخدمين</h2><p>كل عملية يدوية موثقة باسم منفذها ونتيجتها.</p></div><Button variant="outline" icon={<RefreshCw size={16} />} onClick={() => load(pagination.page)}>تحديث</Button></div>
    {error && <Alert variant="error" onClose={() => setError(null)}>{error}</Alert>}
    <div className="audit-toolbar"><Input placeholder="بحث باسم المستخدم أو العملية أو رقم الكيان" icon={<Search size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} /><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">كل النتائج</option><option value="SUCCESS">ناجحة</option><option value="FAILED">فاشلة</option></select></div>
    <div className="audit-table-card"><Table columns={columns} data={logs} isLoading={loading} emptyMessage="لا توجد عمليات مسجلة" /></div>
    <div className="audit-pagination"><span>إجمالي العمليات: {pagination.total}</span><div><Button size="sm" variant="outline" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>السابق</Button><Button size="sm" variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)}>التالي</Button></div></div>
  </div>;
};

export default AuditLogs;
