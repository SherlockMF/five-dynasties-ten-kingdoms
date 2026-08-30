import "@xyflow/react/dist/style.css";

import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { PersonExplorer } from "@/features/people/person-explorer";
import { getHistoryRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "人物关系" };

export default async function PeoplePage() {
  const repository = getHistoryRepository();
  const [people, relations] = await Promise.all([repository.getAllPeople(), repository.getAllPersonRelations()]);
  return <PageShell eyebrow="People & power" title="从一个人，看见一张时代关系网" description="默认只展示中心人物与一度关系。点击任何人物，关系网会以他为中心重新展开。"><PersonExplorer initialPersonId="shi-jingtang" people={people} relations={relations} /></PageShell>;
}
