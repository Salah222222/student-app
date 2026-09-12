import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./apiClient";

export function useLessonDetail(courseSlug, lessonSlug) {
  const [state, setState] = useState({ status: "loading", data: null, forbidden: null, notFound: false });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const data = await api.lessonDetail(courseSlug, lessonSlug);
      setState({ status: "success", data, forbidden: null, notFound: false });
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setState({
          status: "forbidden",
          data: null,
          forbidden: { requiresLogin: !!err.data?.requires_login },
          notFound: false,
        });
      } else if (err instanceof ApiError && err.status === 404) {
        setState({ status: "error", data: null, forbidden: null, notFound: true });
      } else {
        setState({ status: "error", data: null, forbidden: null, notFound: false });
      }
    }
  }, [courseSlug, lessonSlug]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load, setData: (updater) =>
    setState((s) => ({ ...s, data: typeof updater === "function" ? updater(s.data) : updater })),
  };
}
