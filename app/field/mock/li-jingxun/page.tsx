import { notFound } from "next/navigation";
import { currentFieldConfig } from "@/lib/field/server-config";
import { MockGame } from "@/features/field/mock-game";

export const dynamic = "force-dynamic";
export const metadata = { title: "Field 开发 Mock", robots: { index: false, follow: false } };
export default function MockFieldPage() {
  if (currentFieldConfig().mode !== "mock") notFound();
  return <MockGame />;
}
