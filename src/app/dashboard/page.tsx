import type { Metadata } from "next";
import BorrowerDashboard from "@/components/dashboard/BorrowerDashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { getBorrowerDashboardData } from "@/data/borrower";

export const metadata: Metadata = {
  title: "Borrower Dashboard | StellarHomes",
  description:
    "Track your milestone-gated construction progress, verified site photos and monthly USDC mortgage repayments in one place.",
};

export default function DashboardPage() {
  const data = getBorrowerDashboardData();

  return (
    <div className="relative min-h-screen bg-[#0b0f19] text-[#f8fafc] selection:bg-sky-500 selection:text-white">
      {/* Ambient background gradients, matching the marketing site. Clipped by
          their own wrapper so the blur radius cannot widen the page — putting
          `overflow-hidden` on the root instead would break the sticky header. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[150px]" />
      </div>

      <DashboardHeader borrower={data.borrower} />
      <BorrowerDashboard data={data} />
    </div>
  );
}
