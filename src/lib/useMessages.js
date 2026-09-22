import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./apiClient";

const POLL_INTERVAL_MS = 5000;

export function useMessages() {
  const [status, setStatus] = useState("loading");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const lastIdRef = useRef(0);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await api.messages();
      setMessages(data.messages);
      lastIdRef.current = data.messages.length
        ? data.messages[data.messages.length - 1].id
        : 0;
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (status !== "success") return undefined;

    const interval = setInterval(async () => {
      try {
        const data = await api.pollMessages(lastIdRef.current);
        if (!data.messages.length) return;

        setMessages((prev) => [...prev, ...data.messages]);
        lastIdRef.current = data.messages[data.messages.length - 1].id;
      } catch {
        // فشل دورة بولنج واحدة مش سبب كافي لقلب الشاشة كلها لـerror.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [status]);

  const send = useCallback(async (body) => {
    const trimmed = body.trim();
    if (trimmed === "") return { ok: false };

    setSending(true);
    try {
      const data = await api.sendMessage(trimmed);
      setMessages((prev) => [...prev, data.message]);
      lastIdRef.current = data.message.id;
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err?.data?.error };
    } finally {
      setSending(false);
    }
  }, []);

  return { status, messages, sending, send, reload: load };
}
