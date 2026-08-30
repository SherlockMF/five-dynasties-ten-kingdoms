import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventDetail } from "@/features/events/event-detail";
import { getHistoryRepository } from "@/lib/repositories";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getHistoryRepository().getEvent(id);
  return { title: event?.title ?? "事件未找到", description: event?.summary };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repository = getHistoryRepository();
  const [event, relations, relatedEvents] = await Promise.all([repository.getEvent(id), repository.getEventRelations(id), repository.getEventsInRange(907, 960)]);
  if (!event) notFound();
  return <EventDetail event={event} relations={relations} relatedEvents={relatedEvents} />;
}
