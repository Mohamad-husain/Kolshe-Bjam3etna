import axios, { isAxiosError } from 'axios';

import { getAuthToken, invalidateAuthSession } from '@/lib/auth/auth-session';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');
const NETWORK_ERROR = 'تعذر الاتصال بالخادم. تأكد من الإنترنت وحاول مرة أخرى.';
const PUBLIC_AUTH_PATHS = [
  '/api/Account/login',
  '/api/Account/register',
  '/api/Account/forgot-password',
  '/api/Account/verify-reset-code',
  '/api/Account/reset-password',
];

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    removeContentTypeHeader(config.headers);
  }

  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = isAxiosError(error) ? String(error.config?.url ?? '') : '';
    const isUnauthorized = isAxiosError(error) && error.response?.status === 401;

    if (isUnauthorized && !PUBLIC_AUTH_PATHS.some((path) => url.includes(path))) {
      await invalidateAuthSession();
    }

    return Promise.reject(error);
  },
);

function removeContentTypeHeader(headers: unknown) {
  const headerBag = headers as
    | (Record<string, unknown> & { delete?: (name: string) => void })
    | undefined;

  if (typeof headerBag?.delete === 'function') {
    headerBag.delete('Content-Type');
    return;
  }

  delete headerBag?.['Content-Type'];
}

function cleanString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function parsePayload(payload: unknown) {
  if (typeof payload !== 'string') {
    return payload;
  }

  try {
    return JSON.parse(payload) as unknown;
  } catch {
    return { message: payload };
  }
}

function getFirstValidationError(errors: unknown) {
  if (!errors || typeof errors !== 'object') {
    return null;
  }

  for (const value of Object.values(errors as Record<string, unknown>)) {
    const message = cleanString(value);

    if (message) {
      return message;
    }

    if (Array.isArray(value)) {
      const firstMessage = value
        .map(cleanString)
        .find((entry): entry is string => Boolean(entry));

      if (firstMessage) {
        return firstMessage;
      }
    }
  }

  return null;
}

function getPayloadMessage(payload: unknown) {
  const parsedPayload = parsePayload(payload);

  if (!parsedPayload || typeof parsedPayload !== 'object') {
    return null;
  }

  const data = parsedPayload as Record<string, unknown>;

  return (
    cleanString(data.message) ??
    getFirstValidationError(data.errors) ??
    cleanString(data.detail)
  );
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) {
    return error instanceof Error ? `${fallback} (${error.message})` : fallback;
  }

  if (!error.response) {
    const details = error.message ? ` (${error.message})` : '';
    return `${NETWORK_ERROR}${details}`;
  }

  return getPayloadMessage(error.response.data) ?? `${fallback} (HTTP ${error.response.status})`;
}
