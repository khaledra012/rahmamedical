import React, { useState, useEffect } from 'react';
import './Orders.css';
import { ordersService } from '../../services/ordersService';
import { Button } from '../../components';
import {
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Eye,
  FileText,
  Building2,
  CreditCard,
  X,
  XCircle,
  Globe,
} from 'lucide-react';

// Helper to determine if an order is destined for international export
const getOrderExportInfo = (order) => {
  if (!order) return { isExport: false, countryName: '' };

  const raw = order.rawOrderData;
  const directCode =
    raw?.shipping?.address?.country?.code ||
    raw?.shipping_address?.country?.code ||
    raw?.shipping?.country_code ||
    raw?.shipping_address?.countryCode;

  // 1. إذا كان الكود الدولي (ISO 2-letter) مرسلاً من المنصة (زد أو ترينديول)
  if (directCode && /^[A-Za-z]{2}$/.test(String(directCode).trim())) {
    const code = String(directCode).trim().toUpperCase();
    if (code !== 'SA' && code !== 'KSA') {
      const countryName =
        raw?.shipping?.address?.country?.name ||
        raw?.shipping_address?.country?.name ||
        code;
      return { isExport: true, countryName };
    }
    return { isExport: false, countryName: 'السعودية' };
  }

  const rawCountry =
    raw?.shipping?.address?.country?.name ||
    raw?.shipping_address?.country?.name ||
    raw?.shipping?.country ||
    raw?.shipping_address?.country;
  const rawCountryId =
    raw?.shipping?.address?.country?.id ||
    raw?.shipping_address?.country?.id;

  const addr = (order.shippingAddress || '').trim();
  const saudiTerms = ['السعودية', 'المملكة العربية السعودية', 'KSA', 'SA', 'Saudi Arabia', 'سعودية', 'saudi'];

  // 2. فحص معرف الدولة في زد (معرف 64 هو السعودية - أي معرف آخر هو تصدير دولي)
  if (rawCountryId && String(rawCountryId) !== '64' && String(rawCountryId) !== '184') {
    return {
      isExport: true,
      countryName: typeof rawCountry === 'string' ? rawCountry : 'دولي',
    };
  }

  // 3. فحص اسم الدولة
  if (typeof rawCountry === 'string' && rawCountry.trim()) {
    const cleanCountry = rawCountry.trim().toLowerCase();
    const isSaudi = saudiTerms.some((s) => cleanCountry.includes(s.toLowerCase()));
    if (!isSaudi) {
      return { isExport: true, countryName: rawCountry.trim() };
    }
  }

  // 4. فحص رسالة الفاتورة أو الملاحظات
  if (order.statusMessage && (order.statusMessage.includes('VATEX-SA-EXPORT') || order.statusMessage.includes('تصدير'))) {
    return { isExport: true, countryName: 'دولي' };
  }

  // 5. فحص نص العنوان الكامل
  if (addr) {
    const isSaudi = saudiTerms.some((term) => addr.toLowerCase().includes(term.toLowerCase()));
    if (!isSaudi && (addr.includes('دولي') || addr.includes('تصدير') || addr.length > 5)) {
      // إذا كان العنوان لا يحتوي على أي ذكر للسعودية
      const firstPart = addr.split('-')[0]?.trim();
      return { isExport: true, countryName: firstPart || 'دولي' };
    }
  }

  return { isExport: false, countryName: '' };
};

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    draftCreatedOrders: 0,
    pendingOrders: 0,
    failedOrders: 0,
    unmappedPaymentOrders: 0,
    unmappedProductOrders: 0,
    stalledOrders: 0,
    cancelledOrders: 0,
    cancellationReviewOrders: 0,
  });
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Load orders and stats on mount, and when statusFilter changes (reset to page 1)
  useEffect(() => {
    loadData(1);
  }, [statusFilter]);

  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      const [ordersRes, statsRes] = await Promise.all([
        ordersService.getOrders(params),
        ordersService.getOrderStats(),
      ]);

      const resData = ordersRes.data;
      setOrders(resData?.orders || []);
      setMeta({
        total: resData?.total || 0,
        page: resData?.page || page,
        limit: 20,
        totalPages: resData?.totalPages || 1,
      });
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (err) {
      console.error('Failed to load orders data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryOrder = async (id) => {
    try {
      setRetryingId(id);
      const res = await ordersService.retryOrder(id);
      setFeedbackMessage({
        type: 'success',
        text: `تمت إعادة المحاولة للطلب بنجاح! الحالة: ${res.statusMessage || res.status}`,
      });
      await loadData();
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'فشلت إعادة المحاولة.',
      });
    } finally {
      setRetryingId(null);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const handleRetryCancellation = async (id) => {
    try {
      setRetryingId(id);
      const res = await ordersService.retryCancellation(id);
      setFeedbackMessage({
        type: 'success',
        text: res.statusMessage || 'تمت إعادة محاولة إنشاء مرتجع دفترة بنجاح.',
      });
      await loadData();
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message || 'فشلت إعادة محاولة الإلغاء.',
      });
    } finally {
      setRetryingId(null);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  // Filter orders by search
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.storeOrderId?.toLowerCase().includes(query) ||
      order.customerName?.toLowerCase().includes(query) ||
      order.customerPhone?.includes(query) ||
      order.daftraInvoiceNumber?.toLowerCase().includes(query)
    );
  });

  const renderStatusBadge = (order) => {
    switch (order.status) {
      case 'DRAFT_CREATED':
        return (
          <span className="order-status-badge status-draft-created">
            <CheckCircle2 size={13} />
            فاتورة #{order.daftraInvoiceNumber || order.daftraDraftInvoiceId}
          </span>
        );
      case 'UNMAPPED_PAYMENT':
        return (
          <span className="order-status-badge status-unmapped-payment">
            <AlertCircle size={13} />
            وسيلة دفع غير معرّفة 🛑
          </span>
        );
      case 'UNMAPPED_PRODUCT':
        return (
          <span className="order-status-badge status-unmapped-product">
            <AlertTriangle size={13} />
            صنف غير مطابق ⚠️
          </span>
        );
      case 'FAILED':
        return (
          <span className="order-status-badge status-failed">
            <AlertCircle size={13} />
            فشل الاتصال بدفترة
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="order-status-badge status-processing">
            <Clock size={13} />
            جاري المعالجة...
          </span>
        );
      case 'CANCEL_PENDING':
        return (
          <span className="order-status-badge status-cancel-pending">
            <Clock size={13} />
            جارٍ إنشاء مرتجع دفترة
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="order-status-badge status-cancelled">
            <XCircle size={13} />
            {order.daftraRefundReceiptNumber
              ? `ملغي — مرتجع #${order.daftraRefundReceiptNumber}`
              : 'ملغي قبل الفوترة'}
          </span>
        );
      case 'CANCEL_FAILED':
        return (
          <span className="order-status-badge status-failed">
            <AlertCircle size={13} />
            فشل إنشاء مرتجع دفترة
          </span>
        );
      case 'CANCEL_REVIEW_REQUIRED':
        return (
          <span className="order-status-badge status-cancel-review">
            <AlertTriangle size={13} />
            إلغاء يحتاج مراجعة
          </span>
        );
      default:
        return (
          <span className="order-status-badge status-processing">
            <Clock size={13} />
            قيد الفوترة
          </span>
        );
    }
  };

  return (
    <div className="orders-page">
      {/* Top Header */}
      <div className="orders-header">
        <div>
          <h1 className="orders-title">إدارة الطلبات والفوترة الآلية</h1>
          <p className="orders-subtitle">
            التدفق المباشر: جلب طلبات زد وترينديول ➔ إصدار واعتماد الفواتير آلياً في دفترة ERP وتوجيه السداد للخزائن
          </p>
        </div>

        <div className="orders-actions-group">
          <button
            className="btn btn-primary"
            onClick={() => loadData(1)}
            disabled={loading}
            title="تحديث قائمة الطلبات"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            تحديث الطلبات
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            background: feedbackMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: feedbackMessage.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${feedbackMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '13px',
          }}
        >
          {feedbackMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {feedbackMessage.text}
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="orders-stats-grid">
        <div className="order-stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.totalOrders || 0}</span>
            <span className="stat-label">إجمالي الطلبات المستلمة</span>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="stat-icon-wrapper stat-icon-slate">
            <XCircle size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.cancelledOrders || 0}</span>
            <span className="stat-label">طلبات ملغاة</span>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="stat-icon-wrapper stat-icon-green">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.draftCreatedOrders || 0}</span>
            <span className="stat-label">فواتير صادرة ومعتمدة في دفترة</span>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            <Clock size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.pendingOrders || 0}</span>
            <span className="stat-label">طلبات قيد المعالجة والفوترة</span>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="stat-icon-wrapper stat-icon-rose">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">
              {stats.stalledOrders ?? ((stats.unmappedPaymentOrders || 0) + (stats.unmappedProductOrders || 0) + (stats.failedOrders || 0))}
            </span>
            <span className="stat-label">طلبات متعثرة (تحتاج تدخل)</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="orders-toolbar">
        <div className="orders-filter-tabs">
          <button
            className={`filter-tab-btn ${statusFilter === 'ALL' ? 'filter-tab-active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            جميع الطلبات ({stats.totalOrders || 0})
          </button>
          <button
            className={`filter-tab-btn ${statusFilter === 'DRAFT_CREATED' ? 'filter-tab-active' : ''}`}
            onClick={() => setStatusFilter('DRAFT_CREATED')}
          >
            فواتير صادرة بدفترة ({stats.draftCreatedOrders || 0})
          </button>
          <button
            className={`filter-tab-btn ${statusFilter === 'STALLED' ? 'filter-tab-active' : ''}`}
            onClick={() => setStatusFilter('STALLED')}
          >
            طلبات متعثرة / تحتاج تدخل ({stats.stalledOrders || ((stats.failedOrders || 0) + (stats.unmappedPaymentOrders || 0) + (stats.unmappedProductOrders || 0))})
          </button>
          <button
            className={`filter-tab-btn ${statusFilter === 'CANCELLED' ? 'filter-tab-active' : ''}`}
            onClick={() => setStatusFilter('CANCELLED')}
          >
            الطلبات الملغاة ({stats.cancelledOrders || 0})
          </button>
        </div>

        <div className="orders-search-wrapper">
          <Search size={16} className="orders-search-icon" />
          <input
            type="text"
            className="orders-search-input"
            placeholder="بحث برقم الطلب، العميل، رقم الفاتورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-card">
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>رقم الطلب والقناة</th>
                <th>العميل</th>
                <th>وسيلة الدفع والخزينة</th>
                <th>إجمالي المبلغ</th>
                <th>حالة الفاتورة بدفترة</th>
                <th>تاريخ الطلب</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                    <p style={{ color: 'var(--color-text-muted)' }}>جاري تحميل الطلبات والفواتير...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="orders-empty-state">
                      <ShoppingCart size={40} className="orders-empty-icon" />
                      <h4 className="orders-empty-title">لا توجد طلبات تطابق الفلتر الحالي</h4>
                      <p className="orders-empty-desc">
                        لم يتم استلام أي طلبات جديدة بعد. ستظهر الطلبات هنا تلقائياً عند إنشائها في متجر زد أو ترينديول.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    {/* Store Order ID & Channel */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          #{order.storeOrderId}
                        </span>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {order.storeType === 'ZID' ? (
                            <span className="store-badge store-badge-zid">متجر زد</span>
                          ) : (
                            <span className="store-badge store-badge-trendyol">ترينديول</span>
                          )}
                          {(() => {
                            const { isExport, countryName } = getOrderExportInfo(order);
                            if (isExport) {
                              return (
                                <span
                                  className="store-badge store-badge-export"
                                  title="تصدير دولي - ضريبة صفرية 0% (كود الزكاة: VATEX-SA-EXPORT)"
                                >
                                  <Globe size={11} style={{ verticalAlign: 'middle', marginLeft: '3px' }} />
                                  تصدير {countryName ? `(${countryName})` : 'دولي'}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{order.customerName}</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {order.customerPhone || 'بدون هاتف'}
                        </span>
                      </div>
                    </td>

                    {/* Payment & Treasury */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>
                          {order.paymentMethod}
                        </span>
                        {order.treasuryId ? (
                          <span className="payment-treasury-tag">
                            <CreditCard size={11} />
                            خزينة دفترة #{order.treasuryId}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 600 }}>
                            ⚠️ بحاجة لتحديد الخزينة
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: '#047857' }}>
                          {parseFloat(order.totalAmount || 0).toFixed(2)} ر.س
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          شامل الضريبة
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {renderStatusBadge(order)}
                        {order.statusMessage && order.status !== 'DRAFT_CREATED' && (
                          <span style={{ fontSize: '11px', color: order.status === 'CANCELLED' ? '#047857' : '#b91c1c', maxWidth: '240px' }}>
                            {order.statusMessage}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="order-action-btns">
                        <button
                          className="btn-view-details"
                          onClick={() => setSelectedOrder(order)}
                          title="عرض التفاصيل والتوجيه المحاسبي"
                        >
                          <Eye size={13} />
                          التفاصيل
                        </button>

                        {!['DRAFT_CREATED', 'CANCEL_PENDING', 'CANCELLED', 'CANCEL_FAILED', 'CANCEL_REVIEW_REQUIRED'].includes(order.status) && (
                          <button
                            className="btn-retry-order"
                            onClick={() => handleRetryOrder(order.id)}
                            disabled={retryingId === order.id}
                            title="إعادة محاولة إصدار الفاتورة"
                          >
                            <RefreshCw
                              size={12}
                              className={retryingId === order.id ? 'animate-spin' : ''}
                            />
                            إعادة المحاولة
                          </button>
                        )}
                        {order.status === 'CANCEL_FAILED' && (
                          <button
                            className="btn-retry-order"
                            onClick={() => handleRetryCancellation(order.id)}
                            disabled={retryingId === order.id}
                            title="إعادة محاولة إنشاء مرتجع دفترة"
                          >
                            <RefreshCw size={12} className={retryingId === order.id ? 'animate-spin' : ''} />
                            إعادة المرتجع
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
      </div>

      {/* Pagination Row */}
      {!loading && meta.totalPages > 1 && (
        <div className="products-pagination-row">
          <span className="pagination-info text-sm text-muted">
            إجمالي الطلبات: <strong>{meta.total}</strong> | الصفحة <strong>{meta.page}</strong> من{' '}
            <strong>{meta.totalPages}</strong>
          </span>
          <div className="pagination-buttons">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => loadData(meta.page - 1)}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => loadData(meta.page + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      )}

      {/* Order Details & Accounting Modal */}
      {selectedOrder && (
        <div className="order-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontWeight: 700 }}>
                  تفاصيل الطلب #{selectedOrder.storeOrderId} والتوجيه المحاسبي
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {(() => {
              const selectedOrderExport = getOrderExportInfo(selectedOrder);
              return (
                <div className="order-modal-body">
                  {/* Accounting Routing Card */}
                  <div className="accounting-routing-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Building2 size={16} color="var(--color-primary)" />
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-primary)' }}>
                        التوجيه المحاسبي المعتمد في دفترة (Accounting Routing)
                      </span>
                    </div>

                    <div className="accounting-item">
                      <span className="accounting-label">نوع المعاملة في دفترة:</span>
                      <span className="accounting-val" style={{ color: '#047857' }}>
                        {selectedOrder.status === 'CANCELLED'
                          ? 'فاتورة معتمدة مع مرتجع مبيعات كامل مرتبط بها'
                          : 'فاتورة معتمدة ومباشرة (is_draft: 0) — تخصم المخزون وتسجل القيود وسند السداد فوراً'}
                      </span>
                    </div>

                    <div className="accounting-item">
                      <span className="accounting-label">المعاملة الضريبية وهيئة الزكاة:</span>
                      <span
                        className="accounting-val"
                        style={{
                          color: selectedOrderExport.isExport ? '#0284c7' : '#047857',
                          fontWeight: 700,
                        }}
                      >
                        {selectedOrderExport.isExport
                          ? `🌍 تصدير دولي (ضريبة صفرية 0% - كود إعفاء الزكاة: VATEX-SA-EXPORT - المادة 32)`
                          : 'ضريبة محلية (15% شاملة أو سلع طبية صفرية VATEX-SA-MED)'}
                      </span>
                    </div>

                    <div className="accounting-item">
                      <span className="accounting-label">حساب الإيراد (Sales Revenue GL):</span>
                      <span className="accounting-val">
                        {selectedOrder.storeType === 'ZID'
                          ? 'كود 413 (مبيعات متجر زد) — Account ID: 4689'
                          : 'كود 414 (مبيعات متجر ترينديول) — Account ID: 4690'}
                      </span>
                    </div>

                    <div className="accounting-item">
                      <span className="accounting-label">خزينة التسوية (Settlement Treasury):</span>
                      <span className="accounting-val">
                        {selectedOrder.treasuryId
                          ? `خزينة #${selectedOrder.treasuryId} (${selectedOrder.paymentMethod})`
                          : '⚠️ غير معرّفة (تم إيقاف المعاملة تلقائياً)'}
                      </span>
                    </div>

                    <div className="accounting-item">
                      <span className="accounting-label">حساب إيراد الشحن (Shipping Revenue):</span>
                      <span className="accounting-val">كود 415 (إيرادات الشحن والتوصيل) — Account ID: 4691</span>
                    </div>

                    <div className="accounting-item">
                      <span className="accounting-label">مستودع الأونلاين (Warehouse):</span>
                      <span className="accounting-val">مستودع المتجر الالكتروني (Store ID: 3)</span>
                    </div>

                    <div className="accounting-item">
                      <span className="accounting-label">بطاقة العميل (Client Card):</span>
                      <span className="accounting-val">
                        {selectedOrder.storeType === 'ZID'
                          ? 'عميل زد المخصص (Client ID: 1249)'
                          : 'عميل عام (Client ID: 3)'}
                      </span>
                    </div>

                    {selectedOrder.daftraInvoiceNumber && (
                      <div className="accounting-item">
                        <span className="accounting-label">رقم الفاتورة في دفترة:</span>
                        <span className="accounting-val" style={{ color: '#047857', fontWeight: 700 }}>
                          {selectedOrder.daftraInvoiceNumber}
                        </span>
                      </div>
                    )}

                    {selectedOrder.daftraRefundReceiptNumber && (
                      <div className="accounting-item">
                        <span className="accounting-label">رقم مرتجع المبيعات في دفترة:</span>
                        <span className="accounting-val" style={{ color: '#b45309', fontWeight: 700 }}>
                          {selectedOrder.daftraRefundReceiptNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Customer and Shipping Details */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      بيانات المشتري الحقيقي (المحقونة في خانة ملاحظات الفاتورة):
                    </h4>
                    {selectedOrderExport.isExport && (
                      <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#0284c7', fontWeight: 600 }}>
                        <strong>وجهة الشحن الدولي:</strong> {selectedOrderExport.countryName || 'خارج المملكة'} 🌍 (تصدير)
                      </p>
                    )}
                    <p style={{ margin: '0 0 4px', fontSize: '13px' }}>
                      <strong>الاسم:</strong> {selectedOrder.customerName}
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: '13px' }}>
                      <strong>الجوال:</strong> {selectedOrder.customerPhone || '—'}
                    </p>
                    <p style={{ margin: '0', fontSize: '13px' }}>
                      <strong>العنوان:</strong> {selectedOrder.shippingAddress || '—'}
                    </p>
                  </div>

                  {/* Financial Breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>المجموع الفرعي</span>
                      <p style={{ margin: '4px 0 0', fontWeight: 700 }}>{selectedOrder.subtotal || 0} ر.س</p>
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>رسوم الشحن</span>
                      <p style={{ margin: '4px 0 0', fontWeight: 700 }}>{selectedOrder.shippingFee || 0} ر.س</p>
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {selectedOrderExport.isExport ? 'الضريبة (صفرية تصدير)' : 'الضريبة'}
                      </span>
                      <p
                        style={{
                          margin: '4px 0 0',
                          fontWeight: 700,
                          color: selectedOrderExport.isExport ? '#0284c7' : 'inherit',
                        }}
                      >
                        {selectedOrderExport.isExport ? '0.00 ر.س' : `${selectedOrder.taxAmount || 0} ر.س`}
                      </p>
                    </div>
                    <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #a7f3d0' }}>
                      <span style={{ fontSize: '11px', color: '#047857' }}>الإجمالي الكلي</span>
                      <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#047857' }}>{selectedOrder.totalAmount || 0} ر.س</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
