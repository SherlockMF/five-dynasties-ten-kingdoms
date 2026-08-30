import { HomePageContent } from "@/features/home/home-page-content";
import { getHistoryRepository } from "@/lib/repositories";

export default async function HomePage() {
  const repository = getHistoryRepository();
  const [dynasties, events, people, regions] = await Promise.all([repository.getAllDynasties(), repository.getEventsInRange(907, 960), repository.getAllPeople(), repository.getRegionsInRange(907, 960)]);
  return <HomePageContent dynasties={dynasties} events={events} people={people} regions={regions} />;
}
