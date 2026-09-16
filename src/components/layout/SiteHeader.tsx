"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountMenu from "./AccountMenu";
import { Logo, NAV, SECONDARY_NAV } from "./nav";

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="glass-panel sticky top-0 z-50 border-x-0 border-t-0 border-b border-white/5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 text-sm font-medium xl:flex" aria-label="Main">
          {[...NAV, ...SECONDARY_NAV].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-lg px-2.5 py-1.5 transition-colors ${
                isActive(item.href) ? "bg-white/5 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <AccountMenu />
          <button
            type="button"
            className="rounded-lg p-2 text-slate-300 hover:bg-white/5 xl:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/5 px-4 py-3 xl:hidden" aria-label="Main">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {[...NAV, ...SECONDARY_NAV].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm ${
                  isActive(item.href) ? "bg-white/5 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
