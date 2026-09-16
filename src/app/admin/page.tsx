import type { Metadata } from "next";
import AdminView from "@/components/roles/AdminView";

export const metadata: Metadata = {
  title: "Admin",
  description: "Grant roles and inspect the platform audit log.",
};

export default function Page() {
  return <AdminView />;
}
