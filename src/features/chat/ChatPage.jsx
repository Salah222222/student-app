import { useEffect, useRef, useState } from "react";
import { ChatCircleDots, PaperPlaneRight } from "@phosphor-icons/react";
import Layout from "../../components/Layout";
import { SkeletonCard, SkeletonLine } from "../../components/SkeletonCard";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import { useMessages } from "../../lib/useMessages";

export default function ChatPage() {
  const { status, messages, sending, send, reload } = useMessages();
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (draft.trim() === "" || sending) return;

    const result = await send(draft);
    if (result.ok) {
      setDraft("");
      setSendError("");
    } else {
      setSendError(result.error || "تعذّر إرسال الرسالة، حاول تاني.");
    }
  }

  return (
    <Layout title="الرسائل">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto flex flex-col gap-space-1-5 pb-space-2">
          {status === "loading" && (
            <>
              <SkeletonLine className="h-5 w-32" />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {status === "error" && <ErrorState onRetry={reload} />}

          {status === "success" && messages.length === 0 && (
            <EmptyState
              icon={ChatCircleDots}
              heading="لسه مفيش رسائل"
              body="ابعت أول رسالة وهيوصلك رد من الإدارة هنا."
            />
          )}

          {status === "success" &&
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.sender === "student" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded p-space-1-5 text-body ${
                    m.sender === "student"
                      ? "bg-primary text-white"
                      : "bg-surface border border-border text-text"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <span
                    className={`block text-caption mt-space-1 ${
                      m.sender === "student" ? "text-white/70" : "text-muted"
                    }`}
                  >
                    {formatTime(m.created_at)}
                  </span>
                </div>
              </div>
            ))}

          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-space-1-5 pt-space-1-5 border-t border-border"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="اكتب رسالتك..."
            disabled={status !== "success" || sending}
            className="flex-1 rounded border border-border p-space-1-5 text-body focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status !== "success" || sending || draft.trim() === ""}
            aria-label="إرسال"
            className="flex items-center justify-center h-11 w-11 rounded-full bg-primary text-white disabled:opacity-50 shrink-0"
          >
            <PaperPlaneRight size={20} weight="fill" />
          </button>
        </form>

        {sendError && (
          <p className="text-caption text-error mt-space-1">{sendError}</p>
        )}
      </div>
    </Layout>
  );
}

function formatTime(createdAt) {
  const d = new Date(createdAt.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}
