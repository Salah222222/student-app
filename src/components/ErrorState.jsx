import { WifiSlash } from "@phosphor-icons/react";

export default function ErrorState({
  heading = "معرفناش نجيب بياناتك دلوقتي",
  body = "تأكد من الاتصال بالإنترنت وحاول تاني.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center text-center gap-space-1 py-space-4 px-space-2">
      <span className="flex items-center justify-center h-16 w-16 rounded-full bg-error-bg mb-space-1">
        <WifiSlash size={32} className="text-error" aria-hidden />
      </span>
      <h2 className="text-h2 text-text">{heading}</h2>
      <p className="text-body text-muted max-w-xs">{body}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-space-1-5 min-h-touch px-space-2-5 rounded-sm bg-primary text-primary-contrast text-label"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
