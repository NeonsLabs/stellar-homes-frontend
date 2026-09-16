import type { Metadata } from "next";
import DashboardView from "@/components/mortgage/DashboardView";

export const metadata: Metadata = {
  title: "My mortgages",
  description: "Your StellarHomes mortgages: what has been released to your trustee, and what is due.",
};

export default function Page() {
  return <DashboardView />;
}
