import { apiClient } from "./api-client";
import { EventCardData } from "@src/components/explore/EventCard";

type ApiEvent = {
  id: number;
  title: string;
  type: string;
  location: string;
  dateTimeUtc: string;
  capacity: number;
  registeredCount: number;
  coverImageUrl: string | null;
  description: string;
  clubName: string;
};

function formatDateTime(dateTimeUtc: string): { date: string; time: string } {
  const date = new Date(dateTimeUtc);

  const dateStr = date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = date.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { date: dateStr, time: timeStr };
}

function mapToEventCard(item: ApiEvent): EventCardData {
  const { date, time } = formatDateTime(item.dateTimeUtc);
  return {
    id: String(item.id),
    title: item.title,
    description: item.description ?? item.type,
    club: item.clubName || item.type,
    date,
    time,
    location: item.location,
    registeredCount: item.registeredCount,
    maxCount: item.capacity,
  };
}

export async function getEvents(): Promise<EventCardData[]> {
  const { data } = await apiClient.get<{ success: boolean; data: ApiEvent[] }>(
    "/api/EventsPublic",
  );
  if (!data.data || data.data.length === 0) return [];
  return data.data.map(mapToEventCard);
}
