export const CHAT_AVATAR_COLORS = [
  '#2563EB',
  '#22C55E',
  '#38BDF8',
  '#F59E0B',
  '#A855F7',
  '#F97316',
] as const;

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');
const ISO_UTC_WITHOUT_ZONE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

function parseChatDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const valueWithTimezone = ISO_UTC_WITHOUT_ZONE_PATTERN.test(normalizedValue)
    ? `${normalizedValue}Z`
    : normalizedValue;

  const date = new Date(valueWithTimezone);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function getAvatarColor(seed?: string | null) {
  const value = (seed ?? '').trim();

  if (!value) {
    return CHAT_AVATAR_COLORS[0];
  }

  const index =
    value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % CHAT_AVATAR_COLORS.length;

  return CHAT_AVATAR_COLORS[index];
}

export function getAvatarInitial(name?: string | null) {
  const value = (name ?? '').trim();
  return value[0]?.toUpperCase() ?? 'م';
}

export function getValidImageUri(value?: string | null) {
  const uri = value?.trim();

  if (!uri) {
    return null;
  }

  if (
    uri.startsWith('http://') ||
    uri.startsWith('https://') ||
    uri.startsWith('data:') ||
    uri.startsWith('file:') ||
    uri.startsWith('blob:') ||
    uri.startsWith('content:')
  ) {
    return uri;
  }

  if (!API_BASE_URL) {
    return null;
  }

  if (uri.startsWith('/')) {
    return `${API_BASE_URL}${uri}`;
  }

  return `${API_BASE_URL}/${uri.replace(/^\/+/, '')}`;
}

export function getMessagePreviewText(value?: string | null) {
  const text = value?.trim();

  if (!text) {
    return '';
  }

  if (/^\[(image|photo)\]$/i.test(text)) {
    return 'صورة';
  }

  return text;
}

export function getMessageBodyText(value?: string | null, hasImage?: boolean) {
  const text = value?.trim();

  if (!text) {
    return '';
  }

  if (/^\[(image|photo)\]$/i.test(text)) {
    return hasImage ? '' : 'صورة';
  }

  return text;
}

export function getDisplayImageUri(value?: string | null) {
  return getValidImageUri(value);
}

export function formatConversationTimestamp(value?: string | null) {
  const date = parseChatDate(value);

  if (!date) {
    return '';
  }

  const now = new Date();
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return date.toLocaleTimeString('ar', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return 'أمس';
  }

  const diffMs = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return date.toLocaleDateString('ar', { weekday: 'short' });
  }

  return date.toLocaleDateString('ar', {
    month: 'numeric',
    day: 'numeric',
  });
}

export function formatMessageTime(value?: string | null) {
  const date = parseChatDate(value);

  if (!date) {
    return '';
  }

  return date.toLocaleTimeString('ar', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatChatDateLabel(value?: string | null) {
  const date = parseChatDate(value);

  if (!date) {
    return '';
  }

  const now = new Date();
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return 'اليوم';
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return 'أمس';
  }

  const isSameYear = date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString('ar', {
    day: 'numeric',
    month: 'long',
    ...(isSameYear ? {} : { year: 'numeric' as const }),
  });
}
