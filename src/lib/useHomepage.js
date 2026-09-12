import { useEffect, useState } from "react";
import { api, ApiError } from "./apiClient";

// Simple fetch-once hook for the public homepage marketing content.
// No auth involved (see apiClient.homepage()), so this can run on first
// mount regardless of login state — same as a logged-out website visitor
// hitting "/".
export function useHomepage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.homepage();
        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "تعذّر تحميل الصفحة الرئيسية.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
