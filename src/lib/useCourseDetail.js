import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./apiClient";

export function useCourseDetail(slug) {
  const [state, setState] = useState({ status: "loading", data: null, notFound: false });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const data = await api.courseDetail(slug);
      setState({ status: "success", data, notFound: false });
    } catch (err) {
      const notFound = err instanceof ApiError && err.status === 404;
      setState({ status: "error", data: null, notFound });
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
