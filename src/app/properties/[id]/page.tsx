import type { Metadata } from "next";
import PropertyDetailView from "@/components/property/PropertyDetailView";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  return { title: `Property #${id}` };
}

export default async function Page({ params }: Params) {
  const { id } = await params;
  return <PropertyDetailView id={id} />;
}
