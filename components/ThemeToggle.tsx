"use client";

import { useSyncExternalStore, useState } from "react";

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const current = document.documentElement.dataset.theme as "light" | "dark" | undefined;
    if (current) return current;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  if (!mounted) {
    return (
      <span
        style={{
          color: "var(--text-50)",
          fontSize: "13px",
          whiteSpace: "nowrap",
          display: "inline-block",
        }}
      >
        Theme
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="nav__theme-btn"
    >
      <span style={{ whiteSpace: "nowrap" }}>
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
}
