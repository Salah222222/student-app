import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle, Users } from "@phosphor-icons/react";
import Layout from "../../components/Layout";
import { SkeletonCard } from "../../components/SkeletonCard";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import { api } from "../../lib/apiClient";
import { resolveAssetUrl } from "../../lib/resolveAssetUrl";
import { resolveSiteUrl } from "../../lib/resolveSiteUrl";

export default function AllCoursesPage() {
  const [state, setState] = useState({ status: "loading", courses: [] });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const data = await api.allCourses();
      setState({ status: "success", courses: data.courses || [] });
    } catch {
      setState({ status: "error", courses: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Layout title="كل الكورسات">
      {state.status === "loading" && (
        <div className="flex flex-col gap-space-1-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {state.status === "error" && <ErrorState onRetry={load} />}

      {state.status === "success" && state.courses.length === 0 && (
        <EmptyState
          icon={BookOpen}
          heading="لسه مفيش كورسات متاحة"
          body="تابعنا هنضيف كورسات جديدة قريب."
        />
      )}

      {state.status === "success" && state.courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-1-5">
          {state.courses.map((course) => {
            // "is_enrolled" is only present when the request was
            // authenticated (per the endpoint's spec). Absent → unknown
            // enrollment state, which we treat the same as "not
            // enrolled" rather than assuming either way.
            const isEnrolled = course.is_enrolled === true;
            const hasDiscount =
              course.compare_at_price != null && course.compare_at_price > course.price;

            const showDetailsButton = !isEnrolled && Boolean(course.landing_href);
            const subscribeUrl = resolveSiteUrl(course.subscribe_href);
            const showSubscribeButton = !isEnrolled && subscribeUrl !== null;
            const showButtonRow = showDetailsButton || showSubscribeButton;

            return (
              // Card body is one stretched Link (whole card is clickable);
              // the button row is a SIBLING of the Link, not nested inside
              // it, so we never end up with an <a>/<Link> inside another
              // <a> (invalid HTML, breaks tap targets on mobile).
              <article
                key={course.id}
                className="relative bg-surface rounded shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-base"
              >
                <Link
                  to={`/courses/${course.slug}`}
                  className="block after:absolute after:inset-0"
                >
                  {course.thumbnail_path && (
                    <img
                      src={resolveAssetUrl(course.thumbnail_path)}
                      alt=""
                      className="w-full aspect-video object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-space-2-5">
                    <h3 className="text-h2 text-text mb-1 truncate">{course.title}</h3>
                    {course.short_description && (
                      <p className="text-body text-muted mb-space-1-5 line-clamp-2">
                        {course.short_description}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-space-1">
                      {isEnrolled ? (
                        <span className="flex items-center gap-1 text-body text-success">
                          <CheckCircle size={18} weight="fill" aria-hidden />
                          مسجّل بالفعل
                        </span>
                      ) : course.is_free ? (
                        <span className="text-body-lg text-primary font-bold">مجاني</span>
                      ) : (
                        <span className="flex items-baseline gap-1">
                          <span className="text-body-lg text-primary font-bold">
                            {course.price} {course.currency || "EGP"}
                          </span>
                          {hasDiscount && (
                            <span className="text-caption text-muted line-through">
                              {course.compare_at_price} {course.currency || "EGP"}
                            </span>
                          )}
                        </span>
                      )}
                      {typeof course.subscribers_count === "number" && (
                        <span className="flex items-center gap-1 text-caption text-muted">
                          <Users size={14} aria-hidden />
                          {course.subscribers_count}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {showButtonRow && (
                  <div className="relative z-10 flex items-center gap-space-1 px-space-2-5 pb-space-2-5">
                    {showDetailsButton && (
                      <Link
                        to={`/courses/${course.slug}/details`}
                        className="flex-1 flex items-center justify-center min-h-touch px-space-1-5 rounded-sm border border-primary text-primary text-label text-center"
                      >
                        اعرف تفاصيل الكورس
                      </Link>
                    )}
                    {showSubscribeButton && (
                      <a
                        href={subscribeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center min-h-touch px-space-1-5 rounded-sm bg-primary text-primary-contrast text-label text-center"
                      >
                        {course.subscribe_label}
                      </a>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
