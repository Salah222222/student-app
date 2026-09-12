import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, FileArrowDown, WarningCircle, PlayCircle } from "@phosphor-icons/react";
import Layout from "../../components/Layout";
import { SkeletonHero, SkeletonLine } from "../../components/SkeletonCard";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import { useLessonDetail } from "../../lib/useLessonDetail";
import { useAuth } from "../../context/AuthContext";
import MarkCompleteButton from "./MarkCompleteButton";
import LessonComments from "./LessonComments";
import { API_BASE_URL } from "../../lib/apiClient";

function websiteOrigin() {
  // download_url from the API is a relative *website* URL (per API.md),
  // not an API path — derive the site origin from the API base so the
  // link resolves correctly regardless of environment.
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "";
  }
}

export default function LessonPlayerPage() {
  const { courseSlug, lessonSlug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { status, data, forbidden, notFound, reload } = useLessonDetail(courseSlug, lessonSlug);

  if (status === "loading") {
    return (
      <Layout title="الدرس">
        <div className="flex flex-col gap-space-2">
          <SkeletonHero />
          <SkeletonLine className="h-6 w-2/3" />
          <SkeletonLine className="h-10 w-full" />
        </div>
      </Layout>
    );
  }

  if (status === "forbidden") {
    return (
      <Layout title="الدرس">
        <EmptyState
          icon={Lock}
          heading="الدرس ده لكورس مدفوع"
          body={
            forbidden.requiresLogin
              ? "سجّل دخولك وفعّل الكورس عشان تقدر تشوف الدرس."
              : "فعّل الكورس عشان تقدر تشوف الدرس."
          }
          actionLabel={forbidden.requiresLogin ? "تسجيل الدخول" : "الرجوع للكورس"}
          onAction={() =>
            forbidden.requiresLogin
              ? navigate("/login", { state: { from: `/courses/${courseSlug}/lessons/${lessonSlug}` } })
              : navigate(`/courses/${courseSlug}`)
          }
        />
      </Layout>
    );
  }

  if (status === "error") {
    if (notFound) {
      return (
        <Layout title="الدرس">
          <EmptyState
            icon={WarningCircle}
            heading="الدرس مش موجود"
            body="ممكن يكون الرابط غلط أو الدرس اتشال."
            actionLabel="الرجوع للكورس"
            onAction={() => navigate(`/courses/${courseSlug}`)}
          />
        </Layout>
      );
    }
    return (
      <Layout title="الدرس">
        <ErrorState onRetry={reload} />
      </Layout>
    );
  }

  const { lesson, course, attachments } = data;
  const origin = websiteOrigin();

  return (
    <Layout title={lesson.title}>
      <div className="flex flex-col gap-space-2-5">
        <Link to={`/courses/${course.slug}`} className="text-caption text-muted">
          {course.title}
        </Link>

        {lesson.embed_url ? (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
            <iframe
              src={lesson.embed_url}
              title={lesson.title}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="w-full aspect-video rounded-lg bg-surface-alt flex items-center justify-center">
            <PlayCircle size={40} className="text-muted opacity-40" aria-hidden />
          </div>
        )}

        <div>
          <h2 className="text-h1 text-text mb-space-1">{lesson.title}</h2>
          {lesson.description && <p className="text-body-lg text-text">{lesson.description}</p>}
        </div>

        {isAuthenticated ? (
          <MarkCompleteButton
            courseSlug={courseSlug}
            lessonSlug={lessonSlug}
            isCompleted={lesson.is_completed}
          />
        ) : (
          <p className="text-body text-muted text-center">
            <Link to="/login" className="text-primary underline">
              سجّل دخولك
            </Link>{" "}
            عشان تقدر تسجّل تقدّمك في الدرس.
          </p>
        )}

        {attachments && attachments.length > 0 && (
          <section>
            <h3 className="text-h2 text-text mb-space-1-5">مرفقات</h3>
            <ul className="flex flex-col gap-space-1">
              {attachments.map((att) => (
                <li key={att.id}>
                  <a
                    href={`${origin}${att.download_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-space-1-5 min-h-touch rounded bg-surface border border-border px-space-1-5 hover:bg-surface-alt transition-colors duration-fast"
                  >
                    <FileArrowDown size={20} className="text-primary shrink-0" aria-hidden />
                    <span className="text-body text-text truncate">{att.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <LessonComments
          courseSlug={courseSlug}
          lessonSlug={lessonSlug}
          allowComments={lesson.allow_comments}
        />
      </div>
    </Layout>
  );
}
