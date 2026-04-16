import axios, { isAxiosError } from 'axios';

import { getAuthToken } from '@/services/auth-api';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function parseResponsePayload(payload: unknown) {
  if (!payload) {
    return null;
  }

  if (typeof payload !== 'string') {
    return payload;
  }

  try {
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return { message: payload } as Record<string, unknown>;
  }
}

function extractValidationMessage(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if ('errors' in payload) {
    const errors = (payload as { errors?: unknown }).errors;

    if (errors && typeof errors === 'object') {
      for (const value of Object.values(errors as Record<string, unknown>)) {
        if (typeof value === 'string' && value.trim().length > 0) {
          return value.trim();
        }

        if (Array.isArray(value)) {
          const firstMessage = value.find(
            (entry): entry is string => typeof entry === 'string' && entry.trim().length > 0,
          );

          if (firstMessage) {
            return firstMessage.trim();
          }
        }
      }
    }
  }

  if ('detail' in payload) {
    const detail = (payload as { detail?: unknown }).detail;

    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail.trim();
    }
  }

  return null;
}

function extractMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  const validationMessage = extractValidationMessage(payload);

  if (validationMessage) {
    return validationMessage;
  }

  return fallback;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    if (error.response) {
      const payload = parseResponsePayload(error.response.data);
      return extractMessage(payload, fallback);
    }

    const details = error.message ? ` (${error.message})` : '';
    return `تعذر الاتصال بالخادم. تأكد من الإنترنت وحاول مرة أخرى.${details}`;
  }

  const details = error instanceof Error ? ` (${error.message})` : '';
  return `${fallback}${details}`;
}
