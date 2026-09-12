import { useEffect, useState, useCallback } from "react";

const REMIND_LATER_KEY = "student_app_install_remind_after";
const REMIND_DAYS = 14;

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function remindedRecently() {
  const raw = localStorage.getItem(REMIND_LATER_KEY);
  if (!raw) return false;
  return Date.now() < Number(raw);
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [platform, setPlatform] = useState(null); // "android" | "ios" | null

  useEffect(() => {
    if (isStandalone() || remindedRecently()) return;

    function handler(event) {
      event.preventDefault();
      setDeferredPrompt(event);
      setPlatform("android");
    }
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari never fires beforeinstallprompt — surface the
    // instructional variant instead, gated the same way.
    if (isIos()) setPlatform("ios");

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    // Whatever the user picks in the OS dialog is final — never re-prompt.
    setDeferredPrompt(null);
    setPlatform(null);
  }, [deferredPrompt]);

  const remindLater = useCallback(() => {
    const until = Date.now() + REMIND_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(REMIND_LATER_KEY, String(until));
    setPlatform(null);
    setDeferredPrompt(null);
  }, []);

  return { platform, install, remindLater };
}
