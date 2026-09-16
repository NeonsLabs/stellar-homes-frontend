import type { Metadata } from "next";
import TrusteeView from "@/components/roles/TrusteeView";

export const metadata: Metadata = {
  title: "Trustee portal",
  description: "Register properties and submit construction evidence.",
};

export default function Page() {
  return <TrusteeView />;
}
