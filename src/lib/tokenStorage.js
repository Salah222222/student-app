// Isolated behind one module so the storage mechanism can be swapped later
// (e.g. for a more secure option on native wrappers) without touching every
// call site. localStorage is same-origin only and never sent automatically
// with cross-site requests, unlike a cookie — reasonable for a bearer token
// consumed entirely by this app's own fetch calls.
const TOKEN_KEY = "student_app_token";
const USER_KEY = "student_app_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
