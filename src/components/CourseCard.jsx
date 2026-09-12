import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { resolveAssetUrl } from "../lib/resolveAssetUrl";

export default function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.course_slug}`}
      className="block bg-surface rounded shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-base"
    >
      {course.course_thumbnail_path && (
        <img
          src={resolveAssetUrl(course.course_thumbnail_path)}
          alt=""
          className="w-full aspect-video object-cover"
          loading="lazy"
        />
      )}
      <div className="p-space-2-5">
        <h3 className="text-h2 text-text mb-1 truncate">{course.course_title}</h3>
        {course.course_short_description && (
          <p className="text-body text-muted mb-space-1-5 line-clamp-2">
            {course.course_short_description}
          </p>
        )}
        <ProgressBar percent={course.progress_percent} />
      </div>
    </Link>
  );
}
