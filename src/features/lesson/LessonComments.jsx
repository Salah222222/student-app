import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import { SkeletonCommentRow } from "../../components/SkeletonCard";

const MAX_COMMENT_LENGTH = 2000;

export default function LessonComments({ courseSlug, lessonSlug, allowComments }) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState({ status: "loading", comments: [] });
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const data = await api.lessonComments(courseSlug, lessonSlug);
      setState({ status: "success", comments: data.comments || [] });
    } catch {
      setState({ status: "error", comments: [] });
    }
  }, [courseSlug, lessonSlug]);

  useEffect(() => {
    if (allowComments) load();
  }, [load, allowComments]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    setPostError(null);
    try {
      const data = await api.postComment(courseSlug, lessonSlug, body.trim());
      setState((s) => ({ ...s, comments: [data.comment, ...s.comments] }));
      setBody("");
    } catch (err) {
      setPostError(
        (err instanceof ApiError && err.data?.error) || "تعذّر إرسال التعليق. حاول تاني."
      );
    } finally {
      setPosting(false);
    }
  }

  if (!allowComments) return null;

  return (
    <section>
      <h3 className="text-h2 text-text mb-space-1-5">التعليقات</h3>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-1 mb-space-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
            placeholder="اكتب تعليقك..."
            rows={3}
            className="rounded-sm border border-border bg-surface px-space-1-5 py-space-1 text-body-lg text-text focus:border-primary resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-caption text-muted">
              {body.length}/{MAX_COMMENT_LENGTH}
            </span>
            <button
              type="submit"
              disabled={posting || !body.trim()}
              className="min-h-touch px-space-2 rounded-sm bg-primary text-primary-contrast text-label disabled:opacity-60"
            >
              {posting ? "..." : "إرسال"}
            </button>
          </div>
          {postError && <p className="text-caption text-error">{postError}</p>}
        </form>
      ) : (
        <p className="text-body text-muted mb-space-2">
          <Link to="/login" className="text-primary underline">
            سجّل دخولك
          </Link>{" "}
          عشان تقدر تعلّق.
        </p>
      )}

      {state.status === "loading" && (
        <div className="flex flex-col">
          <SkeletonCommentRow />
          <SkeletonCommentRow />
        </div>
      )}

      {state.status === "error" && (
        <p className="text-body text-muted">معرفناش نجيب التعليقات دلوقتي.</p>
      )}

      {state.status === "success" && state.comments.length === 0 && (
        <p className="text-body text-muted">لسه مفيش تعليقات، كن أول من يعلّق</p>
      )}

      {state.status === "success" && state.comments.length > 0 && (
        <ul className="flex flex-col divide-y divide-border">
          {state.comments.map((comment) => (
            <li key={comment.id} className="py-space-1-5">
              <div className="flex items-center gap-space-1 mb-1">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-surface-alt text-caption text-muted shrink-0">
                  {comment.student_name?.[0] || "?"}
                </span>
                <span className="text-label text-text">{comment.student_name}</span>
              </div>
              <p className="text-body text-text">{comment.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
