export default function ProgressBar({ percent, label }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="w-full">
      <div
        className="h-2 w-full rounded-full bg-surface-alt overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "التقدم في الكورس"}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-slow ease-standard"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="mt-1 block text-caption text-muted">{clamped}% مكتمل</span>
    </div>
  );
}
