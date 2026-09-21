import { API_BASE_URL } from "./apiClient";

// For fields that point at pages on the school's main site (landing pages,
// subscribe overrides) — NOT uploaded assets. Unlike resolveAssetUrl.js,
// this must NOT prepend "/uploads/": a relative value here (e.g.
// "/lp/webai" or a "/login" override) is already a site path, so
// re-rooting it under "/uploads/" would produce a broken URL
// ("/uploads/lp/webai"). Kept as its own module rather than a branch in
// resolveAssetUrl.js so the two "relative path" conventions never mix.
export function resolveSiteUrl(href) {
  if (!href) return null;
  if (/^https?:\/\//i.test(href)) return href; // already a full URL (e.g. wa.me link)
  if (href.startsWith("/")) {
    const origin = new URL(API_BASE_URL).origin;
    return `${origin}${href}`;
  }
  return null; // not an absolute URL and not a recognized relative path
}
