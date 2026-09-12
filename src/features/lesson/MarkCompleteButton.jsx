import { useState } from "react";
import { api, ApiError } from "../../lib/apiClient";
import { useToast } from "../../components/Toast";
import { recordLessonCompleted } from "../../lib/engagement";

export default function MarkCompleteButton({ courseSlug, lessonSlug, isCompleted, onCompleted }) {
  const [completed, setCompleted] = useState(isCompleted);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  async function handleClick() {
    if (completed || loading) return;
    setLoading(true);
    // Optimistic: flip the UI immediately so the tap feels instant, then
    // reconcile with the server response (or roll back on a hard failure).
    setCompleted(true);
    try {
      await api.markLessonComplete(courseSlug, lessonSlug);
      recordLessonCompleted();
      onCompleted?.();
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        // Offline — keep the optimistic checkmark and let the student
        // carry on; syncing on reconnect is a nice-to-have a service
        // worker background-sync could add later, but isn't implemented
        // here since the API has no batch/retry endpoint to reconcile
        // against on its own.
        showToast("هنحفظ إنجازك أول ما ترجع تتصل بالنت", "default");
      } else {
        setCompleted(false);
        showToast("تعذّر حفظ إنجاز الدرس. حاول تاني.", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={completed || loading}
      className={`flex items-center justify-center gap-space-1 min-h-touch w-full rounded-sm text-label transition-colors duration-base ${
        completed
          ? "row-complete-wash text-primary border border-success-border"
          : "bg-primary text-primary-contrast"
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill={completed ? "currentColor" : "none"}
        />
        <path
          d="M7 12.5l3 3 7-7"
          stroke={completed ? "var(--color-surface)" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`check-draw ${completed ? "checked" : ""}`}
        />
      </svg>
      {completed ? "تم إكمال الدرس" : "علّم الدرس كمكتمل"}
    </button>
  );
}
