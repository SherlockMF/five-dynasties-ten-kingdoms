import type { Metadata } from "next";
import { FieldContainer } from "@/features/field/field-container";
import { currentFieldConfig } from "@/lib/field/server-config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "李静训墓现场 | 山河纪" };
export default function FieldPage() { return <FieldContainer config={currentFieldConfig()} />; }
