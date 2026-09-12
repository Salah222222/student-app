import { Link } from "react-router-dom";
import { Lock, CheckCircle, PlayCircle } from "@phosphor-icons/react";

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function LessonListItem({ lesson, courseSlug }) {
  const duration = formatDuration(lesson.duration_seconds);

  const icon = lesson.locked ? (
    <Lock size={20} className="text-muted" aria-hidden />
  ) : lesson.is_completed ? (
    <CheckCircle size={20} weight="fill" className="text-primary" aria-hidden />
  ) : (
    <PlayCircle size={20} className="text-primary" aria-hidden />
  );

  const content = (
    <div
      className={`flex items-center gap-space-1-5 rounded p-space-1-5 min-h-touch transition-colors duration-base ease-decel ${
        lesson.is_completed ? "row-complete-wash" : ""
      } ${lesson.locked ? "opacity-70" : "hover:bg-surface-alt"}`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-body text-text truncate">{lesson.title}</span>
        <span className="block text-caption text-muted">
          {lesson.is_free ? "مجاني" : "مدفوع"}
          {duration ? ` · ${duration}` : ""}
        </span>
      </span>
    </div>
  );

  if (lesson.locked) {
    return (
      <div aria-disabled="true" title="محتاج تفعّل الكورس الأول">
        {content}
      </div>
    );
  }

  return (
    <Link to={`/courses/${courseSlug}/lessons/${lesson.slug}`} className="block">
      {content}
    </Link>
  );
}
