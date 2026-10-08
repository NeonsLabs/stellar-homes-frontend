"use client";

import React, { useEffect, useState } from "react";

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("sh_theme");
    if (saved) setIsDark(saved === "dark");
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("sh_theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
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
