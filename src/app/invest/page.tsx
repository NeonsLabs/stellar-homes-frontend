import type { Metadata } from "next";
import InvestView from "@/components/invest/InvestView";

export const metadata: Metadata = {
  title: "Invest",
  description: "Fund diaspora home builds through the StellarHomes lending pool.",
};

export default function Page() {
  return <InvestView />;
}
