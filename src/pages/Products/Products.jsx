import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Badge, Alert, Table, Spinner, Input } from '../../components';
import { ProductEnrichModal } from './ProductEnrichModal';
import { productsService } from '../../services/productsService';
import {
  Package,
  Search,
  RefreshCw,
  Send,
  RotateCcw,
  Edit3,
  ShoppingBag,
  Store,
  ChevronDown,
} from 'lucide-react';
import './Products.css';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal & Dropdown State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productsService.getProducts({
        status: selectedStatus,
        search: searchQuery,
        page,
        limit: 15,
      });

      setProducts(response.data || []);
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (err) {
      setError(err?.message || 'تعذر تحميل قائمة المنتجات');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handleSyncDaftra = async () => {
    setIsSyncing(true);
    setError(null);
    setActionSuccess(null);
    try {
      const res = await productsService.syncWithDaftra();
      const count = res?.data?.processedCount ?? res?.processedCount ?? 0;
      setActionSuccess(`تمت المزامنة مع دفترة بنجاح! تم فحص واستيراد ${count} منتج جديد/معدل.`);
      fetchProducts(1);
    } catch (err) {
      setError(err?.message || 'تعذرت المزامنة مع خادم دفترة');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenEnrichModal = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
    setActiveDropdownId(null);
  };

  const toggleDropdown = (productId, e) => {
    e.stopPropagation();
    setActiveDropdownId(activeDropdownId === productId ? null : productId);
  };

  const handlePublishZid = async (product) => {
    setActiveDropdownId(null);
    setActionLoadingId(`zid-${product.id}`);
    setError(null);
    try {
      await productsService.publishProduct(product.id);
      setActionSuccess(`تم نشر المنتج (${product.nameAr}) إلى متجر زد بنجاح! 🛒`);
      fetchProducts(meta.page);
    } catch (err) {
      setError(err?.message || `فشل نشر المنتج (${product.nameAr}) إلى متجر زد`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePublishTrendyol = async (product) => {
    setActiveDropdownId(null);
    setActionLoadingId(`trendyol-${product.id}`);
    setError(null);
    try {
      await productsService.publishToTrendyol(product.id);
      setActionSuccess(`تم نشر المنتج (${product.nameAr}) إلى متجر ترينديول بنجاح! 🏬`);
      fetchProducts(meta.page);
    } catch (err) {
      setError(err?.message || `فشل نشر المنتج (${product.nameAr}) إلى ترينديول`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePublishAll = async (product) => {
    setActiveDropdownId(null);
    setActionLoadingId(`all-${product.id}`);
    setError(null);
    try {
      await productsService.publishToAll(product.id);
      setActionSuccess(`تم نشر المنتج (${product.nameAr}) إلى كافة المتاجر (زد + ترينديول) بنجاح! 🚀`);
      fetchProducts(meta.page);
    } catch (err) {
      setError(err?.message || `فشل النشر المتعدد للمنتج`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRetryPublish = async (product) => {
    setActionLoadingId(`retry-${product.id}`);
    setError(null);
    try {
      await productsService.retryPublish(product.id);
      setActionSuccess(`تمت إعادة محاولة نشر (${product.nameAr}) بنجاح! 🚀`);
      fetchProducts(meta.page);
    } catch (err) {
      setError(err?.message || 'فشلت إعادة المحاولة');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status, label) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <Badge variant="warning" dot size="sm">{label}: بانتظار النشر</Badge>;
      case 'PUBLISHING':
        return <Badge variant="info" dot size="sm">{label}: جارٍ النشر...</Badge>;
      case 'PUBLISHED':
        return <Badge variant="success" dot size="sm">{label}: منشور ونشط</Badge>;
      case 'FAILED':
        return <Badge variant="danger" dot size="sm">{label}: فشل النشر</Badge>;
      case 'PAUSED':
        return <Badge variant="neutral" dot size="sm">{label}: متوقف مؤقتاً</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{label}: {status || 'غير منشور'}</Badge>;
    }
  };

  const filterTabs = [
    { label: 'الكل', value: 'ALL' },
    { label: 'بانتظار النشر', value: 'PENDING_REVIEW' },
    { label: 'المنشورة', value: 'PUBLISHED' },
    { label: 'المتعثرة (فشل)', value: 'FAILED' },
    { label: 'متوقفة مؤقتاً', value: 'PAUSED' },
  ];

  const columns = [
    {
      header: 'معلومات المنتج (دفترة)',
      key: 'nameAr',
      render: (val, row) => (
        <div className="product-cell-name">
          <span className="product-name-ar font-bold">{row.nameAr}</span>
          {row.nameEn && <span className="product-name-en text-muted text-xs">{row.nameEn}</span>}
          <div className="product-sub-ids">
            <span className="id-tag">دفترة: #{row.daftraProductId}</span>
            {row.daftraCategory && <span className="cat-tag">{row.daftraCategory}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'كود الـ SKU / الباركود',
      key: 'sku',
      render: (val, row) => (
        <div className="product-cell-sku">
          <span className="font-mono font-bold text-primary">{row.sku}</span>
          <span className="text-muted text-xs font-mono">{row.barcode || '—'}</span>
        </div>
      ),
    },
    {
      header: 'الأسعار',
      key: 'price',
      render: (val, row) => (
        <div className="product-cell-price">
          <span className="font-bold text-success">{row.price} ر.س</span>
          {row.costPrice && <span className="text-muted text-xs">التكلفة: {row.costPrice} ر.س</span>}
        </div>
      ),
    },
    {
      header: 'المخزون',
      key: 'stockQuantity',
      render: (val, row) => (
        <div className="product-cell-stock">
          <span className={`font-bold ${row.stockQuantity > 0 ? 'text-primary' : 'text-danger'}`}>
            {row.stockQuantity} وحدة
          </span>
          <span className="text-muted text-xs">
            {row.daftraStorehouseId ? `مستودع #${row.daftraStorehouseId}` : 'الرئيسي'}
          </span>
        </div>
      ),
    },
    {
      header: 'حالة المتاجر المتصلة',
      key: 'publishStatus',
      render: (val, row) => (
        <div className="product-status-multi-col">
          {getStatusBadge(row.publishStatus, 'زد')}
          {getStatusBadge(row.trendyolStatus, 'ترينديول')}
        </div>
      ),
    },
    {
      header: 'الإجراءات',
      key: 'actions',
      render: (val, row) => {
        const isCurrentLoading = actionLoadingId && actionLoadingId.includes(`-${row.id}`);
        const isDropdownOpen = activeDropdownId === row.id;

        return (
          <div className="product-actions-cell" ref={isDropdownOpen ? dropdownRef : null}>
            {/* 1. Modal details button */}
            <Button
              variant="outline"
              size="sm"
              icon={<Edit3 size={13} />}
              onClick={() => handleOpenEnrichModal(row)}
              title="إثراء وتخصيص البيانات"
            >
              تفاصيل
            </Button>

            {/* 2. Unified Publish Dropdown Menu Button */}
            <div className="publish-dropdown-wrapper">
              <Button
                variant="primary"
                size="sm"
                icon={<Send size={13} />}
                isLoading={isCurrentLoading}
                onClick={(e) => toggleDropdown(row.id, e)}
                className="btn-publish-dropdown"
              >
                <span>نشر</span>
                <ChevronDown size={13} />
              </Button>

              {isDropdownOpen && (
                <div className="publish-dropdown-menu animate-fadeIn">
                  <div className="dropdown-menu-header">اختر منصة النشر:</div>
                  
                  <button
                    type="button"
                    className="dropdown-menu-item"
                    onClick={() => handlePublishZid(row)}
                  >
                    <ShoppingBag size={14} color="var(--color-primary)" />
                    <div className="dropdown-item-text">
                      <span className="item-title">نشر إلى متجر زد</span>
                      <span className="item-sub">Zid Store</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="dropdown-menu-item"
                    disabled
                    style={{ opacity: 0.55, cursor: 'not-allowed', background: 'rgba(0,0,0,0.02)' }}
                    title="متجر ترينديول معطل مؤقتاً وسيتوفر قريباً"
                  >
                    <Store size={14} color="#9ca3af" />
                    <div className="dropdown-item-text">
                      <span className="item-title" style={{ color: '#6b7280' }}>
                        نشر إلى ترينديول <small style={{ color: '#d97706', fontSize: '10px', fontWeight: 'bold' }}>(قريباً)</small>
                      </span>
                      <span className="item-sub">Trendyol Marketplace (معطل مؤقتاً)</span>
                    </div>
                  </button>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-menu-item dropdown-item-all"
                    onClick={() => handlePublishAll(row)}
                  >
                    <Send size={14} color="var(--color-success)" />
                    <div className="dropdown-item-text">
                      <span className="item-title font-bold text-success">نشر للمتاجر النشطة (زد)</span>
                      <span className="item-sub">نشر فوري للمتجر المتاح حالياً ⚡</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Retry button if any failed */}
            {(row.publishStatus === 'FAILED' || row.trendyolStatus === 'FAILED') && (
              <Button
                variant="danger"
                size="sm"
                icon={<RotateCcw size={13} />}
                onClick={() => handleRetryPublish(row)}
                title="إعادة المحاولة"
              >
                إعادة
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="products-page">
      {/* Header Title & Actions */}
      <div className="products-header">
        <div>
          <h2 className="products-title">إدارة المنتجات والنشر إلى المتاجر الإلكترونية</h2>
          <p className="products-subtitle">
            استقبال منتجات مستودعات دفترة، إثراؤها تسويقياً، واعتماد نشرها على <strong>متجر زد</strong> و <strong>ترينديول (Trendyol)</strong>
          </p>
        </div>

        <div className="header-actions-group">
          <Button
            variant="primary"
            size="md"
            icon={<RefreshCw size={16} />}
            onClick={handleSyncDaftra}
            isLoading={isSyncing}
            disabled={isSyncing}
            title="سحب ومزامنة أحدث المنتجات من دفترة فورياً"
          >
            مزامنة مع دفترة 🔄
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<RefreshCw size={16} />}
            onClick={() => fetchProducts(meta.page)}
            title="تحديث البيانات"
          >
            تحديث
          </Button>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {actionSuccess && (
        <Alert variant="success" onClose={() => setActionSuccess(null)}>
          {actionSuccess}
        </Alert>
      )}

      {/* Filter Tabs & Search Row */}
      <div className="products-toolbar">
        <div className="status-filter-tabs">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`filter-tab-btn ${selectedStatus === tab.value ? 'filter-tab-active' : ''}`}
              onClick={() => setSelectedStatus(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="products-search-box">
          <Input
            placeholder="بحث بالاسم، كود الـ SKU، أو الباركود..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
      </div>

      {/* Products Table Card */}
      <div className="products-table-card">
        {isLoading ? (
          <div className="products-loading-state">
            <Spinner size="lg" color="var(--color-primary)" />
            <p className="text-muted mt-2">جارٍ جلب المنتجات...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="products-empty-state">
            <Package size={48} color="var(--color-border)" />
            <h3 className="empty-title">لا توجد منتجات مطابقة</h3>
            <p className="empty-desc">
              لم يتم استلام منتجات من دفترة بهذه الفلاتر بعد.
            </p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={products} />

            {/* Pagination Row */}
            <div className="products-pagination-row">
              <span className="pagination-info text-sm text-muted">
                إجمالي المنتجات: <strong>{meta.total}</strong> | الصفحة <strong>{meta.page}</strong> من{' '}
                <strong>{meta.totalPages || 1}</strong>
              </span>

              <div className="pagination-buttons">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => fetchProducts(meta.page - 1)}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => fetchProducts(meta.page + 1)}
                >
                  التالي
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Enrichment Modal */}
      <ProductEnrichModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={currentProduct}
        onProductUpdated={() => fetchProducts(meta.page)}
      />
    </div>
  );
};

export default Products;
