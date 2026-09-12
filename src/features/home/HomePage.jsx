import { Link } from "react-router-dom";
import { Ticket, PlayCircle } from "@phosphor-icons/react";
import Layout from "../../components/Layout";
import { SkeletonCard, SkeletonLine } from "../../components/SkeletonCard";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import RedeemCodeForm from "./RedeemCodeForm";
import { useAuth } from "../../context/AuthContext";
import { useMyCourses } from "../../lib/useMyCourses";

export default function HomePage() {
  const { user } = useAuth();
  const { status, courses, reload } = useMyCourses();

  const inProgress = courses.find((c) => c.progress_percent < 100) || courses[0];

  // Continue exactly where the student left off when we know the last
  // lesson they opened; otherwise fall back to the course page (e.g. they
  // haven't opened any lesson in this course yet).
  const continueHref = inProgress
    ? inProgress.last_lesson_slug
      ? `/courses/${inProgress.course_slug}/lessons/${inProgress.last_lesson_slug}`
      : `/courses/${inProgress.course_slug}`
    : null;

  return (
    <Layout title={`أهلًا${user?.name ? `، ${user.name.split(" ")[0]}` : ""}`}>
      <div className="flex flex-col gap-space-3">
        {status === "loading" && (
          <>
            <SkeletonLine className="h-5 w-40" />
            <SkeletonCard />
          </>
        )}

        {status === "error" && <ErrorState onRetry={reload} />}

        {status === "success" && courses.length === 0 && (
          <EmptyState
            icon={Ticket}
            heading="لسه مفيش كورسات مفعّلة"
            body="فعّل كودك الأول عشان تبدأ رحلة التعلّم."
          />
        )}

        {status === "success" && inProgress && (
          <section>
            <h2 className="text-h2 text-text mb-space-1-5">كمّل من هنا</h2>
            <Link
              to={continueHref}
              className="flex items-center gap-space-1-5 bg-surface rounded shadow-sm border border-border p-space-2-5 hover:shadow-md transition-shadow duration-base"
            >
              <span className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-soft shrink-0">
                <PlayCircle size={28} className="text-primary" weight="fill" aria-hidden />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-body-lg text-text truncate">
                  {inProgress.course_title}
                </span>
                <span className="block text-caption text-muted">
                  {inProgress.progress_percent}% مكتمل
                </span>
              </span>
            </Link>
          </section>
        )}

        <RedeemCodeForm onRedeemed={reload} />
      </div>
    </Layout>
  );
}
