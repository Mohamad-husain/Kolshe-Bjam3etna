import { isAxiosError } from "axios";
import { apiClient, getApiErrorMessage } from "./http-client";

export type CoordinatorEvent = {
  id: number;
  title: string;
  type: string;
  location: string;
  dateTimeUtc: string | null;
  capacity: number;
  description: string;
  content: string;
  agendaJson: string;
  registeredCount: number;
  progressPercent: number;
  coverImageUrl: string | null;
};

export type CoordinatorDashboardSummary = {
  activeEventsCount: number;
  totalRegistrations: number;
  requestsCount: number;
  registrationRatePercent: number;
  averageRating: number;
};

export type CreateEventInput = {
  title: string;
  type: string;
  location: string;
  dateTimeUtc: string;
  capacity: number;
  description: string;
  content: string;
  agendaJson: string;
  coverImage?: {
    uri: string;
    name: string;
    type: string;
  };
};

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function getStringField(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function getNumberField(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function getJsonTextField(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }

    if (Array.isArray(value) || isRecord(value)) {
      return JSON.stringify(value);
    }
  }

  return null;
}

function getArrayField(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return null;
}

function unwrapResponseData(data: unknown) {
  if (isRecord(data) && "data" in data) {
    return data.data;
  }

  return data;
}

export type EventRegistration = {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  major: string;
  studyYear: string | null;
  registeredAtUtc: string;
};

export async function getEventRegistrations(
  eventId: number,
): Promise<EventRegistration[]> {
  try {
    const { data } = await apiClient.get(
      `/api/coordinator/events/${eventId}/registrations`,
    );
    const records = getResponseRecords(data);
    if (!records.length) return [];
    return records.filter(isRecord).map((r) => ({
      userId: getStringField(r, ["userId"]) ?? "",
      fullName: getStringField(r, ["fullName", "name"]) ?? "مستخدم",
      profileImageUrl: getStringField(r, ["profileImageUrl", "imageUrl"]),
      major: getStringField(r, ["major", "specialization"]) ?? "",
      studyYear: getStringField(r, ["studyYear", "year"]),
      registeredAtUtc:
        getStringField(r, ["registeredAtUtc", "registeredAt"]) ?? "",
    }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "تعذر تحميل المسجلين"));
  }
}
function getResponseRecords(data: unknown) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  const responseData = unwrapResponseData(data);

  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (!isRecord(responseData)) {
    return [];
  }

  const records = getArrayField(responseData, ["data", "items"]);
  return Array.isArray(records) ? records : [];
}

function mapCoordinatorDashboard(
  record: ApiRecord,
): CoordinatorDashboardSummary {
  return {
    activeEventsCount:
      getNumberField(record, ["activeEventsCount", "ActiveEventsCount"]) ?? 0,
    totalRegistrations:
      getNumberField(record, ["totalRegistrations", "TotalRegistrations"]) ?? 0,
    requestsCount:
      getNumberField(record, ["requestsCount", "RequestsCount"]) ?? 0,
    registrationRatePercent:
      getNumberField(record, [
        "registrationRatePercent",
        "RegistrationRatePercent",
      ]) ?? 0,
    averageRating:
      getNumberField(record, ["averageRating", "AverageRating"]) ?? 0,
  };
}

function mapCoordinatorEvent(record: ApiRecord): CoordinatorEvent {
  const capacity =
    getNumberField(record, ["capacity", "maxCount", "maxAttendees"]) ?? 0;
  const registeredCount =
    getNumberField(record, [
      "registeredCount",
      "registrationsCount",
      "attendeesCount",
    ]) ?? 0;

  return {
    id: getNumberField(record, ["id", "eventId"]) ?? Date.now(),
    title: getStringField(record, ["title", "name"]) ?? "فعالية بدون عنوان",
    type: getStringField(record, ["type", "eventType"]) ?? "",
    location: getStringField(record, ["location", "place"]) ?? "غير محدد",
    dateTimeUtc:
      getStringField(record, [
        "dateTimeUtc",
        "DateTimeUtc",
        "dateTime",
        "eventDate",
      ]) ?? null,

    capacity,
    registeredCount,
    progressPercent:
      getNumberField(record, ["progressPercent", "occupancyPercent"]) ??
      (capacity > 0 ? Math.round((registeredCount / capacity) * 100) : 0),
    coverImageUrl: getStringField(record, [
      "coverImageUrl",
      "imageUrl",
      "coverUrl",
    ]),
    description: getStringField(record, ["description", "details"]) ?? "",
    content: getStringField(record, ["content", "Content"]) ?? "",
    agendaJson:
      getJsonTextField(record, [
        "agendaJson",
        "AgendaJson",
        "agenda",
        "agendaItems",
      ]) ?? "[]",
  };
}
export async function deleteEvent(eventId: number): Promise<void> {
  try {
    await apiClient.delete(`/api/coordinator/events/${eventId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "تعذر حذف الفعالية"));
  }
}
export type UpdateEventInput = CreateEventInput & { eventId: number };

function normalizeAgendaJson(agendaJson: string) {
  const trimmed = agendaJson.trim();

  if (!trimmed) {
    return "[]";
  }

  try {
    return JSON.stringify(JSON.parse(trimmed));
  } catch {
    return "[]";
  }
}

export async function updateEvent(input: UpdateEventInput): Promise<void> {
  const formData = new FormData();

  formData.append("Title", input.title);
  formData.append("Type", input.type);
  formData.append("Location", input.location);
  formData.append("DateTimeUtc", input.dateTimeUtc);
  formData.append("Capacity", String(input.capacity));
  formData.append("Description", input.description);
  formData.append("Content", input.content.trim() || input.description);
  formData.append("AgendaJson", normalizeAgendaJson(input.agendaJson));

  if (input.coverImage?.uri) {
    let file: any;

    if (input.coverImage.uri.startsWith("blob")) {
      const response = await fetch(input.coverImage.uri);
      const blob = await response.blob();

      file = new File([blob], "cover.jpg", { type: blob.type });
    } else {
      file = {
        uri: input.coverImage.uri,
        name: input.coverImage.name || "cover.jpg",
        type: input.coverImage.type || "image/jpeg",
      };
    }

    formData.append("CoverImage", file);
  }

  await apiClient.put(`/api/coordinator/events/${input.eventId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
export async function getMyEvents(): Promise<CoordinatorEvent[]> {
  try {
    const { data } = await apiClient.get("/api/coordinator/events/mine");
    const records = getResponseRecords(data);

    if (!records.length) {
      return [];
    }

    return records.filter(isRecord).map(mapCoordinatorEvent);
  } catch (error) {
    const baseMessage = getApiErrorMessage(error, "تعذر تحميل الفعاليات");
    const statusSuffix = isAxiosError(error)
      ? error.response?.status
        ? ` [${error.response.status}]`
        : ""
      : "";

    console.error("getMyEvents failed:", error);
    throw new Error(`${baseMessage}${statusSuffix}`);
  }
}

export async function getCoordinatorDashboard(): Promise<CoordinatorDashboardSummary> {
  try {
    const { data } = await apiClient.get("/api/coordinator/events/dashboard");
    const responseData = unwrapResponseData(data);

    if (!isRecord(responseData)) {
      return mapCoordinatorDashboard({});
    }

    return mapCoordinatorDashboard(responseData);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "تعذر تحميل إحصائيات المنسق"));
  }
}

export async function createEvent(input: CreateEventInput): Promise<void> {
  try {
    const formData = new FormData();
    formData.append("Title", input.title);
    formData.append("Type", input.type);
    formData.append("Location", input.location);
    formData.append("DateTimeUtc", input.dateTimeUtc);
    formData.append("Capacity", String(input.capacity));
    formData.append("Content", input.content.trim() || input.description);
    formData.append("AgendaJson", normalizeAgendaJson(input.agendaJson));
    formData.append("Description", input.description);
    if (input.coverImage?.uri) {
      formData.append("CoverImage", {
        uri: input.coverImage.uri,
        name: input.coverImage.name,
        type: input.coverImage.type,
      } as any);
    }
    await apiClient.post("/api/coordinator/events", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "تعذر إنشاء الفعالية"));
  }
}
