export function toAbsoluteImageUrl(path: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const baseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "")
    .trim()
    .replace(/\/$/, "");

  if (!baseUrl) return path;

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
