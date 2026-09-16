import type { Metadata } from "next";
import KycView from "@/components/roles/KycView";

export const metadata: Metadata = {
  title: "KYC verification",
  description: "Verify your identity to borrow or invest.",
};

export default function Page() {
  return <KycView />;
}
