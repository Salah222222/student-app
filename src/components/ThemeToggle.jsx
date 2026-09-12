import { Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      className="flex items-center justify-center h-touch w-touch rounded-full hover:bg-surface-alt transition-colors duration-fast"
    >
      {isDark ? (
        <Sun size={20} className="text-warning" aria-hidden />
      ) : (
        <Moon size={20} className="text-muted" aria-hidden />
      )}
    </button>
  );
}
