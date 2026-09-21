# student-app

An installable, offline-capable, RTL Arabic-first PWA for students to
view their enrolled courses, watch lessons, track progress, and comment —
built with React + Vite + Tailwind CSS, consuming the JSON API described
in `API.md`.

## Requirements

- Node.js 18+ and npm

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

`.env` sets `VITE_API_BASE_URL` — the base URL of the JSON API, including
the `/api/v1` segment. It defaults to the production API documented in
`API.md` if you skip this step:

```
https://mediumturquoise-baboon-677914.hostingersite.com/api/v1
```

## Build

```bash
npm run build
```

Outputs a static site to `dist/` (HTML/JS/CSS + PWA manifest + generated
service worker via `vite-plugin-pwa`).

```bash
npm run preview   # serve the dist/ build locally to sanity-check the PWA
```

> Note on this environment: this project was written and assembled
> without network access (the sandbox that generated it has npm registry
> access disabled — `npm install` returns `403 Forbidden` here), so
> `npm install` / `npm run build` have **not** been executed in this
> sandbox, including for this revision. Every file has been checked with
> the TypeScript compiler in permissive JSX mode for syntax errors and
> every relative import has been verified to resolve to a real file, but
> a real `npm install && npm run build` in an environment with registry
> access is still the way to catch a dependency-version issue before
> deploying.

## Deployment

### Vercel (free tier)

1. Push this project to a Git repo (GitHub/GitLab/Bitbucket).
2. In Vercel: **New Project** → import the repo.
3. Framework preset: **Vite**. Build command: `npm run build`. Output
   directory: `dist`.
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = your API base URL (e.g. the URL above).
5. Deploy. Vercel serves static builds free on its Hobby plan.

### Cloudflare Pages (free tier)

1. Push this project to a Git repo.
2. In Cloudflare dashboard: **Workers & Pages** → **Create** → **Pages**
   → **Connect to Git** → select the repo.
3. Build command: `npm run build`. Build output directory: `dist`.
4. Under **Settings → Environment variables**, add:
   - `VITE_API_BASE_URL` = your API base URL.
5. Save and deploy. Cloudflare Pages' free tier covers unlimited static
   requests.

Either host serves the PWA over HTTPS by default, which is required for
service workers and the install prompt to work.

## Project structure

See the file listing at the end of this document. In short:

- `src/lib/` — framework-agnostic helpers: the API client, token storage,
  the install-prompt hook, the engagement-signal tracker, and small data
  hooks (`useMyCourses`, `useCourseDetail`, `useLessonDetail`).
- `src/context/` — `AuthContext` (session state, login/logout,
  centralized 401 handling) and `ThemeContext` (light/dark, mirrors the
  website's `data-theme` attribute).
- `src/components/` — reusable UI: `Card`, `ProgressBar`,
  `LessonListItem`, skeleton loaders, `BottomNav`, `ThemeToggle`,
  `EmptyState` / `ErrorState`, `Toast`, `InstallSheet`, `Layout`,
  `ProtectedRoute`, `CourseCard`.
- `src/features/` — one folder per screen area: `auth`, `home`,
  `courses`, `lesson`.

## Known API gaps (please read before wiring this to production)

This app is built strictly against `API.md` plus the confirmed
`GET /api/v1/courses` response, with **no invented data**. One place in
the design brief still asks for something the API doesn't provide:

- **"Continue learning" → last-accessed lesson.** The design brief asks
  Home's continue-learning button to open the student's last-accessed
  lesson directly. `GET /api/v1/me/courses` doesn't return any
  last-accessed-lesson identifier, so the button currently opens that
  course's detail page instead (still real data — just one tap further
  from the lesson than the brief envisioned). **Action needed:** either
  add a `last_lesson_slug` (or similar) field to the `me/courses`
  response, or a small dedicated endpoint, and the button can be
  pointed straight at
  `/courses/{course_slug}/lessons/{last_lesson_slug}`.

The "كل الكورسات" catalog gap from an earlier revision is resolved:
`AllCoursesPage` now calls the real, deployed `GET /api/v1/courses` and
renders the confirmed field names (`id`, `title`, `slug`,
`short_description`, `thumbnail_path`, `price`, `compare_at_price`,
`currency`, `is_free`, `subscribers_count`). `is_enrolled` is optional
per the endpoint's spec (present only for an authenticated request) —
the UI shows an "مسجّل بالفعل" badge when it's `true`, and falls back to
the normal price/free badge whenever it's `false` or missing, rather
than assuming enrollment either way.

Everything else — login/logout, progress, redeem codes with real
`CouponService` error messages, course/lesson detail, lock/enrollment
states, mark-complete, and comments — is wired to the exact documented
endpoints and shapes.

## Asset URL resolution

`src/lib/resolveAssetUrl.js` is a small shared helper that turns a
relative path returned by the API (e.g. `thumbnail_path: "thumbnails/
xxx.jpg"`) into a full URL against the **API's own origin** (derived
from `VITE_API_BASE_URL`), not this app's origin. Without it, an
`<img src="thumbnails/xxx.jpg">` resolves against wherever the PWA
itself is hosted (Vercel/Cloudflare Pages) instead of the API/website —
a real bug that existed in three places before this revision:
`AllCoursesPage.jsx`, `CourseDetailPage.jsx`, and `CourseCard.jsx` (used
by both `HomePage` and `MyCoursesPage`). All four now go through the one
helper.

## PWA notes

- Manifest + service worker are generated by `vite-plugin-pwa` at build
  time (see `vite.config.js`) — nothing to hand-maintain.
- Icons at `public/icons/icon-192.png` and `icon-512.png` are placeholder
  brand-colored artwork generated for this delivery — swap them for real
  logo artwork before shipping.
- The custom install sheet (`src/components/InstallSheet.jsx`) replaces
  the browser's generic "Add to Home Screen" banner, waits for a genuine
  engagement signal (finishing a first lesson, or a 2nd+ session — see
  `src/lib/engagement.js`), and offers an iOS-specific instructional
  variant since Safari has no `beforeinstallprompt` event.
- Service worker caching: API `GET` requests are network-first (fresh
  data when online, last-known response when offline); static build
  assets are precached; cross-origin static assets (e.g. thumbnails) are
  cache-first for 30 days.

## Full file listing

```
student-app/
├── .env.example
├── .gitignore
├── README.md
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── public/
│   ├── robots.txt
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles/
    │   └── index.css
    ├── context/
    │   ├── AuthContext.jsx
    │   └── ThemeContext.jsx
    ├── lib/
    │   ├── apiClient.js
    │   ├── resolveAssetUrl.js
    │   ├── tokenStorage.js
    │   ├── useInstallPrompt.js
    │   ├── engagement.js
    │   ├── useMyCourses.js
    │   ├── useCourseDetail.js
    │   └── useLessonDetail.js
    ├── components/
    │   ├── Card.jsx
    │   ├── ProgressBar.jsx
    │   ├── SkeletonCard.jsx
    │   ├── LessonListItem.jsx
    │   ├── EmptyState.jsx
    │   ├── ErrorState.jsx
    │   ├── Toast.jsx
    │   ├── BottomNav.jsx
    │   ├── ThemeToggle.jsx
    │   ├── InstallSheet.jsx
    │   ├── Layout.jsx
    │   ├── ProtectedRoute.jsx
    │   └── CourseCard.jsx
    └── features/
        ├── auth/
        │   └── LoginPage.jsx
        ├── home/
        │   ├── HomePage.jsx
        │   ├── RedeemCodeForm.jsx
        │   └── MyCoursesPage.jsx
        ├── courses/
        │   ├── AllCoursesPage.jsx
        │   └── CourseDetailPage.jsx
        └── lesson/
            ├── LessonPlayerPage.jsx
            ├── LessonComments.jsx
            └── MarkCompleteButton.jsx
```
