import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { X, ArrowSquareOut, WarningCircle, CircleNotch } from "@phosphor-icons/react";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import { useCourseDetail } from "../../lib/useCourseDetail";
import { resolveSiteUrl } from "../../lib/resolveSiteUrl";

// If the iframe hasn't fired onLoad within this window, some hosts block
// framing silently (no error event is dispatched for that — the frame just
// stays blank), so we show a fallback instead of spinning forever.
const LOAD_FALLBACK_MS = 8000;

function goBack(navigate) {
  if (window.history.state?.idx > 0) {
    navigate(-1);
  } else {
    navigate("/courses", { replace: true });
  }
}

function TopBar({ title, navigate }) {
  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between gap-space-1-5 bg-surface border-b border-border px-space-2 py-space-1-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
    >
      <h1 className="text-h2 text-text truncate">{title}</h1>
      <button
        type="button"
        onClick={() => goBack(navigate)}
        aria-label="إغلاق"
        className="flex items-center justify-center min-h-touch min-w-touch rounded-full text-text hover:bg-surface-alt transition-colors duration-base shrink-0"
      >
        <X size={22} aria-hidden />
      </button>
    </div>
  );
}

export default function LandingPageViewer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { status, data, notFound, reload } = useCourseDetail(slug);

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const timeoutRef = useRef(null);

  const course = data?.course;
  const landingUrl = course?.landing_href ? resolveSiteUrl(course.landing_href) : null;

  let iframeSrc = null;
  if (landingUrl) {
    const url = new URL(landingUrl);
    url.searchParams.set("embed", "1");
    iframeSrc = url.toString();
  }

  useEffect(() => {
    setIframeLoaded(false);
    setShowFallback(false);
    if (!iframeSrc) return undefined;
    timeoutRef.current = setTimeout(() => setShowFallback(true), LOAD_FALLBACK_MS);
    return () => clearTimeout(timeoutRef.current);
  }, [iframeSrc]);

  if (status === "loading") {
    return (
      <div className="flex flex-col" style={{ minHeight: "100dvh" }}>
        <TopBar title="التفاصيل" navigate={navigate} />
        <div className="flex-1 flex items-center justify-center bg-surface-alt">
          <CircleNotch size={28} className="text-muted animate-spin" aria-hidden />
        </div>
      </div>
    );
  }

  if (status === "error") {
    if (notFound) {
      return (
        <div className="flex flex-col" style={{ minHeight: "100dvh" }}>
          <TopBar title="الكورس" navigate={navigate} />
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={WarningCircle}
              heading="الكورس مش موجود"
              body="ممكن يكون الرابط غلط أو الكورس اتشال."
              actionLabel="الرجوع لكل الكورسات"
              onAction={() => navigate("/courses", { replace: true })}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col" style={{ minHeight: "100dvh" }}>
        <TopBar title="الكورس" navigate={navigate} />
        <div className="flex-1 flex items-center justify-center">
          <ErrorState onRetry={reload} />
        </div>
      </div>
    );
  }

  if (course.has_access === true) {
    return <Navigate to={`/courses/${slug}`} replace />;
  }

  if (!iframeSrc) {
    return (
      <div className="flex flex-col" style={{ minHeight: "100dvh" }}>
        <TopBar title={course.title} navigate={navigate} />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={WarningCircle}
            heading="مفيش تفاصيل إضافية للكورس ده"
            actionLabel="الرجوع"
            onAction={() => goBack(navigate)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh" }}>
      <TopBar title={course.title} navigate={navigate} />
      <div className="relative flex-1">
        {!iframeLoaded && !showFallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-alt">
            <CircleNotch size={28} className="text-muted animate-spin" aria-hidden />
          </div>
        )}
        {showFallback && !iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-alt px-space-2">
            <div className="flex flex-col items-center text-center gap-space-1-5 bg-surface rounded shadow-sm border border-border p-space-3 max-w-xs">
              <WarningCircle size={32} className="text-muted" aria-hidden />
              <p className="text-body text-text">
                الصفحة بتاخد وقت أطول من المتوقع تفتح هنا.
              </p>
              <a
                href={iframeSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 min-h-touch px-space-2-5 rounded-sm bg-primary text-primary-contrast text-label"
              >
                افتح الصفحة في المتصفح
                <ArrowSquareOut size={18} aria-hidden />
              </a>
            </div>
          </div>
        )}
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          title={course.title}
          onLoad={() => setIframeLoaded(true)}
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </div>
  );
}
