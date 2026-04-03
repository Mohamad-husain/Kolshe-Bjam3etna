import {
    formatChatDateLabel,
    getDisplayImageUri,
    getDisplayFileUri,
    getFileLabel,
} from "@/components/chat/chat-ui"
import type { ChatMessage } from "@/types/chat"

type OwnershipInput = {
    message: ChatMessage
    otherUserId?: string
    headerTitle: string
    currentUserName: string
    otherUserAvatarUrl: string | null
}

export const resolveMessageOwnership = ({
    message,
    otherUserId,
    headerTitle,
    currentUserName,
    otherUserAvatarUrl,
}: OwnershipInput): ChatMessage => {
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

export const getChatDateLabel = (messages: ChatMessage[]) => {
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

const isOwnMessage = (message: ChatMessage) => message.isMine

export const hasImageAttachment = (message: ChatMessage) =>
    !!getDisplayImageUri(message.imageUrl)

export const hasFileAttachment = (message: ChatMessage) =>
    !!getDisplayFileUri(message.fileUrl) || !!message.fileName.trim()

export const getMessageActionsState = (message: ChatMessage) => {
    const canEdit = isOwnMessage(message)
    const canDelete = isOwnMessage(message)
    const canDownloadImage = hasImageAttachment(message)
    const canDownloadFile = hasFileAttachment(message)

    return {
        canEdit,
        canDelete,
        canDownloadImage,
        canDownloadFile,
        hasAny: canEdit || canDelete || canDownloadImage || canDownloadFile,
    }
}

export const hasMessageActions = (message: ChatMessage) =>
    getMessageActionsState(message).hasAny

export const getMessageActionSubtitle = (message: ChatMessage) => {
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
