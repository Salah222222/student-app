import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * `/api/v1/messages*` (ANL-P3 CP4، `app/Controllers/Api/
 * MessageApiController.php`) — نفس نمط `useMyCourses` بالظبط
 * (status: "loading" | "error" | "success"، + `reload`)، زائد بولنج
 * بـ`setInterval` كل 5 ثواني بدل الفتحة الواحدة، بلا WebSocket وبلا أي
 * مكتبة state management جديدة — `useState`/`useRef` بس.
 *
 * الافتراض الوحيد هنا (غير موثّق في أي مكان تاني وصلني، لازم يتأكد وقت
 * الفحص الحي): `useAuth()` بترجّع `token` (الـbearer المطلوب في
 * `Authorization` header لكل الثلاثة راوتس — `ApiAuthMiddleware` إجباري
 * عليهم، مفيش أي راوت هنا بدون توكن). لو الشكل الفعلي لـ`AuthContext`
 * مختلف (اسم تاني للحقل، أو التوكن متخزن في مكان تاني بالكامل)، السطر
 * الوحيد اللي محتاج يتغيّر هو `token` جوه `authHeaders()` تحت.
 */
const POLL_INTERVAL_MS = 5000;

export function useMessages() {
  const { token } = useAuth();
  const [status, setStatus] = useState("loading");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const lastIdRef = useRef(0);

  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/v1/messages", { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("failed");

      setMessages(data.messages);
      lastIdRef.current = data.messages.length
        ? data.messages[data.messages.length - 1].id
        : 0;
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [authHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  // بولنج كل 5 ثواني، بس بعد أول تحميل ناجح — ونظّف الـinterval في الـ
  // cleanup لما الكومبوننت يتشال أو التوكن يتغيّر، عشان مايتكررش.
  useEffect(() => {
    if (status !== "success") return undefined;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/v1/messages/poll?after_id=${lastIdRef.current}`,
          { headers: authHeaders() }
        );
        const data = await res.json();
        if (!res.ok || !data.success || data.messages.length === 0) return;

        setMessages((prev) => [...prev, ...data.messages]);
        lastIdRef.current = data.messages[data.messages.length - 1].id;
      } catch {
        // فشل دورة بولنج واحدة مش سبب كافي لقلب الشاشة كلها لـerror —
        // المحاولة الجاية بعد 5 ثواني هتتم عادي.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [status, authHeaders]);

  const send = useCallback(
    async (body) => {
      const trimmed = body.trim();
      if (trimmed === "") return { ok: false };

      setSending(true);
      try {
        const res = await fetch("/api/v1/messages", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ body: trimmed }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          return { ok: false, error: data.error };
        }

        setMessages((prev) => [...prev, data.message]);
        lastIdRef.current = data.message.id;
        return { ok: true };
      } catch {
        return { ok: false };
      } finally {
        setSending(false);
      }
    },
    [authHeaders]
  );

  return { status, messages, sending, send, reload: load };
}
