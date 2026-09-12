import { getToken, clearSession } from "./tokenStorage";

// Read once at build/boot time. Falls back to the documented production
// API if the env var was never set (keeps `npm run dev` usable out of the
// box without forcing a .env file to exist first).
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://mediumturquoise-baboon-677914.hostingersite.com/api/v1";

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.error || "حدث خطأ غير متوقع");
    this.status = status;
    this.data = data || {};
  }
}

// A callback the app can register so a 401 (expired/invalid token, or a
// user suspended mid-session) can force a logout + redirect to Login from
// one place, instead of every screen having to check for it.
let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    // fetch() itself threw — offline, DNS failure, CORS, etc. Normalize
    // this into the same ApiError shape so callers only handle one type.
    throw new ApiError(0, { error: "تعذّر الاتصال بالخادم. تأكد من الاتصال بالإنترنت." });
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON body (e.g. a proxy error page) — treat as a generic failure
    // rather than crashing on .json().
    data = null;
  }

  if (response.status === 401 && auth) {
    clearSession();
    onUnauthorized();
  }

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request("/login", { method: "POST", body: { email, password }, auth: false }),

  logout: () => request("/logout", { method: "POST" }),

  myCourses: () => request("/me/courses"),

  redeem: (code) => request("/me/redeem", { method: "POST", body: { code } }),

  courseDetail: (slug) => request(`/courses/${encodeURIComponent(slug)}`),

  lessonDetail: (courseSlug, lessonSlug) =>
    request(`/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonSlug)}`),

  markLessonComplete: (courseSlug, lessonSlug) =>
    request(`/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonSlug)}/complete`, {
      method: "POST",
    }),

  lessonComments: (courseSlug, lessonSlug) =>
    request(`/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonSlug)}/comments`),

  postComment: (courseSlug, lessonSlug, bodyText) =>
    request(`/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonSlug)}/comments`, {
      method: "POST",
      body: { body: bodyText },
    }),

  // Published-courses catalog — confirmed live and deployed. Sends the
  // bearer token when one exists so the server can include the
  // per-course "is_enrolled" flag; works equally well with no token for
  // a logged-out visitor browsing the catalog (optional-auth endpoint,
  // same pattern as courseDetail()/lessonDetail() below).
  allCourses: () => request("/courses"),

  // Homepage marketing content — same public sections a logged-out
  // website visitor sees on "/" (hero, banners, latest courses, feature
  // cards, reviews, FAQ). No per-user data in the response, so no token
  // is sent at all.
  homepage: () => request("/homepage", { auth: false }),
};

export { API_BASE_URL };
