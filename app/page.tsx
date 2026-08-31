import { HomePageContent } from "@/features/home/home-page-content";
import { getHistoryRepository } from "@/lib/repositories";

export default async function HomePage() {
  const repository = getHistoryRepository();
  const [dynasties, events, people, regions] = await Promise.all([
    repository.getAllDynasties(),
    repository.getEventsInRange(875, 979),
    repository.getAllPeople(),
    repository.getRegionsInRange(875, 979),
  ]);
  return <HomePageContent dynasties={dynasties} events={events} people={people} regions={regions} />;
}
