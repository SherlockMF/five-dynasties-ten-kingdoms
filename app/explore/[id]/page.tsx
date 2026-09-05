import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventDetail } from "@/features/events/event-detail";
import { MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/history/year-range";
import { getHistoryRepository } from "@/lib/repositories";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getHistoryRepository().getEvent(id);
  return { title: event?.title ?? "事件未找到", description: event?.summary };
}

export default async function EventPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ year?: string | string[]; path?: string | string[] }> }) {
  const { id } = await params;
  const repository = getHistoryRepository();
  const [event, relations, relatedEvents] = await Promise.all([repository.getEvent(id), repository.getEventRelations(id), repository.getEventsInRange(TIMELINE_MIN_YEAR, MAX_YEAR)]);
  if (!event) notFound();
  const query = await searchParams;
  const year = typeof query.year === "string" ? Number(query.year) : NaN;
  const returnYear = Number.isInteger(year) && year >= TIMELINE_MIN_YEAR && year <= MAX_YEAR ? year : event.startYear;
  return <EventDetail event={event} relations={relations} relatedEvents={relatedEvents} returnYear={returnYear} pathId={typeof query.path === "string" ? query.path : undefined} />;
}
