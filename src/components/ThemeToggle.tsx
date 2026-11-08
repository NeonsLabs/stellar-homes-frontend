"use client";

import React, { useSyncExternalStore } from "react";

const KEY = "sh_theme";
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

// The saved choice lives in localStorage, which React cannot observe, so it is
// read as an external store. This avoids setting state inside an effect, and
// the server snapshot keeps the first client render identical to the server's.
function getSnapshot(): boolean {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? saved === "dark" : true;
  } catch {
    return true;
  }
}

function getServerSnapshot(): boolean {
  return true;
}

export const ThemeToggle: React.FC = () => {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = !isDark;
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      // Storage can be blocked; the toggle still works for this page view.
    }
    document.documentElement.classList.toggle("dark", next);
    listeners.forEach((notify) => notify());
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs"
      title="Toggle theme"
    >
      {isDark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
};
