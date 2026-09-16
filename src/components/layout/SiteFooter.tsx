import React from "react";
import Link from "next/link";
import { Logo, NAV, SECONDARY_NAV } from "./nav";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-[#070b12] py-10 text-sm text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm text-xs leading-relaxed">
            Diaspora mortgages released against the building, settled by Soroban contracts on Stellar.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
          {[...NAV, ...SECONDARY_NAV].map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
