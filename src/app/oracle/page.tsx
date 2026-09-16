import type { Metadata } from "next";
import OracleView from "@/components/roles/OracleView";

export const metadata: Metadata = {
  title: "Verification queue",
  description: "Verify titles, publish valuations and sign off construction stages.",
};

export default function Page() {
  return <OracleView />;
}
