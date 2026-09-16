import type { Metadata } from "next";
import UnderwriterView from "@/components/roles/UnderwriterView";

export const metadata: Metadata = {
  title: "Underwriting",
  description: "Approve or decline StellarHomes mortgage applications.",
};

export default function Page() {
  return <UnderwriterView />;
}
