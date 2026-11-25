/**
 * =========================================================
 *  تحدي معمارية تطبيقات الهواتف الذكية — سجل نتائج المعلمة
 *  Google Apps Script (يُلصق داخل Google Sheets)
 * =========================================================
 *
 *  📌 خطوات التركيب والنشر (مرة واحدة فقط):
 *  1) أنشئي جدول Google Sheets جديداً.
 *  2) من القائمة: الإضافات (Extensions) ← Apps Script.
 *  3) احذفي أي كود موجود، والصقي هذا الملف كاملاً، ثم احفظي (Ctrl + S).
 *  4) من القائمة المنسدلة أعلى المحرر اختاري الدالة setup واضغطي «تشغيل» (Run)
 *     ثم وافقي على الأذونات (Review permissions ← حسابك ← Advanced ← Go to ... ← Allow).
 *     ستُنشأ ورقة «نتائج الاختبار» بالأعمدة تلقائياً.
 *  5) اضغطي «نشر» (Deploy) ← «نشر جديد» (New deployment)
 *     - النوع (Select type): تطبيق ويب (Web app)
 *     - التنفيذ باسم (Execute as): أنا (Me)
 *     - من يمكنه الوصول (Who has access): أي شخص (Anyone)
 *  6) انسخي «رابط تطبيق الويب» (ينتهي بـ /exec) والصقيه في ملف script.js
 *     داخل:  GOOGLE_SCRIPT_URL: 'الرابط هنا'
 *
 *  ⚠️ عند تعديل هذا الكود لاحقاً: Deploy ← Manage deployments ← ✏️ ← Version: New version ← Deploy
 *     (حتى يبقى الرابط نفسه ويعمل التعديل).
 *  ✅ للتأكد: افتحي رابط /exec في المتصفح، يجب أن تظهر رسالة {"status":"ok", ...}
 */

const SHEET_NAME = 'نتائج الاختبار';
const TOTAL_QUESTIONS = 20;

const BASE_HEADERS = [
  'التاريخ والوقت',
  'اسم الطالبة',
  'الصف',
  'الشعبة',
  'الدرجة (من 20)',
  'النسبة المئوية',
  'التقدير',
  'رقم المحاولة',
  'مدة الحل (دقيقة)',
  'الأسئلة الخاطئة',
];
const TAIL_HEADERS = ['معرّف التسليم', 'التفاصيل الكاملة (JSON)'];

function buildHeaders_() {
  const q = [];
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) q.push('س' + i);
  return BASE_HEADERS.concat(q, TAIL_HEADERS);
}

/** تشغيل يدوي لمرة واحدة: ينشئ الورقة والأعمدة ويطلب الأذونات */
function setup() {
  getSheet_();
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);

  if (sh.getLastRow() === 0) {
    const headers = buildHeaders_();
    sh.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight('bold')
      .setFontColor('#ffffff')
      .setBackground('#312e81')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setWrap(true);
    sh.setFrozenRows(1);
    sh.setFrozenColumns(2);
    sh.setRowHeight(1, 42);
    sh.setRightToLeft(true);
    sh.setColumnWidth(1, 150);
    sh.setColumnWidth(2, 200);
    sh.setColumnWidths(3, 2, 110);
    sh.setColumnWidths(5, 5, 100);
    sh.setColumnWidth(10, 170);
    sh.setColumnWidths(BASE_HEADERS.length + 1, TOTAL_QUESTIONS, 80);
    sh.setColumnWidth(headers.length - 1, 120);
    sh.setColumnWidth(headers.length, 260);
  }
  return sh;
}

/** يستقبل نتيجة الطالبة من موقع الاختبار */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const data = parseBody_(e);

    if (!data || !data.studentName) {
      return json_({ status: 'error', message: 'بيانات غير مكتملة' });
    }

    const sh = getSheet_();
    const headers = buildHeaders_();
    const idCol = headers.length - 1;

    // منع تكرار التسليم نفسه (عند إعادة الإرسال)
    if (data.submissionId && sh.getLastRow() > 1) {
      const found = sh.getRange(2, idCol, sh.getLastRow() - 1, 1)
        .createTextFinder(String(data.submissionId))
        .matchEntireCell(true)
        .findNext();
      if (found) return json_({ status: 'success', duplicate: true });
    }

    const answers = Array.isArray(data.answers) ? data.answers : [];
    const qCells = [];
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
      const a = answers.find(function (x) { return Number(x.q) === i; });
      if (!a) { qCells.push(''); continue; }
      qCells.push(a.isCorrect ? '✔ ' + a.chosen : '✘ ' + a.chosen + ' ← ' + a.correct);
    }

    const score = Number(data.score) || 0;
    const percentage = Number(data.percentage) || 0;
    const ts = data.timestamp ? new Date(data.timestamp) : new Date();

    const row = [
      isNaN(ts.getTime()) ? new Date() : ts,
      String(data.studentName).trim(),
      data.grade || '',
      data.section || '',
      score,
      percentage / 100,
      data.rating || '',
      Number(data.attempt) || 1,
      Math.round(((Number(data.durationSeconds) || 0) / 60) * 10) / 10,
      data.wrongQuestions || '—',
    ].concat(qCells, [data.submissionId || '', JSON.stringify(data)]);

    sh.appendRow(row);
    formatRow_(sh, sh.getLastRow(), percentage, headers.length);

    return json_({ status: 'success', row: sh.getLastRow() });
  } catch (err) {
    return json_({ status: 'error', message: String(err && err.message ? err.message : err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

/** للتأكد من أن النشر يعمل عند فتح الرابط في المتصفح */
function doGet() {
  return json_({ status: 'ok', message: 'خدمة حفظ نتائج «تحدي معمارية تطبيقات الهواتف الذكية» تعمل ✅' });
}

function parseBody_(e) {
  if (!e) return null;
  if (e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (ignore) {}
  }
  if (e.parameter) {
    if (e.parameter.payload) {
      try { return JSON.parse(e.parameter.payload); } catch (ignore) {}
    }
    if (e.parameter.studentName) return e.parameter;
  }
  return null;
}

function formatRow_(sh, r, percentage, width) {
  sh.getRange(r, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  sh.getRange(r, 6).setNumberFormat('0%');
  sh.getRange(r, 1, 1, width).setVerticalAlignment('middle');
  sh.getRange(r, 3, 1, 8).setHorizontalAlignment('center');
  sh.getRange(r, BASE_HEADERS.length + 1, 1, TOTAL_QUESTIONS).setHorizontalAlignment('center');

  const color = percentage >= 90 ? '#d1fae5' : percentage >= 70 ? '#cffafe' : '#fef3c7';
  sh.getRange(r, 5, 1, 3).setBackground(color).setFontWeight('bold');

  const qRange = sh.getRange(r, BASE_HEADERS.length + 1, 1, TOTAL_QUESTIONS);
  const vals = qRange.getValues()[0];
  qRange.setFontColors([vals.map(function (v) {
    return String(v).indexOf('✔') === 0 ? '#047857' : '#be123c';
  })]);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
