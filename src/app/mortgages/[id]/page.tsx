import type { Metadata } from "next";
import MortgageDetailView from "@/components/mortgage/MortgageDetailView";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  return { title: `Mortgage #${id}` };
}

export default async function Page({ params }: Params) {
  const { id } = await params;
  return <MortgageDetailView id={id} />;
}
