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

function extractMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
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
