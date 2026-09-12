export default function EmptyState({ icon: Icon, heading, body, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center text-center gap-space-1 py-space-4 px-space-2">
      {Icon && (
        <span className="flex items-center justify-center h-16 w-16 rounded-full bg-surface-alt mb-space-1">
          <Icon size={32} className="text-muted" aria-hidden />
        </span>
      )}
      <h2 className="text-h2 text-text">{heading}</h2>
      {body && <p className="text-body text-muted max-w-xs">{body}</p>}
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-space-1-5 min-h-touch px-space-2-5 rounded-sm bg-primary text-primary-contrast text-label"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
