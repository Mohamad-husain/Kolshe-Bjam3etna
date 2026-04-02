import axios, { isAxiosError } from 'axios';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');
let authToken: string | null = null;
const AUTH_TOKEN_STORAGE_KEY = 'kolshe.auth.token';

function readStoredToken() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      return;
    }

    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage issues and keep in-memory auth working.
  }
}

authToken = readStoredToken();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

export function getAuthToken() {
  return authToken;
}

export function setAuthToken(token: string | null) {
  authToken = token;
  writeStoredToken(token);
}

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
