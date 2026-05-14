import { Linking } from "react-native"
import * as WebBrowser from "expo-web-browser"

import {
    DELETED_MESSAGE_PREVIEW,
    EDITED_MESSAGE_PREVIEW,
    isDeletedMessageContent,
} from "@/hooks/chat/mutations/chat-mutation-utils"
import { getValidChatAssetUri } from "@/components/chat/chat-ui"
import type { ChatMessage } from "@/types/chat"

const ISO_UTC_WITHOUT_ZONE_PATTERN =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/
const IMAGE_FILE_PATTERN =
    /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)(\?.*)?$/i

export type ChatMessageOwnershipInput = {
    message: ChatMessage
    otherUserId?: string
    headerTitle: string
    currentUserName: string
    otherUserAvatarUrl: string | null
}

export function parseChatDate(value?: string | null) {
    if (!value) {
        return null
    }

    const normalizedValue = value.trim()

    if (!normalizedValue) {
        return null
    }

    const valueWithTimezone = ISO_UTC_WITHOUT_ZONE_PATTERN.test(normalizedValue)
        ? `${normalizedValue}Z`
        : normalizedValue
    const date = new Date(valueWithTimezone)

    if (Number.isNaN(date.getTime())) {
        return null
    }

    return date
}

export function isSameCalendarDay(firstDate: Date, secondDate: Date) {
    return (
        firstDate.getDate() === secondDate.getDate() &&
        firstDate.getMonth() === secondDate.getMonth() &&
        firstDate.getFullYear() === secondDate.getFullYear()
    )
}

export function isYesterdayDate(date: Date, currentDate: Date) {
    const yesterday = new Date(currentDate)
    yesterday.setDate(currentDate.getDate() - 1)

    return isSameCalendarDay(date, yesterday)
}

export { getValidChatAssetUri }

export function getDisplayImageUri(value?: string | null) {
    return getValidChatAssetUri(value)
}

export function getDisplayFileUri(value?: string | null) {
    return getValidChatAssetUri(value)
}

export async function openChatAsset(uri?: string | null) {
    const assetUri = getValidChatAssetUri(uri)

    if (!assetUri) {
        return false
    }

    if (typeof window !== "undefined" && typeof document !== "undefined") {
        window.open(assetUri, "_blank", "noopener,noreferrer")
        return true
    }

    try {
        await WebBrowser.openBrowserAsync(assetUri)
        return true
    } catch {
        await Linking.openURL(assetUri)
        return true
    }
}

export function getFileLabel(fileName?: string | null, fileUrl?: string | null) {
    const directName = fileName?.trim()

    if (directName) {
        return directName
    }

    const filePath = fileUrl?.trim().split("?")[0] || ""
    const segments = filePath.split("/").filter(Boolean)
    const lastSegment = segments[segments.length - 1]

    return lastSegment || "ملف"
}

export function isImageChatAsset(uri?: string | null, suggestedName?: string | null) {
    const candidate = `${suggestedName?.trim() || ""} ${uri?.trim() || ""}`
    return IMAGE_FILE_PATTERN.test(candidate)
}

export function getChatDownloadExtension(
    uri?: string | null,
    suggestedName?: string | null
) {
    const source = getFileLabel(suggestedName, uri)
    const match = source.match(/\.[a-z0-9]+$/i)
    return match?.[0] || ".jpg"
}

export function getChatDownloadFileName(
    uri?: string | null,
    suggestedName?: string | null
) {
    return (suggestedName?.trim() || getFileLabel(suggestedName, uri)).replace(
        /[<>:"/\\|?*\x00-\x1F]/g,
        "_"
    )
}

export function formatChatDateLabel(value?: string | null) {
    const date = parseChatDate(value)

    if (!date) {
        return ""
    }

    const now = new Date()

    if (isSameCalendarDay(date, now)) {
        return "اليوم"
    }

    if (isYesterdayDate(date, now)) {
        return "أمس"
    }

    const isSameYear = date.getFullYear() === now.getFullYear()

    return date.toLocaleDateString("ar", {
        day: "numeric",
        month: "long",
        ...(isSameYear ? {} : { year: "numeric" as const }),
    })
}

export function formatConversationTimestamp(value?: string | null) {
    const date = parseChatDate(value)

    if (!date) {
        return ""
    }

    const now = new Date()

    if (isSameCalendarDay(date, now)) {
        return date.toLocaleTimeString("ar", {
            hour: "numeric",
            minute: "2-digit",
        })
    }

    if (isYesterdayDate(date, now)) {
        return "أمس"
    }

    const diffMs = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 7) {
        return date.toLocaleDateString("ar", { weekday: "short" })
    }

    return date.toLocaleDateString("ar", {
        month: "numeric",
        day: "numeric",
    })
}

export function formatMessageTime(value?: string | null) {
    const date = parseChatDate(value)

    if (!date) {
        return ""
    }

    return date.toLocaleTimeString("ar", {
        hour: "numeric",
        minute: "2-digit",
    })
}

export function getMessagePreviewText(value?: string | null) {
    const text = value?.trim()

    if (!text) {
        return ""
    }

    if (isDeletedMessageContent(text)) {
        return DELETED_MESSAGE_PREVIEW
    }

    if (/^\[(edited|updated)\]$/i.test(text) || /^edited$/i.test(text)) {
        return EDITED_MESSAGE_PREVIEW
    }

    if (/^\[(image|photo)\]$/i.test(text)) {
        return "صورة"
    }

    if (/^\[(file|document|attachment)\]$/i.test(text)) {
        return "ملف"
    }

    return text
}

export function getMessageBodyText(value?: string | null, hasAttachment?: boolean) {
    const text = value?.trim()

    if (!text) {
        return ""
    }

    if (isDeletedMessageContent(text)) {
        return DELETED_MESSAGE_PREVIEW
    }

    if (/^\[(image|photo)\]$/i.test(text)) {
        return hasAttachment ? "" : "صورة"
    }

    if (/^\[(file|document|attachment)\]$/i.test(text)) {
        return hasAttachment ? "" : "ملف"
    }

    return text
}

export function resolveMessageOwnership({
    message,
    otherUserId,
    headerTitle,
    currentUserName,
    otherUserAvatarUrl,
}: ChatMessageOwnershipInput): ChatMessage {
    const isMine =
        otherUserId && message.senderId
            ? message.senderId.trim() !== otherUserId
            : message.isMine

    return {
        ...message,
        isMine,
        senderName: isMine ? currentUserName : headerTitle,
        senderAvatarUrl: isMine
            ? null
            : message.senderAvatarUrl || otherUserAvatarUrl,
    }
}

export function getChatDateLabel(messages: ChatMessage[]) {
    const candidateDates = [
        messages[0]?.createdAt,
        messages[messages.length - 1]?.createdAt,
    ]

    for (const value of candidateDates) {
        const label = formatChatDateLabel(value)

        if (label) {
            return label
        }
    }

    return ""
}

export const isOwnMessage = (message: ChatMessage) => message.isMine

export const hasImageAttachment = (message: ChatMessage) =>
    !!getDisplayImageUri(message.imageUrl)

export const hasFileAttachment = (message: ChatMessage) =>
    !!getDisplayFileUri(message.fileUrl) || !!message.fileName.trim()

export function getMessageActionsState(message: ChatMessage) {
    const isDeleted = isDeletedMessageContent(message.content)
    const canEdit = isOwnMessage(message) && !isDeleted
    const canDelete = isOwnMessage(message) && !isDeleted
    const canDownloadImage = !isDeleted && hasImageAttachment(message)
    const canDownloadFile = !isDeleted && hasFileAttachment(message)

    return {
        canEdit,
        canDelete,
        canDownloadImage,
        canDownloadFile,
        hasAny: canEdit || canDelete || canDownloadImage || canDownloadFile,
    }
}

export function getMessageActionSubtitle(message: ChatMessage) {
    if (isDeletedMessageContent(message.content)) {
        return DELETED_MESSAGE_PREVIEW
    }

    if (message.content.trim()) {
        return message.content.trim()
    }

    if (hasImageAttachment(message)) {
        return "رسالة تحتوي على صورة"
    }

    if (hasFileAttachment(message)) {
        return getFileLabel(message.fileName, message.fileUrl)
    }

    return "اختر الإجراء المناسب لهذه الرسالة"
}
