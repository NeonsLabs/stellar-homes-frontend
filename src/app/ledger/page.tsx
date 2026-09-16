import type { Metadata } from "next";
import LedgerView from "@/components/LedgerView";

export const metadata: Metadata = {
  title: "Ledger",
  description: "The StellarHomes contracts, their rules, and the events they publish.",
};

export default function Page() {
  return <LedgerView />;
}
