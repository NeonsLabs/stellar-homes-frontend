import type { Metadata } from "next";
import PropertiesView from "@/components/property/PropertiesView";

export const metadata: Metadata = {
  title: "Properties",
  description: "Every property registered on-chain, with its title, valuation and build progress.",
};

export default function Page() {
  return <PropertiesView />;
}
