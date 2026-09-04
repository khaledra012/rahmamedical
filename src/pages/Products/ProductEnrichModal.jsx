import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Alert } from '../../components';
import { productsService } from '../../services/productsService';
import {
  Package,
  Layers,
  FileText,
  Image as ImageIcon,
  Search,
  Send,
  Save,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import './ProductEnrichModal.css';

export const ProductEnrichModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [nameEn, setNameEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [trendyolCategoryId, setTrendyolCategoryId] = useState('');
  const [trendyolBrandId, setTrendyolBrandId] = useState('');
  const [targetStores, setTargetStores] = useState(['ZID', 'TRENDYOL']);
  const [imageUrl, setImageUrl] = useState('');
  const [imagesList, setImagesList] = useState([]);
  const [seoKeywords, setSeoKeywords] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (product) {
      setNameEn(product.nameEn || '');
      setDescriptionAr(product.descriptionAr || '');
      setDescriptionEn(product.descriptionEn || '');
      setSelectedCategories(product.zidCategoryIds || []);
      setTrendyolCategoryId(product.trendyolCategoryId ? String(product.trendyolCategoryId) : '501');
      setTrendyolBrandId(product.trendyolBrandId ? String(product.trendyolBrandId) : '1001');
      setImagesList(product.images || []);
      setSeoKeywords(product.seoKeywords || '');
      setError(null);
      setSuccessMsg(null);
    }
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      productsService
        .getZidCategories()
        .then((cats) => {
          if (Array.isArray(cats) && cats.length > 0) {
            setCategoriesList(cats);
          } else {
            setCategoriesList([
              { id: 101, name: { ar: 'مستلزمات الوقاية والحماية', en: 'PPE & Protection' } },
              { id: 102, name: { ar: 'أجهزة قياس وفحص طبي', en: 'Diagnostic Equipment' } },
              { id: 103, name: { ar: 'شاش وضمادات جراحية', en: 'Dressings & Bandages' } },
              { id: 104, name: { ar: 'أدوات ومستهلكات طبية', en: 'Medical Consumables' } },
            ]);
          }
        })
        .catch(() => {
          setCategoriesList([
            { id: 101, name: { ar: 'مستلزمات الوقاية والحماية', en: 'PPE & Protection' } },
            { id: 102, name: { ar: 'أجهزة قياس وفحص طبي', en: 'Diagnostic Equipment' } },
          ]);
        });
    }
  }, [isOpen]);

  if (!product) return null;

  const handleAddImage = (e) => {
    e.preventDefault();
    if (imageUrl.trim() && !imagesList.includes(imageUrl.trim())) {
      setImagesList([...imagesList, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setImagesList(imagesList.filter((_, idx) => idx !== index));
  };

  const handleToggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleToggleStore = (storeKey) => {
    if (targetStores.includes(storeKey)) {
      if (targetStores.length > 1) {
        setTargetStores(targetStores.filter((s) => s !== storeKey));
      }
    } else {
      setTargetStores([...targetStores, storeKey]);
    }
  };

  const handleSaveOnly = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await productsService.enrichProduct(product.id, {
        name_en: nameEn,
        description_ar: descriptionAr,
        description_en: descriptionEn,
        zid_category_ids: selectedCategories,
        trendyol_category_id: parseInt(trendyolCategoryId) || 501,
        trendyol_brand_id: parseInt(trendyolBrandId) || 1001,
        images: imagesList,
        seo_keywords: seoKeywords,
      });
      setSuccessMsg('تم حفظ البيانات التسويقية بنجاح!');
      if (onProductUpdated) onProductUpdated(updated);
    } catch (err) {
      setError(err?.message || 'تعذر حفظ التعديلات');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishSelected = async () => {
    setIsPublishing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await productsService.enrichProduct(product.id, {
        name_en: nameEn,
        description_ar: descriptionAr,
        description_en: descriptionEn,
        zid_category_ids: selectedCategories,
        trendyol_category_id: parseInt(trendyolCategoryId) || 501,
        trendyol_brand_id: parseInt(trendyolBrandId) || 1001,
        images: imagesList,
        seo_keywords: seoKeywords,
      });

      if (targetStores.includes('ZID') && targetStores.includes('TRENDYOL')) {
        await productsService.publishToAll(product.id);
        setSuccessMsg('تم اعتماد ونشر المنتج إلى جميع المتاجر (زد + ترينديول) بنجاح! 🚀');
      } else if (targetStores.includes('ZID')) {
        await productsService.publishProduct(product.id);
        setSuccessMsg('تم اعتماد ونشر المنتج إلى متجر زد بنجاح! 🛒');
      } else if (targetStores.includes('TRENDYOL')) {
        await productsService.publishToTrendyol(product.id);
        setSuccessMsg('تم اعتماد ونشر المنتج إلى متجر ترينديول بنجاح! 🏬');
      }

      if (onProductUpdated) onProductUpdated();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err?.message || 'فشل نشر المنتج');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="بطاقة إثراء ونشر المنتج إلى المتاجر الإلكترونية"
      size="lg"
      footer={
        <div className="enrich-modal-footer">
          <Button variant="outline" onClick={onClose} disabled={isSaving || isPublishing}>
            إلغاء
          </Button>
          <div className="footer-action-buttons">
            <Button
              variant="secondary"
              onClick={handleSaveOnly}
              isLoading={isSaving}
              disabled={isPublishing}
              icon={<Save size={16} />}
            >
              حفظ التعديلات
            </Button>
            <Button
              variant="primary"
              onClick={handlePublishSelected}
              isLoading={isPublishing}
              disabled={isSaving}
              icon={<Send size={16} />}
            >
              نشر إلى المتاجر المحددة ({targetStores.length}) 🚀
            </Button>
          </div>
        </div>
      }
    >
      <div className="enrich-modal-content">
        {/* Alerts */}
        {error && (
          <Alert variant="error" className="mb-4" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert variant="success" className="mb-4" onClose={() => setSuccessMsg(null)}>
            {successMsg}
          </Alert>
        )}

        {/* Section 0: Target Publishing Channels */}
        <div className="enrich-section target-channels-box">
          <div className="section-title-row">
            <Globe size={18} color="var(--color-primary)" />
            <h4>قنوات ومتاجر النشر المستهدفة</h4>
          </div>
          <div className="channels-selection-row">
            <label
              className={`channel-card ${targetStores.includes('ZID') ? 'channel-card-active' : ''}`}
              onClick={() => handleToggleStore('ZID')}
            >
              <input
                type="checkbox"
                checked={targetStores.includes('ZID')}
                onChange={() => {}}
              />
              <div className="channel-info">
                <span className="channel-title">متجر زد (Zid Store)</span>
                <span className="channel-sub">متجر رحمة الإلكتروني المباشر</span>
              </div>
            </label>

            <label
              className="channel-card"
              style={{ opacity: 0.55, cursor: 'not-allowed', background: 'rgba(0, 0, 0, 0.02)' }}
              title="متجر ترينديول معطل مؤقتاً وسيتوفر قريباً"
            >
              <input
                type="checkbox"
                checked={false}
                disabled
                onChange={() => {}}
              />
              <div className="channel-info">
                <span className="channel-title" style={{ color: '#6b7280' }}>
                  ترينديول (Trendyol Marketplace) <small style={{ color: '#d97706', fontSize: '11px', fontWeight: 'bold' }}>(قريباً)</small>
                </span>
                <span className="channel-sub">سوق ترينديول الإقليمي (معطل مؤقتاً)</span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 1: Readonly Daftra Core Ingested Details */}
        <div className="enrich-section daftra-data-box">
          <div className="section-title-row">
            <Package size={18} color="var(--color-primary)" />
            <h4>البيانات الأساسية الواردة من دفترة (قراءة فقط)</h4>
          </div>
          <div className="daftra-grid">
            <div className="daftra-field">
              <span className="field-label">معرف دفترة:</span>
              <span className="field-value font-mono">#{product.daftraProductId}</span>
            </div>
            <div className="daftra-field">
              <span className="field-label">كود الـ SKU:</span>
              <span className="field-value font-mono font-bold text-primary">{product.sku}</span>
            </div>
            <div className="daftra-field">
              <span className="field-label">الباركود:</span>
              <span className="field-value font-mono">{product.barcode || '—'}</span>
            </div>
            <div className="daftra-field">
              <span className="field-label">سعر البيع:</span>
              <span className="field-value font-bold text-success">{product.price} ر.س</span>
            </div>
            <div className="daftra-field">
              <span className="field-label">سعر التكلفة:</span>
              <span className="field-value">{product.costPrice ? `${product.costPrice} ر.س` : '—'}</span>
            </div>
            <div className="daftra-field">
              <span className="field-label">كمية المخزون:</span>
              <span className="field-value font-bold">{product.stockQuantity} وحدة</span>
            </div>
            <div className="daftra-field">
              <span className="field-label">المستودع:</span>
              <span className="field-value">
                {product.daftraStorehouseId ? `مستودع #${product.daftraStorehouseId}` : 'الرئيسي'}
              </span>
            </div>
            <div className="daftra-field">
              <span className="field-label">تصنيف دفترة:</span>
              <span className="field-value">{product.daftraCategory || '—'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Marketing Enrichment Inputs */}
        <div className="enrich-section">
          <div className="section-title-row">
            <FileText size={18} color="var(--color-primary)" />
            <h4>الإثراء التسويقي للمتاجر</h4>
          </div>

          <div className="form-row-2">
            <Input
              label="اسم المنتج بالعربي"
              value={product.nameAr}
              disabled
              helperText="مستورد تلقائياً من دفترة"
            />
            <Input
              label="اسم المنتج بالإنجليزي (English Name)"
              placeholder="مثال: 3-Ply Medical Face Mask (50 Pcs)"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
            />
          </div>

          <div className="form-group-custom">
            <label className="custom-input-label">الوصف التسويقي بالعربي</label>
            <textarea
              className="custom-textarea"
              rows={3}
              placeholder="اكتب وصفاً مفصلاً للمنتج ومواصفاته الطبية..."
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
            />
          </div>

          <div className="form-group-custom">
            <label className="custom-input-label">الوصف التسويقي بالإنجليزي (English Description)</label>
            <textarea
              className="custom-textarea"
              rows={2}
              placeholder="Detailed product specs and description in English..."
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
            />
          </div>
        </div>

        {/* Section 3: Categories & Marketplace Attributes */}
        <div className="enrich-section">
          <div className="section-title-row">
            <Layers size={18} color="var(--color-primary)" />
            <h4>أقسام وتصنيفات المتاجر</h4>
          </div>

          {targetStores.includes('ZID') && (
            <div className="store-cat-block">
              <label className="text-xs font-bold text-muted mb-2 block">أقسام متجر زد (Zid):</label>
              <div className="categories-chips-container">
                {categoriesList.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`category-chip ${isSelected ? 'category-chip-active' : ''}`}
                    >
                      {isSelected && <CheckCircle2 size={14} />}
                      <span>{cat.name?.ar || cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {targetStores.includes('TRENDYOL') && (
            <div className="store-cat-block mt-3">
              <label className="text-xs font-bold text-muted mb-2 block">بيانات تصنيف ترينديول (Trendyol):</label>
              <div className="form-row-2">
                <Input
                  label="معرف فئة ترينديول (Category ID)"
                  placeholder="مثال: 501"
                  value={trendyolCategoryId}
                  onChange={(e) => setTrendyolCategoryId(e.target.value)}
                />
                <Input
                  label="معرف الماركة (Brand ID)"
                  placeholder="مثال: 1001 (رحمة)"
                  value={trendyolBrandId}
                  onChange={(e) => setTrendyolBrandId(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Product Images */}
        <div className="enrich-section">
          <div className="section-title-row">
            <ImageIcon size={18} color="var(--color-primary)" />
            <h4>صور المنتج التسويقية (تُرسل لزد وترينديول)</h4>
          </div>

          <div className="add-image-row">
            <input
              type="url"
              className="image-url-input"
              placeholder="ضع رابط الصورة (مثال: https://cdn.rahma.store/images/mask.png)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <Button variant="secondary" size="md" onClick={handleAddImage}>
              إضافة صورة
            </Button>
          </div>

          {imagesList.length > 0 && (
            <div className="images-preview-grid">
              {imagesList.map((img, idx) => (
                <div key={idx} className="image-preview-card">
                  <img src={img} alt={`صورة ${idx + 1}`} onError={(e) => (e.target.style.display = 'none')} />
                  <button
                    type="button"
                    className="remove-img-btn"
                    onClick={() => handleRemoveImage(idx)}
                    title="حذف الصورة"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: SEO Keywords */}
        <div className="enrich-section">
          <div className="section-title-row">
            <Search size={18} color="var(--color-primary)" />
            <h4>الكلمات المفتاحية ومحركات البحث (SEO)</h4>
          </div>
          <Input
            placeholder="مثال: كمامة, كمامات طبية, حماية, مستلزمات طبية, صيدلية"
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
            helperText="افصل بين الكلمات بفاصلة (,)"
          />
        </div>
      </div>
    </Modal>
  );
};
