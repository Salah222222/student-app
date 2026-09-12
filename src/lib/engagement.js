import { useEffect, useState } from "react";

const SESSION_COUNT_KEY = "student_app_session_count";
const FIRST_COMPLETE_KEY = "student_app_completed_a_lesson";

// Call once per app boot (see App.jsx) to bump the session counter.
export function recordSessionStart() {
  const current = Number(localStorage.getItem(SESSION_COUNT_KEY) || "0");
  localStorage.setItem(SESSION_COUNT_KEY, String(current + 1));
}

// Call whenever a lesson is successfully marked complete.
export function recordLessonCompleted() {
  const wasAlready = localStorage.getItem(FIRST_COMPLETE_KEY) === "1";
  localStorage.setItem(FIRST_COMPLETE_KEY, "1");
  if (!wasAlready) {
    window.dispatchEvent(new Event("engagement-changed"));
  }
}

// True once the student has finished a lesson, or this is their 2nd+
// session — matches the design doc's trigger timing exactly.
export function hasEngagementSignal() {
  const sessions = Number(localStorage.getItem(SESSION_COUNT_KEY) || "0");
  const completedOne = localStorage.getItem(FIRST_COMPLETE_KEY) === "1";
  return completedOne || sessions >= 2;
}

// React hook wrapper: re-evaluates when a lesson-completion event fires,
// so the install sheet can appear mid-session right after a student
// finishes their first lesson, without needing a page reload.
export function useEngagementSignal() {
  const [ready, setReady] = useState(hasEngagementSignal());

  useEffect(() => {
    function handler() {
      setReady(hasEngagementSignal());
    }
    window.addEventListener("engagement-changed", handler);
    return () => window.removeEventListener("engagement-changed", handler);
  }, []);

  return ready;
}
