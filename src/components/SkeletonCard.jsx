export function SkeletonCard() {
  return (
    <div className="bg-surface rounded shadow-sm border border-border p-space-2-5">
      <div className="skeleton h-24 w-full rounded-sm mb-space-1-5" />
      <div className="skeleton h-4 w-3/4 rounded-sm mb-space-1" />
      <div className="skeleton h-3 w-1/2 rounded-sm mb-space-1-5" />
      <div className="skeleton h-2 w-full rounded-full" />
    </div>
  );
}

export function SkeletonLessonRow() {
  return (
    <div className="flex items-center gap-space-1-5 p-space-1-5">
      <div className="skeleton h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1">
        <div className="skeleton h-3.5 w-2/3 rounded-sm mb-space-0" />
        <div className="skeleton h-3 w-1/3 rounded-sm" />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return <div className="skeleton w-full aspect-video rounded-lg" />;
}

export function SkeletonCommentRow() {
  return (
    <div className="flex items-start gap-space-1-5 py-space-1-5">
      <div className="skeleton h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1">
        <div className="skeleton h-3 w-1/4 rounded-sm mb-space-0" />
        <div className="skeleton h-3 w-full rounded-sm mb-space-0" />
        <div className="skeleton h-3 w-2/3 rounded-sm" />
      </div>
    </div>
  );
}

export function SkeletonLine({ className = "" }) {
  return <div className={`skeleton rounded-sm ${className}`} />;
}
