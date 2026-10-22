import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BookOpenText,
  Boxes,
  CheckCircle2,
  KeyRound,
  LayoutDashboard,
  Package,
  Search,
  ServerCog,
  ShieldCheck,
  ShoppingCart,
  Users,
} from 'lucide-react';
import './Documentation.css';

const sections = [
  {
    id: 'start',
    title: 'البدء وتسجيل الدخول',
    summary: 'الدخول، الجلسة، تغيير كلمة المرور، والخروج الآمن.',
    icon: KeyRound,
    keywords: 'دخول تسجيل كلمة المرور جلسة خروج حساب',
    content: (
      <>
        <ol>
          <li>افتح رابط لوحة التحكم واكتب البريد الإلكتروني أو اسم المستخدم.</li>
          <li>أدخل كلمة المرور واضغط «تسجيل الدخول».</li>
          <li>إذا كانت كلمة المرور مؤقتة، يجب تغييرها قبل تنفيذ أي عملية.</li>
          <li>استخدم أيقونة المفتاح أعلى الصفحة لتغيير كلمة المرور في أي وقت.</li>
          <li>استخدم أيقونة الخروج لإنهاء الجلسة وحذف بياناتها من المتصفح.</li>
        </ol>
        <div className="docs-note docs-note-info">
          كلمة المرور الجديدة يجب ألا تقل عن 6 خانات. عند انتهاء الجلسة يعيدك النظام تلقائيًا إلى صفحة الدخول.
        </div>
      </>
    ),
  },
  {
    id: 'dashboard',
    title: 'لوحة المؤشرات',
    summary: 'قراءة الإحصاءات ومعرفة ما يحتاج تدخلًا سريعًا.',
    icon: LayoutDashboard,
    keywords: 'لوحة مؤشرات إحصائيات منتجات منشورة متعثرة تحديث',
    content: (
      <>
        <p>تعرض الصفحة الرئيسية إجمالي منتجات دفترة، المنتجات المنشورة، المنتجات المنتظرة، وعدد عمليات النشر الفاشلة، بالإضافة إلى آخر عمليات المزامنة.</p>
        <ul>
          <li>اضغط «تحديث المؤشرات» لجلب أحدث الأرقام.</li>
          <li>الضغط على أي بطاقة ينقلك إلى قائمة المنتجات.</li>
          <li>ابدأ يومك بمراجعة المنتجات والطلبات المتعثرة ثم افتح سجل العمليات لمعرفة السبب.</li>
        </ul>
        <div className="docs-note docs-note-warning">
          شارة «المزامنة نشطة» في رأس الصفحة ليست فحصًا فنيًا شاملًا؛ سجل العمليات ونقطة <code>/api/health</code> هما المرجع الأدق.
        </div>
      </>
    ),
  },
  {
    id: 'products',
    title: 'المنتجات والنشر',
    summary: 'المزامنة من دفترة، الإثراء التسويقي، النشر، ومعالجة الفشل.',
    icon: Package,
    keywords: 'منتجات دفترة زد ترينديول نشر مزامنة إثراء صور وصف sku باركود مخزون سعر',
    content: (
      <>
        <h4>جلب المنتجات</h4>
        <p>اضغط «مزامنة مع دفترة» لسحب المنتجات الجديدة أو المعدلة. يعمل فاحص تلقائي أيضًا كل 5 دقائق. المنتج الجديد لا يُنشر تلقائيًا غالبًا، بل يدخل في «بانتظار النشر».</p>
        <h4>مراجعة وإثراء المنتج</h4>
        <ol>
          <li>ابحث بالاسم أو SKU أو الباركود.</li>
          <li>اضغط «تفاصيل» وأضف الاسم الإنجليزي والوصف والتصنيف والصور وكلمات SEO.</li>
          <li>اختر «حفظ التعديلات» فقط، أو احفظ وانشر مباشرة.</li>
          <li>تأكد أن السعر والمخزون وحالة المنتج صحيحة في دفترة لأنها مصدر البيانات التشغيلية.</li>
        </ol>
        <h4>معاني الحالات</h4>
        <div className="docs-status-grid">
          <span><b>بانتظار النشر</b> يحتاج مراجعة واعتمادًا.</span>
          <span><b>جارٍ النشر</b> انتظر ولا تكرر النقر.</span>
          <span><b>منشور</b> مرتبط ونشط بالمتجر.</span>
          <span><b>فشل</b> افحص سجل العملية ثم أعد المحاولة.</span>
          <span><b>متوقف</b> العرض موقوف مؤقتًا.</span>
        </div>
        <div className="docs-note docs-note-warning">
          لا يمكن نشر منتج حالته في دفترة «غير نشط» أو «موقوف». Trendyol معطل في الواجهة حاليًا، والقناة المتاحة هي زد.
        </div>
      </>
    ),
  },
  {
    id: 'orders',
    title: 'الطلبات والفوترة',
    summary: 'استقبال طلبات زد، المطابقة، إصدار الفواتير، الإلغاء، وCOD.',
    icon: ShoppingCart,
    keywords: 'طلبات فاتورة فوترة دفترة دفع خزينة إلغاء مرتجع cod شحن عميل',
    content: (
      <>
        <p>تصل طلبات زد عبر Webhook. يحفظ النظام الطلب، يطابق وسيلة الدفع والأصناف، ثم يصدر الفاتورة في دفترة ويوجه السداد إلى الخزينة المناسبة.</p>
        <div className="docs-flow">
          <span>استلام الطلب</span><i>←</i><span>مطابقة الدفع</span><i>←</i><span>مطابقة الأصناف</span><i>←</i><span>فاتورة دفترة</span>
        </div>
        <h4>الحالات التي تحتاج تدخلًا</h4>
        <ul>
          <li><b>وسيلة دفع غير معرّفة:</b> أضف أو صحح ربط وسيلة الدفع بالخزينة.</li>
          <li><b>صنف غير مطابق:</b> صحح SKU/الباركود أو اربط المنتج بمنتج دفترة.</li>
          <li><b>فشل الاتصال:</b> راجع رسالة الخطأ وسجل العملية ثم أعد المحاولة.</li>
          <li><b>إلغاء يحتاج مراجعة:</b> بيانات الفاتورة الأصلية غير كافية لبناء المرتجع تلقائيًا؛ راجع معرف الفاتورة والعميل والبنود في دفترة.</li>
        </ul>
        <h4>الدفع عند الاستلام</h4>
        <p>عند إلغاء الطلب ينشئ النظام مرتجع دفترة كاملًا حتى لو خرج الطلب للشحن أو تم توصيله. ولا يسجل سداد COD عند إنشاء الفاتورة؛ ينتظر تأكيد التوصيل ثم يسجل السداد في خزينة شركة الشحن. المدير فقط يمكنه إعادة تسوية COD أو إعادة إنشاء المرتجع بعد الفشل.</p>
        <div className="docs-note docs-note-danger">
          افتح «التفاصيل» وتأكد من حالة دفترة قبل أي إعادة محاولة حتى لا تنفذ إجراءً يدويًا مكررًا خارج النظام.
        </div>
      </>
    ),
  },
  {
    id: 'logs',
    title: 'السجلات وتشخيص الأخطاء',
    summary: 'الفرق بين سجل المزامنة وسجل نشاط المستخدمين وطريقة إعادة العملية.',
    icon: Activity,
    keywords: 'سجل logs مزامنة أخطاء فشل إعادة محاولة audit نشاط مستخدمين json',
    content: (
      <>
        <h4>سجل العمليات والمزامنة</h4>
        <p>يوضح ما حدث بين دفترة والمتاجر: الاتجاه، المصدر، الحالة، زمن الاستجابة، Request، Response ورسالة الخطأ. استخدم «فحص» لقراءة التفاصيل.</p>
        <h4>نشاط المستخدمين</h4>
        <p>يوضح من نفذ الإجراء، ودوره، والوقت، والمسار، وهل نجح الإجراء أو فشل.</p>
        <ol>
          <li>فلتر السجل إلى «فاشلة» وحدد منتجات أو طلبات.</li>
          <li>افتح «فحص» واقرأ رسالة الخطأ والاستجابة.</li>
          <li>صحح أصل المشكلة أولًا.</li>
          <li>اضغط «إعادة» فقط إذا كان الخطأ قابلًا للإعادة.</li>
        </ol>
        <div className="docs-note docs-note-info">لا تشارك JSON السجل في قنوات عامة؛ قد يحتوي بيانات عميل أو معلومات تشغيلية.</div>
      </>
    ),
  },
  {
    id: 'users',
    title: 'المستخدمون والصلاحيات',
    summary: 'إنشاء الحسابات، تعطيلها، وإعادة تعيين كلمات المرور.',
    icon: Users,
    keywords: 'مستخدمين صلاحيات مدير تشغيل مشاهدة إضافة تعطيل كلمة مرور',
    content: (
      <>
        <p>صفحة المستخدمين متاحة للمدير فقط. يمكن إنشاء موظف تشغيل أو مستخدم مشاهدة، تعديل بياناته، تعطيله، أو منحه كلمة مرور مؤقتة جديدة.</p>
        <div className="docs-permission-table">
          <div><b>مدير النظام</b><span>كل الصلاحيات، إدارة المستخدمين، المرتجعات وCOD.</span></div>
          <div><b>موظف تشغيل</b><span>مزامنة ونشر المنتجات وإعادة فوترة الطلبات والسجلات.</span></div>
          <div><b>مشاهدة فقط</b><span>قراءة الصفحات والسجلات دون تنفيذ عمليات تغيير.</span></div>
        </div>
        <ul>
          <li>اسم المستخدم: 3–80 خانة من حروف إنجليزية وأرقام ونقطة أو شرطة.</li>
          <li>كلمة المرور المؤقتة: 6 خانات على الأقل.</li>
          <li>سيُجبر المستخدم الجديد على تغيير كلمة المرور عند أول دخول.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'operations',
    title: 'التشغيل والصيانة',
    summary: 'فحص الخدمة، النسخ الاحتياطي، النشر، وأهم قواعد الأمان.',
    icon: ServerCog,
    keywords: 'تشغيل صيانة api health backup قاعدة بيانات نشر production env أمان webhook',
    content: (
      <>
        <ul>
          <li>افحص الخدمة من <code>GET /api/health</code>.</li>
          <li>شغّل <code>npm run build</code> ثم <code>npm run db:migrate</code> قبل نشر الـBackend.</li>
          <li>خذ نسخة احتياطية من MySQL قبل Migration أو استيراد جماعي.</li>
          <li>لا ترفع ملفات <code>.env</code> أو مفاتيح دفترة/زد إلى Git.</li>
          <li>لا تشغّل ملفات <code>backend/scripts</code> على الإنتاج قبل مراجعتها واختبارها على نسخة معزولة.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'troubleshooting',
    title: 'حل المشاكل الشائعة',
    summary: 'أسرع تشخيص لأكثر رسائل وأعطال النظام تكرارًا.',
    icon: AlertTriangle,
    keywords: 'مشكلة تعذر اتصال 401 404 تصنيفات فشل نشر دفع صنف مرتجع',
    content: (
      <div className="docs-faq">
        <details>
          <summary>تعذر الاتصال بالخادم</summary>
          <p>تأكد أن الـBackend يعمل، وافتح <code>/api/health</code>، ثم راجع عنوان <code>VITE_API_BASE_URL</code> أو إعداد Nginx.</p>
        </details>
        <details>
          <summary>المنتج يفشل في النشر</summary>
          <p>افتح Sync Logs، راجع رد المتجر، وتأكد من SKU والحالة والصور والتصنيف وصلاحية توكن زد.</p>
        </details>
        <details>
          <summary>الطلب متوقف على وسيلة دفع غير معرّفة</summary>
          <p>كود الدفع غير موجود في Payment Mapping. اربطه بخزينة دفترة الصحيحة ثم أعد الفوترة.</p>
        </details>
        <details>
          <summary>الطلب يحتوي صنفًا غير مطابق</summary>
          <p>تأكد أن SKU أو الباركود في الطلب يطابق منتج دفترة، ثم نفذ إعادة المحاولة.</p>
        </details>
        <details>
          <summary>مرتجع الإلغاء متوقف</summary>
          <p>إذا بقي CANCEL_PENDING أكثر من 5 دقائق، راجع دفترة أولًا ثم استخدم «إعادة المرتجع» بحساب المدير.</p>
        </details>
      </div>
    ),
  },
];

export const Documentation = () => {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const visibleSections = useMemo(() => {
    if (!normalizedQuery) return sections;
    return sections.filter((section) =>
      `${section.title} ${section.summary} ${section.keywords}`.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const scrollToSection = (id) => {
    document.getElementById(`docs-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="documentation-page">
      <section className="docs-hero">
        <div className="docs-hero-icon"><BookOpenText size={30} /></div>
        <div className="docs-hero-copy">
          <span className="docs-eyebrow">مركز المساعدة</span>
          <h1>دليل استخدام نظام رحمة</h1>
          <p>شرح عملي لكل أجزاء لوحة التحكم، من مزامنة المنتجات إلى الفوترة ومعالجة الأخطاء.</p>
        </div>
        <div className="docs-verified"><CheckCircle2 size={16} /> مطابق للنسخة الحالية</div>
      </section>

      <div className="docs-search">
        <Search size={19} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث عن منتج، طلب، فاتورة، صلاحية أو رسالة خطأ..."
          aria-label="البحث في دليل الاستخدام"
        />
      </div>

      {!normalizedQuery && (
        <section className="docs-shortcuts" aria-label="اختصارات الدليل">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button key={section.id} onClick={() => scrollToSection(section.id)}>
                <span><Icon size={18} /></span>
                <div><b>{section.title}</b><small>{section.summary}</small></div>
              </button>
            );
          })}
        </section>
      )}

      <div className="docs-layout">
        <aside className="docs-toc">
          <div className="docs-toc-title"><Boxes size={16} /> محتويات الدليل</div>
          {visibleSections.map((section) => (
            <button key={section.id} onClick={() => scrollToSection(section.id)}>{section.title}</button>
          ))}
          <div className="docs-toc-security"><ShieldCheck size={16} /> العمليات الحساسة محددة حسب صلاحية الحساب.</div>
        </aside>

        <main className="docs-content">
          {visibleSections.length > 0 ? visibleSections.map((section) => {
            const Icon = section.icon;
            return (
              <article className="docs-article" id={`docs-${section.id}`} key={section.id}>
                <header>
                  <span className="docs-article-icon"><Icon size={21} /></span>
                  <div><h2>{section.title}</h2><p>{section.summary}</p></div>
                </header>
                <div className="docs-article-body">{section.content}</div>
              </article>
            );
          }) : (
            <div className="docs-empty"><Search size={34} /><h3>لا توجد نتيجة مطابقة</h3><p>جرّب كلمة أقصر مثل «منتج»، «طلب»، «دفع» أو «مستخدم».</p></div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Documentation;
