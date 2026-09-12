import { useParams, useNavigate } from "react-router-dom";
import { WarningCircle, Users, CheckCircle } from "@phosphor-icons/react";
import Layout from "../../components/Layout";
import { SkeletonHero, SkeletonLessonRow, SkeletonLine } from "../../components/SkeletonCard";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import LessonListItem from "../../components/LessonListItem";
import { useCourseDetail } from "../../lib/useCourseDetail";
import { resolveAssetUrl } from "../../lib/resolveAssetUrl";

export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { status, data, notFound, reload } = useCourseDetail(slug);

  if (status === "loading") {
    return (
      <Layout title="الكورس">
        <div className="flex flex-col gap-space-2">
          <SkeletonHero />
          <SkeletonLine className="h-6 w-2/3" />
          <SkeletonLine className="h-4 w-full" />
          <div className="flex flex-col">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonLessonRow key={i} />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (status === "error") {
    if (notFound) {
      return (
        <Layout title="الكورس">
          <EmptyState
            icon={WarningCircle}
            heading="الكورس مش موجود"
            body="ممكن يكون الرابط غلط أو الكورس اتشال."
            actionLabel="الرجوع للرئيسية"
            onAction={() => navigate("/")}
          />
        </Layout>
      );
    }
    return (
      <Layout title="الكورس">
        <ErrorState onRetry={reload} />
      </Layout>
    );
  }

  const { course, sections, learning_points } = data;
  const hasSections = sections && sections.length > 0;

  return (
    <Layout title={course.title}>
      <div className="flex flex-col gap-space-3">
        {course.thumbnail_path && (
          <img
            src={resolveAssetUrl(course.thumbnail_path)}
            alt=""
            className="w-full aspect-video object-cover rounded-lg"
          />
        )}

        <div>
          <h2 className="text-display text-text mb-space-1">{course.title}</h2>
          {course.short_description && (
            <p className="text-body-lg text-muted mb-space-1-5">{course.short_description}</p>
          )}
          <div className="flex items-center gap-space-1-5 text-caption text-muted">
            <span className="flex items-center gap-1">
              <Users size={16} aria-hidden />
              {course.subscribers_count} مشترك
            </span>
            {!course.has_access && (
              <span className="text-body-lg text-primary font-bold">
                {course.is_free ? "مجاني" : `${course.price} ${course.currency}`}
              </span>
            )}
          </div>
        </div>

        {learning_points && learning_points.length > 0 && (
          <section>
            <h3 className="text-h2 text-text mb-space-1-5">هتتعلم إيه</h3>
            <ul className="flex flex-col gap-space-1">
              {learning_points.map((point) => (
                <li key={point.id} className="flex items-start gap-space-1 text-body text-text">
                  <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" aria-hidden />
                  <span>{point.text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h3 className="text-h2 text-text mb-space-1-5">محتوى الكورس</h3>
          {!hasSections && (
            <EmptyState
              icon={WarningCircle}
              heading="المحتوى قيد التجهيز"
              body="هنضيف الدروس قريب، تابع الإشعارات."
            />
          )}
          {hasSections && (
            <div className="flex flex-col gap-space-2">
              {sections.map((section) => (
                <div key={section.id} className="bg-surface rounded shadow-sm border border-border">
                  <div className="px-space-1-5 pt-space-1-5">
                    <h4 className="text-h2 text-text">{section.title}</h4>
                    {section.description && (
                      <p className="text-caption text-muted mb-space-1">{section.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col divide-y divide-border">
                    {section.lessons.map((lesson) => (
                      <LessonListItem key={lesson.id} lesson={lesson} courseSlug={course.slug} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
