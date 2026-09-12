import { Ticket } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { SkeletonCard } from "../../components/SkeletonCard";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import CourseCard from "../../components/CourseCard";
import { useMyCourses } from "../../lib/useMyCourses";

export default function MyCoursesPage() {
  const { status, courses, reload } = useMyCourses();
  const navigate = useNavigate();

  return (
    <Layout title="كورساتي">
      {status === "loading" && (
        <div className="flex flex-col gap-space-1-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {status === "error" && <ErrorState onRetry={reload} />}

      {status === "success" && courses.length === 0 && (
        <EmptyState
          icon={Ticket}
          heading="لسه مفيش كورسات مفعّلة"
          body="فعّل كودك الأول عشان تبدأ رحلة التعلّم."
          actionLabel="فعّل كود"
          onAction={() => navigate("/")}
        />
      )}

      {status === "success" && courses.length > 0 && (
        <div className="flex flex-col gap-space-1-5">
          {courses.map((c) => (
            <CourseCard key={c.enrollment_id} course={c} />
          ))}
        </div>
      )}
    </Layout>
  );
}
