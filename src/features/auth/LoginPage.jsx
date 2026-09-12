import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/apiClient";
import ThemeToggle from "../../components/ThemeToggle";

const ERROR_MESSAGES = {
  422: "من فضلك تأكد من البريد الإلكتروني وكلمة المرور.",
  401: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  403: "تم إيقاف هذا الحساب. تواصل مع الدعم لمزيد من التفاصيل.",
  429: "محاولات كتير خلال وقت قصير. حاول تاني بعد شوية.",
  0: "تعذّر الاتصال بالخادم. تأكد من الاتصال بالإنترنت.",
};

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);

  if (isAuthenticated) {
    const dest = location.state?.from || "/";
    return <Navigate to={dest} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      const message =
        (err instanceof ApiError && err.data?.error) || ERROR_MESSAGES[status] || ERROR_MESSAGES[0];
      setError(message);
      setShake(true);
      setTimeout(() => setShake(false), 300);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-bg">
      <header className="flex justify-end p-space-2">
        <ThemeToggle />
      </header>
      <div className="flex-1 flex flex-col justify-center px-space-2-5">
        <div
          className={`bg-surface rounded-lg shadow-md border border-border p-space-3 max-w-sm w-full mx-auto ${
            shake ? "shake" : ""
          }`}
        >
          <h1 className="text-h1 text-text mb-1">تسجيل الدخول</h1>
          <p className="text-body text-muted mb-space-2-5">
            ادخل بياناتك عشان تكمل رحلة التعلّم.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-space-1-5" noValidate>
            <label className="flex flex-col gap-1">
              <span className="text-label text-text">البريد الإلكتروني</span>
              <input
                type="email"
                required
                autoComplete="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-touch rounded-sm border border-border bg-surface px-space-1-5 text-body-lg text-text focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label text-text">كلمة المرور</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-touch rounded-sm border border-border bg-surface px-space-1-5 text-body-lg text-text focus:border-primary"
              />
              {error && <span className="text-caption text-error mt-1">{error}</span>}
            </label>
            <button
              type="submit"
              disabled={loading}
              className="min-h-touch mt-space-1 rounded-sm bg-primary text-primary-contrast text-label disabled:opacity-70"
            >
              {loading ? <SpinnerDots /> : "تسجيل الدخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function SpinnerDots() {
  return (
    <span className="inline-block h-4 w-4 rounded-full border-2 border-primary-contrast border-t-transparent ptr-spinner" />
  );
}
