import { Linking, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import {
  DELETED_MESSAGE_PREVIEW,
  EDITED_MESSAGE_PREVIEW,
  isDeletedMessageContent,
} from '@/hooks/chat/mutations/chat-mutation-utils';

const CHAT_AVATAR_COLORS = [
  '#2563EB',
  '#22C55E',
  '#38BDF8',
  '#F59E0B',
  '#A855F7',
  '#F97316',
] as const;

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');
const ISO_UTC_WITHOUT_ZONE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
const IMAGE_FILE_PATTERN = /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)(\?.*)?$/i;

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

function isSameCalendarDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getDate() === secondDate.getDate() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getFullYear() === secondDate.getFullYear()
  );
}

function isYesterdayDate(date: Date, currentDate: Date) {
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);

  return isSameCalendarDay(date, yesterday);
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

  if (isDeletedMessageContent(text)) {
    return DELETED_MESSAGE_PREVIEW;
  }

  if (/^\[(edited|updated)\]$/i.test(text) || /^edited$/i.test(text)) {
    return EDITED_MESSAGE_PREVIEW;
  }

  if (/^\[(image|photo)\]$/i.test(text)) {
    return 'صورة';
  }

  if (/^\[(file|document|attachment)\]$/i.test(text)) {
    return 'ملف';
  }

  return text;
}

export function getMessageBodyText(value?: string | null, hasAttachment?: boolean) {
  const text = value?.trim();

  if (!text) {
    return '';
  }

  if (isDeletedMessageContent(text)) {
    return DELETED_MESSAGE_PREVIEW;
  }

  if (/^\[(image|photo)\]$/i.test(text)) {
    return hasAttachment ? '' : 'صورة';
  }

  if (/^\[(file|document|attachment)\]$/i.test(text)) {
    return hasAttachment ? '' : 'ملف';
  }

  return text;
}

export function getDisplayImageUri(value?: string | null) {
  return getValidImageUri(value);
}

export function getDisplayFileUri(value?: string | null) {
  return getValidImageUri(value);
}

export async function openChatAsset(uri?: string | null) {
  const assetUri = getValidImageUri(uri);

  if (!assetUri) {
    return false;
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.open(assetUri, '_blank', 'noopener,noreferrer');
    return true;
  }

  try {
    await WebBrowser.openBrowserAsync(assetUri);
    return true;
  } catch {
    await Linking.openURL(assetUri);
    return true;
  }
}

export function getFileLabel(fileName?: string | null, fileUrl?: string | null) {
  const directName = fileName?.trim();

  if (directName) {
    return directName;
  }

  const filePath = fileUrl?.trim().split('?')[0] || '';
  const segments = filePath.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  return lastSegment || 'ملف';
}

function isImageAsset(uri?: string | null, suggestedName?: string | null) {
  const candidate = `${suggestedName?.trim() || ''} ${uri?.trim() || ''}`;
  return IMAGE_FILE_PATTERN.test(candidate);
}

function getDownloadExtension(uri?: string | null, suggestedName?: string | null) {
  const source = getFileLabel(suggestedName, uri);
  const match = source.match(/\.[a-z0-9]+$/i);
  return match?.[0] || '.jpg';
}

function getDownloadFileName(uri?: string | null, suggestedName?: string | null) {
  return (suggestedName?.trim() || getFileLabel(suggestedName, uri)).replace(
    /[<>:"/\\|?*\x00-\x1F]/g,
    '_'
  );
}

async function saveFileToAndroidDownloads(
  tempFileUri: string,
  fileName: string,
  mimeType?: string | null
) {
  const downloadsUri = FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Download');
  const permission =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(downloadsUri);

  if (!permission.granted) {
    return false;
  }

  const targetUri = await FileSystem.StorageAccessFramework.createFileAsync(
    permission.directoryUri,
    fileName,
    mimeType?.trim() || 'application/octet-stream'
  );

  const fileBase64 = await FileSystem.readAsStringAsync(tempFileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await FileSystem.StorageAccessFramework.writeAsStringAsync(targetUri, fileBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return true;
}

export async function downloadChatAsset(
  uri?: string | null,
  suggestedName?: string | null,
  mimeType?: string | null
) {
  const downloadUri = getValidImageUri(uri);

  if (!downloadUri) {
    return false;
  }

  const safeName = getDownloadFileName(uri, suggestedName);

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const link = document.createElement('a');
    link.href = downloadUri;
    link.download = safeName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }

  if (isImageAsset(downloadUri, suggestedName)) {
    const permission = await MediaLibrary.requestPermissionsAsync();

    if (!permission.granted) {
      return false;
    }

    const baseDirectory = FileSystem.cacheDirectory || FileSystem.documentDirectory;

    if (!baseDirectory) {
      return false;
    }

    const fileUri = `${baseDirectory}chat-download-${Date.now()}${getDownloadExtension(
      downloadUri,
      suggestedName
    )}`;

    const result = await FileSystem.downloadAsync(downloadUri, fileUri);
    await MediaLibrary.createAssetAsync(result.uri);
    return true;
  }

  const baseDirectory = FileSystem.documentDirectory || FileSystem.cacheDirectory;

  if (!baseDirectory) {
    return false;
  }

  const result = await FileSystem.downloadAsync(downloadUri, `${baseDirectory}${safeName}`);

  if (Platform.OS === 'android') {
    const saved = await saveFileToAndroidDownloads(result.uri, safeName, mimeType);

    if (saved) {
      return true;
    }
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, {
      dialogTitle: 'حفظ الملف',
    });
    return true;
  }

  await Linking.openURL(result.uri);
  return true;
}

export function formatConversationTimestamp(value?: string | null) {
  const date = parseChatDate(value);

  if (!date) {
    return '';
  }

  const now = new Date();

  if (isSameCalendarDay(date, now)) {
    return date.toLocaleTimeString('ar', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  if (isYesterdayDate(date, now)) {
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

  if (isSameCalendarDay(date, now)) {
    return 'اليوم';
  }

  if (isYesterdayDate(date, now)) {
    return 'أمس';
  }

  const isSameYear = date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString('ar', {
    day: 'numeric',
    month: 'long',
    ...(isSameYear ? {} : { year: 'numeric' as const }),
  });
}
