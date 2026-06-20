import { apiClient, getApiErrorMessage } from "./http-client";
import { EventCardData } from "@/types/explore";
import { toAbsoluteImageUrl } from "./media";
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

type ApiEventAgendaItem = {
  id: number;
  title: string;
  startTime: string | null;
  order: number;
  isVisible: boolean;
};

type ApiEventDetails = ApiEvent & {
  coordinatorId: string;
  coordinatorName: string;
  coordinatorProfileImageUrl: string | null;
  content: string | null;
  agenda: ApiEventAgendaItem[];
};

type ApiEventDetailsResponse = {
  success?: boolean;
  message?: string;
  data?: ApiEventDetails;
};

type ApiRegisterEventResponse = {
  success?: boolean;
  message?: string;
  data?: number;
};

export type EventAgendaItem = {
  id: string;
  title: string;
  startTime: string | null;
  order: number;
};

export type EventDetails = EventCardData & {
  content: string | null;
  dateTimeUtc: string;
  coordinator: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  agenda: EventAgendaItem[];
};

export type RegisterEventInput = {
  eventId: string | number;
  fullName: string;
  universityEmail: string;
  studyYear: number;
};

function formatDateTime(dateTimeUtc: string): { date: string; time: string } {
  const date = new Date(dateTimeUtc);

  const dateStr = date.toLocaleDateString("ar-JO-u-ca-gregory", {
    month: "long",
    day: "numeric",
  });

  const timeStr = date.toLocaleTimeString("ar-JO-u-ca-gregory", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { date: dateStr, time: timeStr };
}

function formatEventType(type: string): string {
  const normalized = type.trim().toLowerCase();
  const labels: Record<string, string> = {
    workshop: "ورشة",
    exhibition: "معرض",
    seminar: "ندوة",
    meetup: "لقاء",
  };

  return labels[normalized] ?? type;
}

function mapToEventCard(item: ApiEvent): EventCardData {
  const { date, time } = formatDateTime(item.dateTimeUtc);
  const eventType = formatEventType(item.type);

  return {
    id: String(item.id),
    title: item.title,
    description: item.description ?? item.type,
    club: item.clubName || eventType,
    eventType,
    date,
    time,
    location: item.location,
    registeredCount: item.registeredCount,
    maxCount: item.capacity,
    imageUrl: toAbsoluteImageUrl(item.coverImageUrl),
  };
}

function mapToEventDetails(item: ApiEventDetails): EventDetails {
  const card = mapToEventCard(item);

  return {
    ...card,
    content: item.content ?? null,
    dateTimeUtc: item.dateTimeUtc,
    coordinator: {
      id: item.coordinatorId ?? "",
      name: item.coordinatorName || item.clubName || "منظم الفعالية",
      imageUrl: toAbsoluteImageUrl(item.coordinatorProfileImageUrl),
    },
    agenda: (item.agenda ?? [])
      .filter((agendaItem) => agendaItem.isVisible)
      .sort((a, b) => a.order - b.order)
      .map((agendaItem) => ({
        id: String(agendaItem.id),
        title: agendaItem.title,
        startTime: agendaItem.startTime,
        order: agendaItem.order,
      })),
  };
}

export async function getEvents(): Promise<EventCardData[]> {
  const { data } = await apiClient.get<{ success: boolean; data: ApiEvent[] }>(
    "/api/EventsPublic",
  );
  if (!data.data || data.data.length === 0) return [];
  return data.data.map(mapToEventCard);
}

export async function getEventDetails(id: string | number): Promise<EventDetails> {
  const eventId = Number(id);

  if (!Number.isFinite(eventId) || eventId <= 0) {
    throw new Error("الفعالية غير صحيحة");
  }

  try {
    const { data } = await apiClient.get<ApiEventDetailsResponse>(
      `/api/EventsPublic/${eventId}`,
    );

    if (!data.data) {
      throw new Error("تعذر تحميل تفاصيل الفعالية");
    }

    return mapToEventDetails(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "تعذر تحميل تفاصيل الفعالية"));
  }
}

export async function registerEvent(input: RegisterEventInput) {
  const eventId = Number(input.eventId);
  const fullName = input.fullName.trim();
  const universityEmail = input.universityEmail.trim();

  if (!Number.isFinite(eventId) || eventId <= 0) {
    throw new Error("الفعالية غير صحيحة");
  }

  if (!fullName) {
    throw new Error("يرجى إدخال الاسم الكامل");
  }

  if (!universityEmail) {
    throw new Error("يرجى إدخال البريد الجامعي");
  }

  if (input.studyYear < 1 || input.studyYear > 4) {
    throw new Error("يرجى اختيار السنة الدراسية");
  }

  try {
    const { data } = await apiClient.post<ApiRegisterEventResponse>(
      `/api/EventsPublic/${eventId}/register`,
      {
        fullName,
        universityEmail,
        studyYear: input.studyYear,
      },
    );

    return data.message ?? "تم التسجيل بنجاح";
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "تعذر التسجيل في الفعالية"));
  }
}
