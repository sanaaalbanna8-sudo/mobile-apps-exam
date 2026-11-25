/* =========================================================
   تحدي معمارية تطبيقات الهواتف الذكية — BTEC IT
   Vanilla JavaScript · بدون أي مكتبات خارجية
   ========================================================= */
'use strict';

/* ---------------------------------------------------------
   ⚙️ الإعدادات — الصقي رابط نشر Google Apps Script هنا
   (ينتهي الرابط عادةً بـ /exec)
   --------------------------------------------------------- */
const CONFIG = {
  GOOGLE_SCRIPT_URL: 'PASTE_YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE',

  SHUFFLE_OPTIONS: true,        // خلط ترتيب الخيارات (أ، ب، ج) لكل طالبة
  AUTO_ADVANCE: true,           // الانتقال التلقائي للسؤال التالي بعد أول اختيار
  AUTO_ADVANCE_DELAY: 650,      // بالمللي ثانية
  CONFETTI_FROM_PERCENT: 80,    // الاحتفال يظهر من هذه النسبة فأعلى
  REQUEST_TIMEOUT: 20000,       // مهلة طلب الحفظ
  STORAGE_KEY: 'btec-mobile-arch-quiz:progress',
  PENDING_KEY: 'btec-mobile-arch-quiz:pending',
  ATTEMPTS_KEY: 'btec-mobile-arch-quiz:attempts',
};

const LETTERS = ['أ', 'ب', 'ج'];

/* ---------------------------------------------------------
   🎨 أيقونات SVG توضيحية (بدون أي شعارات حقيقية)
   --------------------------------------------------------- */
const ICONS = {
  browser: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/><circle cx="6.3" cy="6.5" r=".5" class="acc"/><circle cx="8.6" cy="6.5" r=".5" class="acc"/><path class="acc2" d="M7.5 13h9M7.5 16h5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path class="acc2" d="M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',
  code: '<rect x="2.5" y="4" width="8.5" height="16" rx="2.2"/><rect x="13" y="4" width="8.5" height="16" rx="2.2"/><path class="acc" d="M5.6 10.5l-1.3 1.5 1.3 1.5M7.9 10.5l1.3 1.5-1.3 1.5"/><path class="acc2" d="M16.1 10.5l-1.3 1.5 1.3 1.5M18.4 10.5l1.3 1.5-1.3 1.5"/>',
  bridge: '<path d="M2 17.5h20"/><path d="M2 10.5h20"/><path class="acc2" d="M3.5 10.5c3-4.6 14-4.6 17 0"/><path d="M5 10.5v7M19 10.5v7"/><path class="acc" d="M9 9v8.5M12 8.3v9.2M15 9v8.5"/>',
  split: '<rect x="6.5" y="2.5" width="11" height="8" rx="2"/><path class="acc2" d="M12 10.5v3M6 16.5v-1.5a1.5 1.5 0 0 1 1.5-1.5h9a1.5 1.5 0 0 1 1.5 1.5v1.5"/><rect x="2.5" y="16.5" width="7" height="5" rx="1.5" class="acc"/><rect x="14.5" y="16.5" width="7" height="5" rx="1.5" class="acc"/>',
  layers: '<path d="M12 2.8l9 4.6-9 4.6-9-4.6z"/><path class="acc2" d="M3 12l9 4.6 9-4.6"/><path class="acc" d="M3 16.4l9 4.6 9-4.6"/>',
  house: '<path d="M3 11l9-7.5L21 11"/><path d="M5.5 9.5V20h13V9.5"/><path class="acc" d="M10 20v-5.5h4V20"/><path class="acc2" d="M15.5 6.4V3.8h2.3v4.5"/>',
  scale: '<path d="M12 3.5v17M7.5 20.5h9"/><path d="M4.5 7h15"/><path class="acc" d="M4.5 7l-2.7 6.2a2.8 2.8 0 0 0 5.4 0z"/><path class="acc2" d="M19.5 7l-2.7 6.2a2.8 2.8 0 0 0 5.4 0z"/>',
  speed: '<path d="M3.5 16.5a8.5 8.5 0 1 1 17 0"/><path class="acc" d="M12 16.5l4.2-5.3"/><circle cx="12" cy="16.5" r="1.4"/><path class="acc2" d="M6.4 12.4l1.2.8M12 8v1.4M17.6 12.4l-1.2.8"/>',
  sensors: '<rect x="8" y="3" width="8" height="18" rx="2.2"/><circle cx="12" cy="12" r="1.6" class="acc"/><path class="acc2" d="M5 8.5a6 6 0 0 0 0 7M19 8.5a6 6 0 0 1 0 7M2.5 6a10 10 0 0 0 0 12M21.5 6a10 10 0 0 1 0 12"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path class="acc" d="M15.5 15.5l5 5"/><path class="acc2" d="M7.8 10.6l1.9 1.9 3.3-3.6"/>',
  doubt: '<circle cx="10.5" cy="10.5" r="6.5"/><path class="acc" d="M15.5 15.5l5 5"/><path class="acc2" d="M8.6 8.8a2 2 0 1 1 2.6 1.9c-.5.2-.7.6-.7 1.1v.4"/><circle cx="10.5" cy="14" r=".5" class="acc2"/>',
  bulb: '<path d="M9 17.5h6M10 20.5h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2v1.5h5V16c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/><path class="acc" d="M10.3 9.3l3.4 3.4M13.7 9.3l-3.4 3.4"/>',
  appicon: '<rect x="5.5" y="2.5" width="13" height="19" rx="2.6"/><rect x="8.5" y="6.5" width="3" height="3" rx=".8" class="acc"/><rect x="12.5" y="6.5" width="3" height="3" rx=".8" class="acc2"/><rect x="8.5" y="10.5" width="3" height="3" rx=".8" class="acc2"/><path d="M11 18.5h2"/>',
  sparkle: '<path d="M12 3l2 5.5 5.5 2-5.5 2L12 18l-2-5.5L4.5 10.5l5.5-2z"/><path class="acc" d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/><path class="acc2" d="M5 16.5v3M3.5 18h3"/>',
  report: '<path d="M6 2.8h8.5l4 4V21.2H6z"/><path d="M14.3 2.8v4.2h4.2"/><path class="acc2" d="M9 12.5h6.5M9 15.5h6.5"/><path class="acc" d="M9 18.5h3.5"/>',
};

const CHECK_SVG = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const iconSvg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.appicon}</svg>`;

/* ---------------------------------------------------------
   📚 بنك الأسئلة (20 سؤالاً) — correct = رقم الخيار الصحيح (0=أ، 1=ب، 2=ج)
   --------------------------------------------------------- */
const QUESTIONS = [
  {
    icon: 'browser', tag: 'التشغيل عبر المتصفح',
    q: 'وصلت طالبة إلى خدمة رقمية عبر إدخال رابط في شريط العنوان داخل المتصفح، ولم تقم بأي عملية تثبيت على جهازها. ما الوصف الأدق لهذه الحالة؟',
    options: [
      'نسخة تعتمد على المتصفح وتُدار من خادم خارجي، وصلاحياتها تجاه حسّاسات الهاتف محدودة جداً',
      'نسخة أصلية مبرمجة لنظام واحد وتستفيد مباشرة من جميع حسّاسات الهاتف بأقصى سرعة',
      'حزمة موحدة للنظامين تصل إلى الحسّاسات عبر جسر وتحتاج إلى تحميل من المتجر',
    ],
    correct: 0,
    why: 'الوصول عبر رابط في المتصفح دون تثبيت يميز تطبيق الويب الذي يعمل على خادم بعيد وتكون صلاحياته تجاه حسّاسات الهاتف محدودة.',
  },
  {
    icon: 'code', tag: 'البناء الأصلي',
    q: 'أطلقت شركة منتجاً رقمياً فبنت له قاعدة برمجية مستقلة بلغة أندرويد الرسمية وقاعدة برمجية أخرى مستقلة بلغة آبل الرسمية. ماذا يترتب على هذا الخيار؟',
    options: [
      'تحديث المحتوى يظهر فوراً بمجرد فتح رابط دون المرور بمتجر التطبيقات',
      'يتطلب فريقين أو جهداً وتكلفة ووقتاً أعلى، مع وصول مباشر وسريع جداً إلى حسّاسات الجهاز',
      'يعمل داخل نافذة متصفح مدمجة ويعتمد غالباً على اتصال دائم بالإنترنت للعمل',
    ],
    correct: 1,
    why: 'البناء الأصلي المنفصل لكل نظام يتطلب جهداً وتكلفة ووقتاً أعلى، لكنه يمنح أسرع أداء ووصولاً مباشراً للحسّاسات.',
  },
  {
    icon: 'bridge', tag: 'البناء الهجين والطبقة الوسيطة',
    q: 'قرر مطوّر بناء نسخة هجينة قابلة للتثبيت من متجر التطبيقات بقاعدة كود واحدة للنظامين، مع ربطها بوظائف الجهاز عبر طبقة وسيطة. ما النتيجة المتوقعة؟',
    options: [
      'انعدام الحاجة للاتصال بالإنترنت نهائياً مع تفوق مطلق في سرعة الحسّاسات على أي بناء آخر',
      'توفير في وقت التطوير وكلفة أقل مقارنة ببناء نسختين منفصلتين، مقابل وصول أوسع من المتصفح المجرد',
      'تشغيله مباشرة كصفحة ويب عادية دون تثبيت أي ملفات على نظام التشغيل',
    ],
    correct: 1,
    why: 'البناء الهجين يوازن بين توفير الوقت والكلفة مقارنة بالأصلي، ويمنح وصولاً للحسّاسات أوسع من تطبيق الويب.',
  },
  {
    icon: 'split', tag: 'قاعدة الفرز',
    q: 'يظهر نظام إداري مدرسي بنسختين: الأولى تُفتح مباشرة عبر عنوان إنترنت في المتصفح، والثانية تُحمّل وتُثبّت على الهاتف من المتجر. ما القاعدة الصحيحة للتعامل مع هذا الوضع؟',
    options: [
      'يُحكم على النظام بالكامل بنوع واحد بناءً على اسمه التجاري فقط',
      'يُحكم على كل نسخة على حدة بحسب طريقة بنائها ومكان تشغيل كودها الفعلي',
      'تُعدّ النسختان متطابقتين تقنياً لأن الاسم واحد في الحالتين',
    ],
    correct: 1,
    why: 'الاسم التجاري لا يكشف النوع؛ بل نفرز النسخة التي أمامنا بناءً على طريقة بنائها ومكان عمل كودها.',
  },
  {
    icon: 'globe', tag: 'التكلفة والتحديث الفوري',
    q: 'إذا أرادت جهة ما إتاحة خدمة لجميع الأجهزة بأقل كلفة تطوير ممكنة، وأن تصل التعديلات للمستخدمين فور نشرها دون انتظار موافقات أو تنزيل تحديثات، فأي خيار يحقق ذلك؟',
    options: [
      'بناء نسخة أصلية لكل نظام تشغيل على حدة',
      'إتاحة الخدمة عبر المتصفح من خادم على الإنترنت',
      'بناء نسخة هجينة مثبّتة عبر المتجر مع غلاف برمجي',
    ],
    correct: 1,
    why: 'تطبيق الويب هو الأقل كلفة ويعمل على أي جهاز ويتحدّث فورياً على الخادم دون المرور بمتاجر التطبيقات.',
  },
  {
    icon: 'layers', tag: 'الطبقات الوسيطة',
    q: 'ما العلاقة الصحيحة بين عدد الطبقات الوسيطة بين كود التطبيق وحسّاسات الهاتف وبين الأداء والصلاحيات؟',
    options: [
      'كلما زادت الطبقات الوسيطة أصبح الوصول أبطأ وصارت الصلاحيات أضيق غالباً',
      'كلما زادت الطبقات الوسيطة زادت سرعة الحسّاسات واتسعت صلاحيات النظام تلقائياً',
      'لا يوجد أي أثر لعدد الطبقات الوسيطة على السرعة أو الوصول إلى الحسّاسات',
    ],
    correct: 0,
    why: 'كل طبقة إضافية (مثل المتصفح أو الغلاف/الجسر) تزيد المسافة بين الكود والعتاد مما يبطئ الاستجابة ويضيّق الصلاحيات.',
  },
  {
    icon: 'bridge', tag: 'الغلاف والجسر',
    q: 'يعتمد برنامج ما على عرض صفحات ويب داخل حاوية أو غلاف برمجي مثبّت على الجهاز، وينتقل إلى حسّاسات النظام عبر جسر. ما أبرز قيد قد يواجهه؟',
    options: [
      'عدم إمكانية إضافته إلى متجر التطبيقات تحت أي ظرف',
      'قد يكون أبطأ أو أضيق في الوصول إلى بعض الحسّاسات مقارنة بالبناء الأصلي',
      'أنه لا يحتاج إلى أي نوع من الربط بين الكود ونظام التشغيل',
    ],
    correct: 1,
    why: 'الاعتماد على غلاف وجسر للوصول إلى وظائف النظام يجعله أبطأ أو أضيق صلاحية مقارنة بالاتصال المباشر في البناء الأصلي.',
  },
  {
    icon: 'house', tag: 'تشبيه الشارع والبيت',
    q: 'في تشبيه الشارع والبيت: أي حالة تقابل «غرفة مستأجرة لا تملك منها شيئاً وتدخلها من باب المتصفح وتصلح لأي شارع»؟',
    options: [
      'خدمة تُفتح عبر المتصفح من خادم بعيد دون تثبيت',
      'بناء أصلي لكل نظام تشغيل على حدة',
      'بناء هجين مُركّب للنظامين عبر غلاف',
    ],
    correct: 0,
    why: 'الغرفة المستأجرة التي تُدخل عبر باب المتصفح وتصلح لأي جهاز تمثل تطبيق الويب.',
  },
  {
    icon: 'scale', tag: 'المفاضلة: السرعة والتكلفة',
    q: 'عند مقارنة الخيارات الثلاثة من حيث «سرعة التطوير» و«انخفاض التكلفة»، أي ترتيب يعبّر عن الفكرة المطروحة؟',
    options: [
      'البناء الأصلي هو الأسرع والأقل كلفة دائماً',
      'الخيار المعتمد على المتصفح يتفوق في انخفاض التكلفة وسرعة التطوير، يليه الهجين، ثم الأصلي',
      'جميع الأنواع متساوية تماماً في التكلفة والسرعة منذ اللحظة الأولى',
    ],
    correct: 1,
    why: 'الويب هو الأوفر والأسرع، يليه الهجين بكود واحد، بينما الأصلي هو الأعلى كلفة والأطول زمناً.',
  },
  {
    icon: 'speed', tag: 'نقاط قوة البناء الأصلي',
    q: 'أي جانب يتفوق فيه البناء الأصلي مقارنة بالخيارات الأخرى؟',
    options: [
      'أقل كلفة مالية وأقل جهد برمجي',
      'التحديث الفوري التلقائي بمجرد فتح عنوان ويب',
      'الاستفادة الكاملة والسريعة من وظائف الجهاز وحسّاساته وتجربة المستخدم',
    ],
    correct: 2,
    why: 'البناء الأصلي يتخاطب مباشرة مع نظام التشغيل فيقدم أفضل أداء وتجربة مستخدم ووصول كامل للحسّاسات.',
  },
  {
    icon: 'scale', tag: 'منطق المفاضلة',
    q: 'لماذا يُعدّ اختيار نوع التطبيق قراراً مبنياً على «المفاضلة»؟',
    options: [
      'لأن القرار يوازن بين زمن التطوير والتكلفة والوظائف المطلوبة ومستوى تجربة المستخدم',
      'لأن هناك نوعاً واحداً فقط يصلح لجميع المشاريع والظروف بلا استثناء',
      'لأن التكلفة هي العامل الوحيد الذي يُلغي اعتبارات الحسّاسات وتجربة المستخدم',
    ],
    correct: 0,
    why: 'لا يوجد نوع مثالي لكل الحالات؛ الاختيار هو موازنة بين الوقت والميزانية والحاجة للحسّاسات وجودة التجربة.',
  },
  {
    icon: 'house', tag: 'تشبيه الشارع والبيت',
    q: 'أي عبارة تصف بشكل صحيح «بيتاً بُني خصيصاً لشارع واحد ويتصل مباشرة بالكهرباء والماء، ولكل شارع بيته الخاص»؟',
    options: [
      'نسخة هجينة تعمل عبر غلاف على النظامين',
      'خدمة تعمل في المتصفح فقط دون تثبيت',
      'بناء أصلي لكل نظام تشغيل يتصل مباشرة بنظام التشغيل وحسّاساته',
    ],
    correct: 2,
    why: 'البيت المبني خصيصاً لشارع واحد والمتصل مباشرة بالخدمات يمثل التطبيق الأصلي.',
  },
  {
    icon: 'sensors', tag: 'الحسّاسات والاستجابة',
    q: 'إذا كان المشروع يحتاج إلى وصول مكثف ومباشر للكاميرا والموقع الجغرافي والبصمة بأعلى استجابة ممكنة، فأي مسار أنسب؟',
    options: [
      'بناء نسخة أصلية لكل نظام تشغيل على حدة',
      'الاكتفاء بصفحة ويب عادية داخل المتصفح',
      'الاعتماد على المتصفح فقط دون أي تثبيت',
    ],
    correct: 0,
    why: 'الوصول المباشر والسريع للحسّاسات المتقدمة يتطلب بناءً أصلياً لنظام التشغيل.',
  },
  {
    icon: 'search', tag: 'الأدلة القوية',
    q: 'ما أقوى دليل يمكن الاعتماد عليه عند تحديد كيفية بناء تطبيق وكتابة تقرير دقيق عنه؟',
    options: [
      'ملاحظة لون الأيقونة وحجمها على شاشة الهاتف',
      'قراءة ما يعلنه المطوّر رسمياً في صفحة المتجر أو موقع الشركة أو مدونة المطوّرين أو الإشارة إلى إطار العمل المستخدم',
      'تخمين نوع البناء من سرعة تحريك الشاشة فقط',
    ],
    correct: 1,
    why: 'التصريح الرسمي من المطوّرين أو ذكر التقنية المستخدمة هو الدليل الأقوى والأكثر موثوقية للتوثيق.',
  },
  {
    icon: 'doubt', tag: 'الأدلة الضعيفة',
    q: 'ما الدليل الذي يُعدّ «ضعيفاً» ولا يكفي وحده للحكم القاطع؟',
    options: [
      'تصريح رسمي من فريق التطوير يذكر أداة أو إطار البناء المستخدم',
      'ملاحظة تطابق شكل الأزرار والحركات بين نسختين عند المقارنة الظاهرية',
      'عدم وجود أي نسخة في المتجر واقتصار الوصول على رابط في المتصفح',
    ],
    correct: 1,
    why: 'تطابق الشكل بين أندرويد وiPhone مجرد مؤشر ظاهري ضعيف لا يكفي وحده لإثبات نوع البناء.',
  },
  {
    icon: 'bulb', tag: 'أخطاء الاستنتاج',
    q: 'وقع طالب في الخطأ التالي: «هذا البرنامج يعمل على أندرويد وiPhone، إذن هو مبني بطريقة هجينة». أين يكمن الخطأ في هذا الاستنتاج؟',
    options: [
      'لأن وجود النسخة على النظامين لا يثبت وحده طريقة البناء؛ فقد يكون لكل نظام نسخة مكتوبة له',
      'لأن البرامج لا يمكن أن تعمل على أندرويد وiPhone معاً',
      'لأن العمل على نظامين يعني تلقائياً أنه يعمل داخل المتصفح فقط',
    ],
    correct: 0,
    why: 'السؤال الحاسم ليس "أين يعمل التطبيق؟" بل "كيف بُني؟"، فالتطبيقات الأصلية أيضاً تتوفر على النظامين بنسختين منفصلتين.',
  },
  {
    icon: 'appicon', tag: 'أخطاء الاستنتاج',
    q: 'قالت طالبة: «ظهرت أيقونة لهذا البرنامج على شاشة هاتفي، إذن هو تطبيق أصلي لنظام هاتفي فقط». ما تقييم هذا الاستنتاج؟',
    options: [
      'صحيح دائماً لأن الأيقونة لا تظهر إلا للتطبيق الأصلي',
      'غير حاسم؛ لأن رابط الموقع يمكن إضافته كأيقونة على الشاشة، كما أن النسخة الهجينة لها أيقونة أيضاً',
      'صحيح إذا كان الهاتف متصلاً بالإنترنت',
    ],
    correct: 1,
    why: 'وجود أيقونة على الشاشة الرئيسية ينطبق على الأصلي والهجين وحتى اختصارات مواقع الويب، لذا لا يحسم النوع.',
  },
  {
    icon: 'sparkle', tag: 'أخطاء الاستنتاج',
    q: 'ما الخطأ في القول: «واجهة هذا التطبيق سلسة وجميلة جداً، إذن هو بالضرورة تطبيق أصلي»؟',
    options: [
      'لأن الواجهات الجميلة لا توجد إلا في تطبيقات المتصفح',
      'لأن الأطر الهجينة الحديثة قد تقدم تجربة قريبة جداً من الأصلي، فالمظهر وحده لا يحسم',
      'لأن سرعة الواجهة تعني أن التطبيق لا يمتلك أي كود برمجي',
    ],
    correct: 1,
    why: 'الأطر الهجينة الحديثة توفر أداءً بصرياً سلساً للغاية، لذا الشكل الخارجي وحده ليس دليلاً قاطعاً.',
  },
  {
    icon: 'search', tag: 'اختبار المتجر والمتصفح',
    q: 'إذا بحثتِ ولم تجدي إلا موقعاً يُفتح في المتصفح دون وجود نسخة مثبّتة من المتجر، فماذا يعكس هذا الاختبار؟',
    options: [
      'أنه مبني بلغة أندرويد وآبل المنفصلتين',
      'أنه يعمل كخدمة ويب عبر المتصفح ولا يتطلب تثبيتاً من المتجر',
      'أنه يعتمد على جسر برمجي للوصول إلى البصمة والكاميرا',
    ],
    correct: 1,
    why: 'غياب التطبيق عن المتجر واقتصاره على رابط متصفح يدل على أنه تطبيق ويب.',
  },
  {
    icon: 'report', tag: 'صياغة التقرير',
    q: 'لم تعلن الشركة بوضوح تقنية البناء ولم يتوفر دليل قاطع، فكيف ينبغي صياغة النتيجة في التقرير؟',
    options: [
      'كتابة «غالبًا» مع توضيح السبب وذكر مصدر المعلومة الذي تم الاعتماد عليه',
      'اختراع دليل تقني غير موجود لضمان اكتمال التقرير',
      'حذف اسم البرنامج من التقرير تماماً وعدم ذكر أي ملاحظة',
    ],
    correct: 0,
    why: 'الأمانة العلمية في تقارير الفرز تتطلب استخدام صيغة الترجيح («غالبًا») مع ذكر السبب ومصدر الدليل.',
  },
];

const TOTAL = QUESTIONS.length;

/* ---------------------------------------------------------
   🧠 الحالة
   --------------------------------------------------------- */
const state = {
  student: { name: '', grade: '', section: '' },
  current: 0,
  answers: Array(TOTAL).fill(null),   // رقم الخيار الأصلي الذي اختارته الطالبة
  orders: [],                          // ترتيب عرض الخيارات لكل سؤال
  startedAt: null,
  attempt: 1,
  submitted: false,
  result: null,
  payload: null,
};

let advanceTimer = null;
let reviewFilter = 'all';

/* ---------------------------------------------------------
   🔧 أدوات مساعدة
   --------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const el = {};

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeOrders() {
  return QUESTIONS.map((q) => {
    const base = q.options.map((_, i) => i);
    return CONFIG.SHUFFLE_OPTIONS ? shuffle(base) : base;
  });
}

function normalizeName(name) {
  return name.replace(/\s+/g, ' ').trim();
}

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function uid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function storageGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* تخزين غير متاح */ }
}
function storageRemove(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

function attemptKey(student) {
  return `${normalizeName(student.name)}|${student.grade}|${student.section}`;
}
function getPreviousAttempts(student) {
  const all = storageGet(CONFIG.ATTEMPTS_KEY) || {};
  return all[attemptKey(student)] || 0;
}
function recordAttempt(student, n) {
  const all = storageGet(CONFIG.ATTEMPTS_KEY) || {};
  all[attemptKey(student)] = n;
  storageSet(CONFIG.ATTEMPTS_KEY, all);
}

function answeredCount() {
  return state.answers.filter((a) => a !== null).length;
}
function unansweredList() {
  return state.answers.map((a, i) => (a === null ? i : -1)).filter((i) => i >= 0);
}

function gradeLabel(student) {
  return student.section ? `${student.grade} / شعبة ${student.section}` : student.grade;
}

/* ---------------------------------------------------------
   🖥️ التنقل بين الشاشات
   --------------------------------------------------------- */
function showScreen(id) {
  $$('.screen').forEach((s) => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------------------------------------------------------
   🔔 تنبيهات ونوافذ
   --------------------------------------------------------- */
let toastTimer = null;
function toast(msg, ms = 2800) {
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('show'), ms);
}

function openModal({ icon = '💬', title, body, actions = [] }) {
  el.modalIcon.textContent = icon;
  el.modalTitle.textContent = title;
  el.modalBody.innerHTML = '';
  if (typeof body === 'string') el.modalBody.textContent = body;
  else if (body) el.modalBody.appendChild(body);
  el.modalActions.innerHTML = '';
  actions.forEach((a) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `btn ${a.primary ? 'btn-primary' : 'btn-ghost'}`;
    b.textContent = a.label;
    b.addEventListener('click', () => { closeModal(); if (a.onClick) a.onClick(); });
    el.modalActions.appendChild(b);
  });
  el.modal.hidden = false;
  const first = el.modalActions.querySelector('.btn-primary') || el.modalActions.querySelector('button');
  if (first) setTimeout(() => first.focus(), 50);
}
function closeModal() { el.modal.hidden = true; }
const isModalOpen = () => !el.modal.hidden;

/* ---------------------------------------------------------
   💾 حفظ التقدم محلياً (لحماية الإجابات عند تحديث الصفحة)
   --------------------------------------------------------- */
function saveProgress() {
  if (state.submitted) return;
  storageSet(CONFIG.STORAGE_KEY, {
    student: state.student,
    current: state.current,
    answers: state.answers,
    orders: state.orders,
    startedAt: state.startedAt,
    attempt: state.attempt,
  });
}

function loadProgress() {
  const p = storageGet(CONFIG.STORAGE_KEY);
  if (!p || !p.student || !Array.isArray(p.answers) || p.answers.length !== TOTAL) return null;
  if (!Array.isArray(p.orders) || p.orders.length !== TOTAL) return null;
  return p;
}

/* ---------------------------------------------------------
   🚀 شاشة الترحيب
   --------------------------------------------------------- */
function setFieldInvalid(input, invalid) {
  input.closest('.input-wrap').classList.toggle('invalid', invalid);
}

function handleStart(e) {
  e.preventDefault();
  const name = normalizeName(el.nameInput.value);
  const grade = el.gradeSelect.value;
  const section = el.sectionSelect.value;

  setFieldInvalid(el.nameInput, false);
  setFieldInvalid(el.gradeSelect, false);

  let error = '';
  if (!name) {
    error = 'يرجى كتابة اسمكِ الثلاثي قبل البدء ✍️';
    setFieldInvalid(el.nameInput, true);
  } else if (name.split(' ').length < 3) {
    error = 'يرجى كتابة الاسم الثلاثي كاملاً (الاسم، اسم الأب، اسم العائلة)';
    setFieldInvalid(el.nameInput, true);
  } else if (!/^[\p{L}\s'ـ-]+$/u.test(name)) {
    error = 'يرجى استخدام الحروف فقط في الاسم';
    setFieldInvalid(el.nameInput, true);
  } else if (!grade) {
    error = 'يرجى اختيار الصف 🎓';
    setFieldInvalid(el.gradeSelect, true);
  }

  if (error) {
    el.formError.textContent = error;
    el.startForm.classList.remove('shake');
    void el.startForm.offsetWidth;
    el.startForm.classList.add('shake');
    (el.nameInput.closest('.invalid') ? el.nameInput : el.gradeSelect).focus();
    return;
  }

  el.formError.textContent = '';
  const student = { name, grade, section };
  startQuiz(student);
}

function startQuiz(student) {
  storageRemove(CONFIG.STORAGE_KEY);
  state.student = student;
  state.current = 0;
  state.answers = Array(TOTAL).fill(null);
  state.orders = makeOrders();
  state.startedAt = Date.now();
  state.attempt = getPreviousAttempts(student) + 1;
  state.submitted = false;
  state.result = null;
  state.payload = null;
  enterQuiz();
  saveProgress();
}

function resumeQuiz() {
  const p = loadProgress();
  if (!p) { el.resumeBox.hidden = true; return; }
  Object.assign(state, {
    student: p.student,
    current: Math.min(Math.max(p.current || 0, 0), TOTAL - 1),
    answers: p.answers,
    orders: p.orders,
    startedAt: p.startedAt || Date.now(),
    attempt: p.attempt || 1,
    submitted: false,
    result: null,
    payload: null,
  });
  enterQuiz();
  toast('مرحباً بعودتكِ! تمت استعادة إجاباتكِ السابقة 💾');
}

function enterQuiz() {
  el.quizName.textContent = state.student.name;
  el.quizGrade.textContent = gradeLabel(state.student) + (state.attempt > 1 ? ` · المحاولة ${state.attempt}` : '');
  el.avatar.textContent = state.student.name.charAt(0);
  buildNavigator();
  showScreen('#screen-quiz');
  renderQuestion(1);
}

/* ---------------------------------------------------------
   ❓ عرض الأسئلة
   --------------------------------------------------------- */
function renderQuestion(direction = 1) {
  const i = state.current;
  const q = QUESTIONS[i];
  const order = state.orders[i];

  el.qIcon.innerHTML = iconSvg(q.icon);
  el.qNum.textContent = `السؤال ${i + 1}`;
  el.qTag.textContent = q.tag;
  el.qText.textContent = q.q;

  el.options.innerHTML = '';
  order.forEach((orig, pos) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.dataset.orig = String(orig);
    btn.setAttribute('role', 'radio');
    btn.style.setProperty('--i', pos);
    btn.innerHTML = `<span class="opt-letter">${LETTERS[pos]}</span><span class="opt-text"></span><span class="opt-check">${CHECK_SVG}</span>`;
    btn.querySelector('.opt-text').textContent = q.options[orig];
    const selected = state.answers[i] === orig;
    btn.classList.toggle('selected', selected);
    btn.setAttribute('aria-checked', String(selected));
    btn.addEventListener('click', () => selectOption(orig, btn));
    el.options.appendChild(btn);
  });

  el.card.classList.remove('anim-next', 'anim-prev');
  void el.card.offsetWidth;
  el.card.classList.add(direction < 0 ? 'anim-prev' : 'anim-next');

  updateChrome();
}

function selectOption(orig, btn) {
  const i = state.current;
  const wasUnanswered = state.answers[i] === null;
  state.answers[i] = orig;

  $$('.option').forEach((b) => {
    const sel = b.dataset.orig === String(orig);
    b.classList.toggle('selected', sel);
    b.setAttribute('aria-checked', String(sel));
  });
  if (btn) {
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
  }

  updateChrome();
  saveProgress();

  clearTimeout(advanceTimer);
  if (answeredCount() === TOTAL && wasUnanswered) {
    toast('رائع! أجبتِ عن جميع الأسئلة 🎉 راجعي ثم اضغطي «إنهاء وتسليم الاختبار»', 3800);
    return;
  }
  if (CONFIG.AUTO_ADVANCE && wasUnanswered) {
    advanceTimer = setTimeout(() => {
      if (state.current !== i || isModalOpen()) return;
      const next = nextUnanswered(i);
      if (next !== null) goTo(next);
    }, CONFIG.AUTO_ADVANCE_DELAY);
  }
}

/** أقرب سؤال غير مُجاب بعد السؤال الحالي (ثم من البداية) */
function nextUnanswered(from) {
  for (let k = 1; k <= TOTAL; k++) {
    const idx = (from + k) % TOTAL;
    if (state.answers[idx] === null) return idx;
  }
  return null;
}

function goTo(index) {
  if (index < 0 || index >= TOTAL || index === state.current) return;
  clearTimeout(advanceTimer);
  const dir = index > state.current ? 1 : -1;
  state.current = index;
  saveProgress();
  renderQuestion(dir);
  if (window.innerWidth < 980) {
    el.card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function updateChrome() {
  const i = state.current;
  const done = answeredCount();

  el.qCounter.textContent = `السؤال ${i + 1} من ${TOTAL}`;
  el.answeredCounter.textContent = `تمت الإجابة: ${done}/${TOTAL}`;
  el.progressFill.style.width = `${(done / TOTAL) * 100}%`;
  el.progressbar.setAttribute('aria-valuenow', String(done));

  el.prevBtn.disabled = i === 0;
  const isLast = i === TOTAL - 1;
  el.nextBtn.innerHTML = isLast
    ? 'مراجعة وتسليم ✅'
    : 'التالي <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';

  el.submitTop.classList.toggle('ready', done === TOTAL);

  $$('.nav-dot').forEach((d, idx) => {
    d.classList.toggle('done', state.answers[idx] !== null);
    d.classList.toggle('current', idx === i);
    d.setAttribute('aria-current', idx === i ? 'step' : 'false');
  });
}

function buildNavigator() {
  el.navGrid.innerHTML = '';
  for (let i = 0; i < TOTAL; i++) {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'nav-dot';
    d.textContent = String(i + 1);
    d.setAttribute('aria-label', `الانتقال إلى السؤال ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    el.navGrid.appendChild(d);
  }
}

/* ---------------------------------------------------------
   📨 التسليم
   --------------------------------------------------------- */
function trySubmit() {
  const missing = unansweredList();
  if (missing.length) {
    const wrap = document.createElement('div');
    const p = document.createElement('p');
    p.style.margin = '0';
    p.textContent = missing.length === 1
      ? 'تبقّى سؤال واحد لم تُجيبي عنه بعد. أكملي الإجابة حتى تتمكني من التسليم 🌱'
      : `تبقّى ${missing.length} أسئلة لم تُجيبي عنها بعد. أكملي الإجابة حتى تتمكني من التسليم 🌱`;
    const pills = document.createElement('div');
    pills.className = 'pills';
    missing.forEach((i) => {
      const s = document.createElement('span');
      s.textContent = String(i + 1);
      pills.appendChild(s);
    });
    wrap.append(p, pills);

    $$('.nav-dot').forEach((d, idx) => {
      d.classList.remove('flash');
      if (missing.includes(idx)) { void d.offsetWidth; d.classList.add('flash'); }
    });

    openModal({
      icon: '📝',
      title: 'لم يكتمل الاختبار بعد',
      body: wrap,
      actions: [
        { label: `الانتقال إلى السؤال ${missing[0] + 1}`, primary: true, onClick: () => goTo(missing[0]) },
        { label: 'حسناً' },
      ],
    });
    return;
  }

  openModal({
    icon: '🚀',
    title: 'جاهزة للتسليم؟',
    body: 'أجبتِ عن جميع الأسئلة العشرين. بعد التسليم لن تتمكني من تعديل إجاباتكِ، وستُحفظ نتيجتكِ في سجل المعلمة.',
    actions: [
      { label: 'إنهاء وتسليم الاختبار', primary: true, onClick: finishQuiz },
      { label: 'مراجعة إجاباتي أولاً' },
    ],
  });
}

function computeResult() {
  const details = QUESTIONS.map((q, i) => {
    const chosen = state.answers[i];
    return {
      index: i,
      chosen,
      isCorrect: chosen === q.correct,
      shownLetter: LETTERS[state.orders[i].indexOf(chosen)],
      shownCorrectLetter: LETTERS[state.orders[i].indexOf(q.correct)],
    };
  });
  const score = details.filter((d) => d.isCorrect).length;
  const percentage = Math.round((score / TOTAL) * 100);
  let rating, ratingClass, message, emoji;
  if (percentage >= 90) {
    rating = 'ممتاز'; ratingClass = 'excellent'; emoji = '🏆';
    message = 'أداء مبهر! تفكيركِ كمهندسة برمجيات حقيقية؛ تفرّقين بين أنواع التطبيقات وتحكمين بالأدلة لا بالمظاهر.';
  } else if (percentage >= 70) {
    rating = 'جيد جداً'; ratingClass = 'vgood'; emoji = '🌟';
    message = 'عمل رائع! فهمكِ لمعمارية التطبيقات قوي، راجعي التعليلات أدناه لتصلي إلى الامتياز.';
  } else {
    rating = 'يحتاج مراجعة'; ratingClass = 'review'; emoji = '📘';
    message = 'لا بأس، كل خطأ فرصة للتعلّم! اقرئي التعليل التربوي لكل سؤال بتمعّن، ثم أعيدي المحاولة بثقة.';
  }
  const durationSec = Math.max(0, Math.round((Date.now() - state.startedAt) / 1000));
  return { details, score, percentage, rating, ratingClass, message, emoji, durationSec };
}

function buildPayload(result) {
  const now = new Date();
  return {
    submissionId: uid(),
    timestamp: now.toISOString(),
    localTime: now.toLocaleString('ar-EG-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' }),
    studentName: state.student.name,
    grade: state.student.grade,
    section: state.student.section || '',
    score: result.score,
    total: TOTAL,
    percentage: result.percentage,
    rating: result.rating,
    attempt: state.attempt,
    durationSeconds: result.durationSec,
    wrongQuestions: result.details.filter((d) => !d.isCorrect).map((d) => d.index + 1).join('، '),
    // الحروف هنا بحسب ترتيب بنك الأسئلة الأصلي (أ، ب، ج) لا بحسب ترتيب العرض المخلوط
    answers: result.details.map((d) => ({
      q: d.index + 1,
      chosen: LETTERS[d.chosen],
      correct: LETTERS[QUESTIONS[d.index].correct],
      isCorrect: d.isCorrect,
      chosenText: QUESTIONS[d.index].options[d.chosen],
    })),
  };
}

function finishQuiz() {
  if (state.submitted) return;
  if (unansweredList().length) { trySubmit(); return; }

  state.submitted = true;
  clearTimeout(advanceTimer);
  clearTimeout(toastTimer);
  el.toast.classList.remove('show');
  state.result = computeResult();
  state.payload = buildPayload(state.result);
  recordAttempt(state.student, state.attempt);
  storageRemove(CONFIG.STORAGE_KEY);

  renderResults();
  showScreen('#screen-results');
  sendResults();
}

/* ---------------------------------------------------------
   🏁 شاشة النتيجة
   --------------------------------------------------------- */
function renderResults() {
  const r = state.result;
  el.rName.textContent = state.student.name;
  el.rGrade.textContent = gradeLabel(state.student);
  el.rRating.className = `rating ${r.ratingClass}`;
  el.rRating.textContent = `${r.emoji} ${r.rating}`;
  el.rMsg.textContent = r.message;
  el.sCorrect.textContent = String(r.score);
  el.sWrong.textContent = String(TOTAL - r.score);
  el.sTime.textContent = formatDuration(r.durationSec);
  el.sAttempt.textContent = String(state.attempt);

  // حلقة النسبة + عدّاد متحرك
  const C = 2 * Math.PI * 52;
  el.ringBar.style.strokeDasharray = String(C);
  el.ringBar.style.strokeDashoffset = String(C);
  requestAnimationFrame(() => {
    setTimeout(() => { el.ringBar.style.strokeDashoffset = String(C * (1 - r.percentage / 100)); }, 250);
  });
  countUp(r.percentage, r.score);

  reviewFilter = 'all';
  $$('.chip-btn').forEach((b) => b.classList.toggle('active', b.dataset.filter === 'all'));
  renderReview();

  if (r.percentage >= CONFIG.CONFETTI_FROM_PERCENT) setTimeout(() => confetti(), 700);
}

function countUp(percent, score) {
  const start = performance.now();
  const dur = 1500;
  const step = (t) => {
    const k = Math.min(1, (t - start) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.rPercent.textContent = `${Math.round(percent * e)}%`;
    el.rScore.textContent = `${Math.round(score * e)} / ${TOTAL}`;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderReview() {
  const r = state.result;
  el.reviewList.innerHTML = '';
  const items = r.details.filter((d) =>
    reviewFilter === 'all' ? true : reviewFilter === 'wrong' ? !d.isCorrect : d.isCorrect
  );

  if (!items.length) {
    const p = document.createElement('p');
    p.className = 'review-empty glass';
    p.textContent = reviewFilter === 'wrong'
      ? '🎉 لا توجد إجابات خاطئة — أحسنتِ!'
      : 'لا توجد إجابات صحيحة بعد — راجعي التعليلات وأعيدي المحاولة 💪';
    el.reviewList.appendChild(p);
    return;
  }

  items.forEach((d, n) => {
    const q = QUESTIONS[d.index];
    const card = document.createElement('article');
    card.className = `r-item glass${d.isCorrect ? '' : ' wrong'}`;
    card.style.setProperty('--i', n);

    const top = document.createElement('div');
    top.className = 'r-top';
    top.innerHTML = `<span class="r-badge">${d.index + 1}</span><span class="r-mini-icon">${iconSvg(q.icon)}</span>
      <span class="q-tag"></span><span class="r-status">${d.isCorrect ? '✔ إجابة صحيحة' : '✘ تحتاج مراجعة'}</span>`;
    top.querySelector('.q-tag').textContent = q.tag;

    const qText = document.createElement('p');
    qText.className = 'r-q';
    qText.textContent = q.q;

    const ans = document.createElement('div');
    ans.className = 'r-ans';
    ans.appendChild(line(d.isCorrect ? 'yours-ok' : 'yours-bad', `إجابتكِ (${d.shownLetter}):`, q.options[d.chosen]));
    if (!d.isCorrect) ans.appendChild(line('correct', `الإجابة الصحيحة (${d.shownCorrectLetter}):`, q.options[q.correct]));

    const why = document.createElement('div');
    why.className = 'r-why';
    const b = document.createElement('b');
    b.textContent = '💡 التعليل: ';
    why.append(b, document.createTextNode(q.why));

    card.append(top, qText, ans, why);
    el.reviewList.appendChild(card);
  });

  function line(cls, label, text) {
    const div = document.createElement('div');
    div.className = `r-line ${cls}`;
    const b = document.createElement('b');
    b.textContent = label;
    const s = document.createElement('span');
    s.textContent = text;
    div.append(b, s);
    return div;
  }
}

/* ---------------------------------------------------------
   ☁️ الإرسال إلى Google Sheets
   --------------------------------------------------------- */
function isConfigured() {
  const u = (CONFIG.GOOGLE_SCRIPT_URL || '').trim();
  return /^https:\/\/script\.google(usercontent)?\.com\//.test(u);
}

function setSaveState(stateName, text) {
  el.saveStatus.dataset.state = stateName;
  el.saveText.textContent = text;
  el.resendBtn.hidden = stateName !== 'error';
}

async function fetchWithTimeout(url, options, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/**
 * يُرسل البيانات كنص JSON بنوع text/plain (طلب "بسيط" لا يحتاج preflight)
 * فيتجنب مشاكل CORS مع Google Apps Script. وإن مُنعت قراءة الرد،
 * نعيد الإرسال بوضع no-cors — والسكربت يتجاهل التكرار عبر submissionId.
 */
async function postToSheet(payload) {
  const url = CONFIG.GOOGLE_SCRIPT_URL.trim();
  const body = JSON.stringify(payload);
  const base = { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body };

  try {
    const res = await fetchWithTimeout(url, { ...base, redirect: 'follow' }, CONFIG.REQUEST_TIMEOUT);
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { /* ليس JSON */ }
    if (data && data.status === 'success') return true;
    if (data && data.status === 'error') throw new Error(data.message || 'SCRIPT_ERROR');
    if (res.ok) return true;
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    if (err && err.name === 'TypeError') {
      await fetchWithTimeout(url, { ...base, mode: 'no-cors' }, CONFIG.REQUEST_TIMEOUT);
      return true;
    }
    throw err;
  }
}

async function sendResults() {
  if (!state.payload) return;
  if (!isConfigured()) {
    setSaveState('config', '⚠️ لم يُضبط رابط الحفظ بعد (GOOGLE_SCRIPT_URL في ملف script.js). النتيجة ظاهرة لكِ لكنها لم تُرسل إلى سجل المعلمة.');
    return;
  }
  setSaveState('sending', 'جاري حفظ نتيجتكِ في سجل المعلمة...');
  try {
    await postToSheet(state.payload);
    storageRemove(CONFIG.PENDING_KEY);
    setSaveState('success', '✅ تم حفظ نتيجتك بنجاح في سجل المعلمة');
  } catch (err) {
    console.error('Save failed:', err);
    storageSet(CONFIG.PENDING_KEY, state.payload);
    setSaveState('error', '❌ تعذّر حفظ النتيجة (تحققي من الاتصال بالإنترنت). اضغطي «إعادة محاولة الحفظ» أو أبلغي المعلمة.');
  }
}

/** إعادة إرسال نتيجة سابقة لم تُحفظ (مثلاً بسبب انقطاع الإنترنت) */
async function flushPending() {
  const pending = storageGet(CONFIG.PENDING_KEY);
  if (!pending || !isConfigured()) return;
  try {
    await postToSheet(pending);
    storageRemove(CONFIG.PENDING_KEY);
    toast('✅ تم حفظ نتيجتكِ السابقة في سجل المعلمة');
  } catch { /* سنحاول لاحقاً */ }
}

/* ---------------------------------------------------------
   🔁 إعادة المحاولة
   --------------------------------------------------------- */
function retry() {
  openModal({
    icon: '🔁',
    title: 'إعادة المحاولة',
    body: `ستبدئين محاولة جديدة (المحاولة رقم ${state.attempt + 1}) بترتيب خيارات مختلف، وستُسجَّل نتيجتها أيضاً في سجل المعلمة.`,
    actions: [
      { label: 'ابدئي من جديد', primary: true, onClick: () => startQuiz({ ...state.student }) },
      { label: 'إلغاء' },
    ],
  });
}

/* ---------------------------------------------------------
   🎉 Confetti (بدون مكتبات)
   --------------------------------------------------------- */
function confetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = el.confetti;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth, H = window.innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colors = ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#6366f1', '#ffffff'];
  const pieces = [];
  const burst = (x, count, dirX) => {
    for (let i = 0; i < count; i++) {
      pieces.push({
        x, y: H * 0.65,
        vx: dirX * (Math.random() * 9 + 3) + (Math.random() - 0.5) * 4,
        vy: -(Math.random() * 15 + 10),
        w: Math.random() * 8 + 5, h: Math.random() * 5 + 4,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.35,
        color: colors[(Math.random() * colors.length) | 0],
        shape: Math.random() < 0.3 ? 'circle' : 'rect',
        life: 0,
      });
    }
  };
  burst(0, 90, 1);
  burst(W, 90, -1);
  for (let i = 0; i < 70; i++) {
    pieces.push({
      x: Math.random() * W, y: -20 - Math.random() * H * 0.5,
      vx: (Math.random() - 0.5) * 2, vy: Math.random() * 2 + 2,
      w: Math.random() * 8 + 5, h: Math.random() * 5 + 4,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      color: colors[(Math.random() * colors.length) | 0], shape: 'rect', life: 0,
    });
  }

  const start = performance.now();
  const DURATION = 4200;
  const frame = (t) => {
    const elapsed = t - start;
    ctx.clearRect(0, 0, W, H);
    const fade = elapsed > DURATION - 900 ? Math.max(0, (DURATION - elapsed) / 900) : 1;
    pieces.forEach((p) => {
      p.vy += 0.38; p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.h / 2, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)) + 1);
      ctx.restore();
    });
    if (elapsed < DURATION) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, W, H);
  };
  requestAnimationFrame(frame);
}

/* ---------------------------------------------------------
   ⌨️ لوحة المفاتيح
   --------------------------------------------------------- */
function handleKeys(e) {
  if (isModalOpen()) {
    if (e.key === 'Escape') closeModal();
    return;
  }
  if (!$('#screen-quiz').classList.contains('active')) return;
  if (e.target.matches('input, select, textarea')) return;

  const map = { '1': 0, '2': 1, '3': 2, 'أ': 0, 'ب': 1, 'ج': 2 };
  if (e.key in map) {
    const btn = el.options.children[map[e.key]];
    if (btn) btn.click();
    return;
  }
  // الواجهة من اليمين لليسار: السهم الأيسر = التالي
  if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(state.current + 1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); goTo(state.current - 1); }
}

/* ---------------------------------------------------------
   🧩 التهيئة
   --------------------------------------------------------- */
function init() {
  Object.assign(el, {
    startForm: $('#start-form'),
    nameInput: $('#student-name'),
    gradeSelect: $('#student-grade'),
    sectionSelect: $('#student-section'),
    formError: $('#form-error'),
    resumeBox: $('#resume-box'),
    resumeInfo: $('#resume-info'),
    resumeBtn: $('#resume-btn'),

    quizName: $('#quiz-student-name'),
    quizGrade: $('#quiz-student-grade'),
    avatar: $('#avatar'),
    qCounter: $('#q-counter'),
    answeredCounter: $('#answered-counter'),
    progressFill: $('#progress-fill'),
    progressbar: $('#progressbar'),
    submitTop: $('#submit-top'),
    card: $('#question-card'),
    qIcon: $('#q-icon'),
    qNum: $('#q-num'),
    qTag: $('#q-tag'),
    qText: $('#q-text'),
    options: $('#options'),
    navGrid: $('#nav-grid'),
    prevBtn: $('#prev-btn'),
    nextBtn: $('#next-btn'),

    rName: $('#result-title'),
    rGrade: $('#r-grade'),
    rRating: $('#r-rating'),
    rMsg: $('#r-msg'),
    rPercent: $('#r-percent'),
    rScore: $('#r-score'),
    ringBar: $('#ring-bar'),
    sCorrect: $('#s-correct'),
    sWrong: $('#s-wrong'),
    sTime: $('#s-time'),
    sAttempt: $('#s-attempt'),
    saveStatus: $('#save-status'),
    saveText: $('#save-text'),
    resendBtn: $('#resend-btn'),
    reviewList: $('#review-list'),

    modal: $('#modal'),
    modalIcon: $('#modal-icon'),
    modalTitle: $('#modal-title'),
    modalBody: $('#modal-body'),
    modalActions: $('#modal-actions'),
    toast: $('#toast'),
    confetti: $('#confetti'),
  });

  el.startForm.addEventListener('submit', handleStart);
  el.nameInput.addEventListener('input', () => { setFieldInvalid(el.nameInput, false); el.formError.textContent = ''; });
  el.gradeSelect.addEventListener('change', () => { setFieldInvalid(el.gradeSelect, false); el.formError.textContent = ''; });
  el.resumeBtn.addEventListener('click', resumeQuiz);

  el.prevBtn.addEventListener('click', () => goTo(state.current - 1));
  el.nextBtn.addEventListener('click', () => {
    if (state.current === TOTAL - 1) trySubmit();
    else goTo(state.current + 1);
  });
  el.submitTop.addEventListener('click', trySubmit);

  el.resendBtn.addEventListener('click', sendResults);
  el.saveStatus.dataset.state = 'idle';
  $('#retry-btn').addEventListener('click', retry);
  $('#review-jump').addEventListener('click', () => $('#review').scrollIntoView({ behavior: 'smooth' }));
  $$('.chip-btn').forEach((b) => b.addEventListener('click', () => {
    reviewFilter = b.dataset.filter;
    $$('.chip-btn').forEach((x) => x.classList.toggle('active', x === b));
    renderReview();
  }));

  el.modal.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) closeModal(); });
  document.addEventListener('keydown', handleKeys);

  // تحذير قبل مغادرة الصفحة أثناء الاختبار
  window.addEventListener('beforeunload', (e) => {
    if ($('#screen-quiz').classList.contains('active') && answeredCount() > 0 && !state.submitted) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // محاولة غير مكتملة؟
  const p = loadProgress();
  if (p) {
    const done = p.answers.filter((a) => a !== null).length;
    el.resumeInfo.textContent = `${p.student.name} — أجبتِ عن ${done} من ${TOTAL}`;
    el.resumeBox.hidden = false;
    el.nameInput.value = p.student.name;
    el.gradeSelect.value = p.student.grade;
    el.sectionSelect.value = p.student.section || '';
  }

  flushPending();
}

document.addEventListener('DOMContentLoaded', init);
