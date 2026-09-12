import { useState } from "react";
import { Ticket } from "@phosphor-icons/react";
import { api, ApiError } from "../../lib/apiClient";

export default function RedeemCodeForm({ onRedeemed }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tone: "success" | "error", message }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const data = await api.redeem(code.trim());
      setFeedback({ tone: "success", message: "تم تفعيل الكود بنجاح! الكورس مضاف دلوقتي." });
      setCode("");
      onRedeemed?.(data);
    } catch (err) {
      // Surface the real, specific Arabic message CouponService returned
      // (expired / already used / usage limit / doesn't apply) instead of
      // a generic fallback — that's the whole point of this form.
      const message =
        err instanceof ApiError && err.data?.error
          ? err.data.error
          : "تعذّر تفعيل الكود. حاول تاني.";
      setFeedback({ tone: "error", message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded shadow-sm border border-border p-space-2-5"
    >
      <div className="flex items-center gap-space-1 mb-space-1-5">
        <Ticket size={20} className="text-primary" aria-hidden />
        <h2 className="text-h2 text-text">فعّل كود</h2>
      </div>
      <div className="flex gap-space-1">
        <input
          type="text"
          inputMode="text"
          placeholder="اكتب كود التفعيل"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          dir="ltr"
          className="flex-1 min-h-touch rounded-sm border border-border bg-surface px-space-1-5 text-body-lg text-text focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="min-h-touch px-space-2 rounded-sm bg-primary text-primary-contrast text-label disabled:opacity-60"
        >
          {loading ? "..." : "تفعيل"}
        </button>
      </div>
      {feedback && (
        <p
          className={`mt-space-1 text-caption ${
            feedback.tone === "success" ? "text-success" : "text-error"
          }`}
          role="status"
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}
