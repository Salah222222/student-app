# HANDOFF

## حالة المشروع

- `student-app`: PWA (مش Capacitor ولا React Native) — React 18 + Vite +
  Tailwind + react-router-dom v6 + @phosphor-icons/react.
- منشور على Vercel: `https://student-app-eight-beryl.vercel.app`.
- بيستهلك JSON API من موقع Salah Elmasry School على
  `https://mediumturquoise-baboon-677914.hostingersite.com/api/v1` —
  دومين منفصل تمامًا عن دومين التطبيق (كل استدعاء API أو رابط للموقع
  URL كامل، مش مسار نسبي).
- الطالب المسجّل (كورساته، الدروس، التقدم) منفصل تمامًا عن كتالوج
  "كل الكورسات" العام؛ الأول محمي بـ`ProtectedRoute`، والتاني (وصفحة
  تفاصيل الكورس الجديدة) متاح من غير تسجيل دخول.
- آخر مرحلة منفّذة: **MOB-P2** (تفاصيل تحتها).

## آخر شغل: MOB-P2

صفحة React جديدة بتعرض صفحة هبوط الكورس جوه iframe، وزرارين جداد في كارت
"كل الكورسات". 4 checkpoints:

| Checkpoint | الملفات |
|---|---|
| 1 | `src/lib/resolveSiteUrl.js` (جديد) |
| 2 | `src/features/courses/LandingPageViewer.jsx` (جديد) + route في `src/App.jsx` |
| 3 | `src/features/courses/AllCoursesPage.jsx` (إعادة هيكلة) |
| 4 | `docs/HANDOFF.md` (هذا الملف) |

## قرارات معمارية

- **iframe داخل صفحة React بدل لينك خارجي:** الطالب يفضل جوه التطبيق
  (نفس الشكل والتنقل)، وسهل نضيف route guard (`has_access`) قبل ما
  يشوف الصفحة، بعكس فتح رابط خام في تبويب جديد.
- **`?embed=1` على رابط الـiframe:** إشارة للموقع إن الصفحة دي بتتفتح
  جوه إطار مش كصفحة مستقلة (يقدر الموقع يشيل الهيدر/الفوتر بتوعه بناءً
  عليها لو حابب)، مبني بـ`URL` object مش string concat عشان يتضاف صح
  حتى لو `landing_href` فيه query params أصلًا.
- **`resolveSiteUrl.js` منفصل عن `resolveAssetUrl.js`:** `resolveAssetUrl`
  بيحط أي مسار نسبي تحت `/uploads/` (مناسب للصور بس)؛ لو استخدمناه مع
  `landing_href` أو `subscribe_href` هيبوظ المسار (`/lp/xyz` → غلط
  `/uploads/lp/xyz`). ملف منفصل بنفس نمط `new URL(API_BASE_URL).origin`.
- **الاعتماد على `landing_href` مش `details_href`:** ده الاسم اللي
  اترجع فعليًا من `GET /api/v1/courses` بعد رفع MOB-P1 (اتأكد من عينة
  حقيقية من الرد)، مفيش حقل اسمه `details_href`.
- **نمط stretched-link:** الكارت كله `<article>` بوزن `position:
  relative`، وبداخله `<Link>` واحد بس (`after:absolute after:inset-0`)
  يغطي الكارت كله، وصف الزرارين إخوة له بـ`relative z-10` عشان تفوق
  عليه في الـstacking. كده مفيش `<a>`/`<Link>` جوه `<a>`/`<Link>`
  (HTML باطل، ومكسّر الزراير على الموبايل)، ولسه ضغطة أي حتة في الكارت
  غير الزرارين بتفتح صفحة الكورس.

## Broken or incomplete

- **مفيش `npm run build` ولا فتح حقيقي في متصفح.** الشغل اتعمل واتراجع
  بقراءة الكود ومطابقته للأنماط الموجودة، بالإضافة لاختبار click-through
  على نسخة CSS/HTML مطابقة يدويًا للـmarkup الفعلي (Playwright + Chromium
  محلي، من غير الحاجة لـnpm install)، مش تشغيل فعلي لتطبيق React الكامل.
  لازم `npm install && npm run build && npm run preview` (أو نشر تجريبي
  على Vercel) قبل ما تتوثق كـ"شغّال 100%".
- **مفيش `vercel.json` في المشروع (زي ما هو مطلوب — متضافش هنا).**
  بالتالي refresh مباشر على `/courses/{slug}/details` ممكن يدّي 404 لو
  Vercel مش بيعمل SPA fallback لكل المسارات تلقائيًا. **مشكلة موجودة
  أصلًا على `/courses/{slug}` قبل MOB-P2** (نفس السبب)، مش حاجة جديدة
  من الصفحة دي.
- **الـfallback بعد 8 ثواني في `LandingPageViewer` بيغطي بس حالة
  "التحميل بطيء"، مش حالة حجب الإطار.** لو الموقع مضبّط بـ
  `X-Frame-Options` أو `Content-Security-Policy: frame-ancestors` بتمنع
  الـembedding، الـiframe هيفضل فاضي **بدون** ما يطلق `error` — لكن
  بعض المتصفحات لسه بتطلق `load` event حتى للصفحة المحجوبة (فاضية)، وده
  معناه إن اليوزر ممكن يفضل شايف إطار فاضي من غير ما يظهرله زرار
  "افتح في المتصفح" أصلًا، لأن الشرط بتاعنا هو "onLoad ما جاش خلال 8
  ثواني" مش "الصفحة فاضية". لازم اختبار يدوي على صفحة هبوط حقيقية
  للتأكد الموقع مش حاطط `X-Frame-Options: DENY`.
- **منطقة ميتة تقريبًا 20px تحت صف الزرارين** (بين آخر الزرارين
  وحافة الكارت السفلية، جوه مساحة `after:absolute after:inset-0` بتاعة
  الـstretched-link لأنها بتغطي الكارت كله بما فيه المساحة دي) — ضغطة
  فيها هتفتح صفحة الكورس مش أي زرار، سلوك متوقع من نمط stretched-link
  لكن يستاهل ملاحظة لو حصل لبس من مستخدم.
- **`subscribe_label` من غير fallback نصي.** لو الحقل رجع فاضي/`""`
  من الـAPI (مش موثّق حاليًا إنه ممكن يحصل، بس مش مضمون النقيض برضه)،
  الزرار هيتعرض بنص فاضي بدل ما يختفي أو يدي نص افتراضي زي "اشترك الآن".

## جدول المسارات — MOB-P2 (كل الملفات، جديد/معدّل)

| الملف | الحالة | Checkpoint |
|---|---|---|
| `src/lib/resolveSiteUrl.js` | جديد | 1 |
| `src/features/courses/LandingPageViewer.jsx` | جديد | 2 |
| `src/App.jsx` | معدّل (إضافة route `/courses/:slug/details`) | 2 |
| `src/features/courses/AllCoursesPage.jsx` | معدّل (إعادة هيكلة الكارت) | 3 |
| `docs/HANDOFF.md` | جديد | 4 |
