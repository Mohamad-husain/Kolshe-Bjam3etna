import axios from "axios";
import { getAuthToken } from "./auth-service";

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "")
  .trim()
  .replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
