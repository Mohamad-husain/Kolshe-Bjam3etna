import { getApiErrorMessage } from '@/services/http-client';

export type ApiRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is ApiRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function extractData(payload: unknown) {
  if (isRecord(payload) && 'data' in payload) {
    return payload.data;
  }

  return payload;
}

export function getRecords(payload: unknown) {
  const data = extractData(payload);

  if (Array.isArray(data)) {
    return data.filter(isRecord);
  }

  if (isRecord(data) && Array.isArray(data.items)) {
    return data.items.filter(isRecord);
  }

  return [];
}

export function getRecord(payload: unknown) {
  const data = extractData(payload);
  return isRecord(data) ? data : null;
}

export function getStringField(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

export function getNumberField(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

export function getBooleanField(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();

      if (normalized === 'true') {
        return true;
      }

      if (normalized === 'false') {
        return false;
      }
    }
  }

  return null;
}

export function getNestedRecord(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (isRecord(value)) {
      return value;
    }
  }

  return null;
}

export function getDateField(record: ApiRecord, keys: string[]) {
  return getStringField(record, keys) ?? '';
}

export function toAbsoluteImageUrl(path: string | null) {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');

  if (!baseUrl) {
    return path;
  }

  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getAdminErrorMessage(error: unknown, fallbackMessage: string) {
  return getApiErrorMessage(error, fallbackMessage);
}

export function throwAdminError(error: unknown, fallbackMessage: string): never {
  throw new Error(getAdminErrorMessage(error, fallbackMessage));
}

export function appendFileToFormData(
  formData: FormData,
  fieldName: string,
  fileInput:
    | {
        uri: string;
        name?: string | null;
        type?: string | null;
        file?: File;
      }
    | null
    | undefined,
) {
  if (!fileInput?.uri && !fileInput?.file) {
    return;
  }

  if (fileInput.file) {
    formData.append(fieldName, fileInput.file);
    return;
  }

  formData.append(
    fieldName,
    {
      uri: fileInput.uri,
      name: fileInput.name ?? `${fieldName}-${Date.now()}.jpg`,
      type: fileInput.type ?? 'image/jpeg',
    } as never,
  );
}
