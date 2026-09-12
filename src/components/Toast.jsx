import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, tone = "default") => {
    clearTimeout(timerRef.current);
    setToast({ message, tone, id: Date.now() });
    timerRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed inset-x-space-2 bottom-[calc(var(--bottom-nav-height)+16px)] z-50 mx-auto max-w-sm rounded shadow-lg px-space-2 py-space-1-5 text-body-lg text-center ${
            toast.tone === "error"
              ? "bg-error-bg text-error border border-error-border"
              : toast.tone === "success"
              ? "bg-success-bg text-success border border-success-border"
              : "bg-surface text-text border border-border"
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
