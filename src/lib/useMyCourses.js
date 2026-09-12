import { useCallback, useEffect, useState } from "react";
import { api } from "./apiClient";

export function useMyCourses() {
  const [state, setState] = useState({ status: "loading", courses: [] });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const data = await api.myCourses();
      setState({ status: "success", courses: data.courses || [] });
    } catch {
      setState({ status: "error", courses: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
