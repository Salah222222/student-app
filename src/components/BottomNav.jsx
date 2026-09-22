import { NavLink, useNavigate } from "react-router-dom";
import { House, BookOpen, GraduationCap, ChatCircleDots, SignIn, SignOut } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";

const linkBase =
  "flex flex-col items-center justify-center gap-0.5 min-h-touch flex-1 text-caption transition-colors duration-fast";

function TabLink({ to, label, Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? "text-primary" : "text-muted"}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={24} weight={isActive ? "fill" : "regular"} aria-hidden />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleAuthTap() {
    if (isAuthenticated) {
      await logout();
      navigate("/login");
    } else {
      navigate("/login");
    }
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 flex bg-surface shadow-nav-up dark:border-t dark:border-border"
      style={{ height: "var(--bottom-nav-height)" }}
      aria-label="التنقل الرئيسي"
    >
      <TabLink to="/" end label="الرئيسية" Icon={House} />
      <TabLink to="/courses" label="كل الكورسات" Icon={BookOpen} />
      <TabLink to="/my-courses" label="كورساتي" Icon={GraduationCap} />
      <TabLink to="/chat" label="الرسائل" Icon={ChatCircleDots} />
      <button
        type="button"
        onClick={handleAuthTap}
        className={`${linkBase} text-muted`}
      >
        {isAuthenticated ? (
          <SignOut size={24} aria-hidden />
        ) : (
          <SignIn size={24} aria-hidden />
        )}
        <span>{isAuthenticated ? "تسجيل الخروج" : "تسجيل الدخول"}</span>
      </button>
    </nav>
  );
}
