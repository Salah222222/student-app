import ThemeToggle from "./ThemeToggle";
import BottomNav from "./BottomNav";

export default function Layout({ title, children, headerExtra }) {
  return (
    <div className="min-h-full flex flex-col bg-bg">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-surface-translucent backdrop-blur border-b border-border px-space-2 py-space-1-5">
        <h1 className="text-h1 text-text truncate">{title}</h1>
        <div className="flex items-center gap-space-1">
          {headerExtra}
          <ThemeToggle />
        </div>
      </header>
      <main
        key={title}
        className="page-enter-forward flex-1 px-space-2 py-space-2"
        style={{ paddingBottom: "calc(var(--bottom-nav-height) + var(--space-2, 16px))" }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
