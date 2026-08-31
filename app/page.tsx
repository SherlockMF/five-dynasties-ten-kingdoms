import { HomePageContent } from "@/features/home/home-page-content";
import { MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/history/year-range";
import { getHistoryRepository } from "@/lib/repositories";

export default async function HomePage() {
  const repository = getHistoryRepository();
  const [dynasties, events, people, regions] = await Promise.all([
    repository.getAllDynasties(),
    repository.getEventsInRange(TIMELINE_MIN_YEAR, MAX_YEAR),
    repository.getAllPeople(),
    repository.getRegionsInRange(TIMELINE_MIN_YEAR, MAX_YEAR),
  ]);
  return <HomePageContent dynasties={dynasties} events={events} people={people} regions={regions} />;
}
