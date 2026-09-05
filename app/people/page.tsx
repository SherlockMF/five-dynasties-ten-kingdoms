import "@xyflow/react/dist/style.css";

import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { PersonExplorer } from "@/features/people/person-explorer";
import { getHistoryRepository } from "@/lib/repositories";
import { MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/history/year-range";

export const metadata: Metadata = { title: "人物关系" };

export default async function PeoplePage() {
  const repository = getHistoryRepository();
  const [people, dynasties, relations, events] = await Promise.all([repository.getAllPeople(), repository.getAllDynasties(), repository.getAllPersonRelations(), repository.getEventsInRange(TIMELINE_MIN_YEAR, MAX_YEAR)]);
  return <PageShell eyebrow="People & power" title="从一个人，看见一张时代关系网" description="默认只展示中心人物与一度关系。点击任何人物，关系网会以他为中心重新展开，也可沿生平事件走进当年的地图。"><PersonExplorer initialPersonId="shi-jingtang" people={people} dynasties={dynasties} relations={relations} events={events} /></PageShell>;
}
