import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/providers/AppProvider";
import LedgerBanner from "@/components/layout/LedgerBanner";
import Notices from "@/components/layout/Notices";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: {
    default: "StellarHomes | Diaspora mortgages, released against the building",
    template: "%s | StellarHomes",
  },
  description:
    "Build back home with a mortgage that is released one construction stage at a time, and only for a stage an inspector has signed off. Settled by Soroban smart contracts on Stellar.",
  keywords: ["Stellar", "Soroban", "Mortgages", "Diaspora", "Construction finance", "USDC", "Smart contracts"],
  openGraph: {
    title: "StellarHomes",
    description: "Diaspora mortgages, released against the building. Settled on Stellar.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0b0f19] text-[#f8fafc] antialiased selection:bg-sky-500 selection:text-white">
        <AppProvider>
          {/* Ambient gradients, clipped by their own wrapper so the blur cannot
              widen the page or break the sticky header. */}
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px]" />
            <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[150px]" />
          </div>
          <SiteHeader />
          <LedgerBanner />
          {children}
          <SiteFooter />
          <Notices />
        </AppProvider>
      </body>
    </html>
  );
}
