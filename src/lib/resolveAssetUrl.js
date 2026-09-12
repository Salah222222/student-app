import { API_BASE_URL } from "./apiClient";

// The API's thumbnail_path field returns a path relative to the site's
// /uploads/ directory (e.g. "thumbnails/xxx.jpg"), NOT relative to the
// site's document root. Confirmed against a real image URL copied
// directly from the live site:
//   https://mediumturquoise-baboon-677914.hostingersite.com/uploads/thumbnails/2a3e3bc15fd573f920cb76297081e5d6.png
// So the API's relative value must be re-rooted under "/uploads/", not
// assumed to already start from "/". Since the PWA is deployed on a
// separate domain (Vercel/Cloudflare Pages) from the API/website, using
// the raw path directly as an <img src> would also resolve against the
// wrong origin — this resolves it against the API's origin instead.
export function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // already a full URL
  const origin = new URL(API_BASE_URL).origin;
  const stripped = path.replace(/^\/+/, "");
  return `${origin}/uploads/${stripped}`;
}
