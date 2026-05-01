import type { QueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
    deletePersistentStorageItem,
    getPersistentStorageItem,
    setPersistentStorageItem,
} from "@/lib/storage/persistent-storage"
import { getAuthToken } from "@/services/http-client"
import {
    decodeJwtPayload,
    getJwtStringClaim,
    jwtClaimKeys,
} from "@/lib/auth/jwt"
import { createDeletedMessage } from "@/hooks/chat/mutations/chat-mutation-utils"
import type { ChatMessage } from "@/types/chat"

const MAX_PERSISTED_DELETED_MESSAGES = 100

const getDeletedMessageStorageKey = (conversationId: string) => {
    const payload = decodeJwtPayload(getAuthToken())
    const currentUserId =
        getJwtStringClaim(payload, jwtClaimKeys.nameIdentifier) || "anonymous"

    return `chat.deleted-messages.${currentUserId}.${conversationId}`
}

const normalizeStoredDeletedMessage = (value: unknown): ChatMessage | null => {
    if (!value || typeof value !== "object") {
        return null
    }

    const candidate = value as Partial<ChatMessage>

    if (
        typeof candidate.id !== "string" ||
        typeof candidate.conversationId !== "string" ||
        typeof candidate.content !== "string" ||
        typeof candidate.fileName !== "string" ||
        typeof candidate.fileMimeType !== "string" ||
        typeof candidate.senderId !== "string" ||
        typeof candidate.senderName !== "string" ||
        typeof candidate.createdAt !== "string" ||
        typeof candidate.isRead !== "boolean" ||
        typeof candidate.isMine !== "boolean"
    ) {
        return null
    }

    return createDeletedMessage({
        id: candidate.id,
        conversationId: candidate.conversationId,
        content: candidate.content,
        imageUrl:
            typeof candidate.imageUrl === "string" ? candidate.imageUrl : null,
        fileUrl: typeof candidate.fileUrl === "string" ? candidate.fileUrl : null,
        fileName: candidate.fileName,
        fileMimeType: candidate.fileMimeType,
        senderId: candidate.senderId,
        senderName: candidate.senderName,
        senderAvatarUrl:
            typeof candidate.senderAvatarUrl === "string"
                ? candidate.senderAvatarUrl
                : null,
        createdAt: candidate.createdAt,
        isRead: candidate.isRead,
        isMine: candidate.isMine,
    })
}

const parseStoredDeletedMessages = (value: unknown) => {
    if (!Array.isArray(value)) {
        return []
    }

    return value
        .map(normalizeStoredDeletedMessage)
        .filter((message): message is ChatMessage => message !== null)
}

export const getDeletedMessageCache = (
    queryClient: QueryClient,
    conversationId: string
) =>
    queryClient.getQueryData<ChatMessage[]>(
        queryKeys.chat.deletedMessages(conversationId)
    ) || []

export const loadDeletedMessageCache = async (conversationId: string) => {
    try {
        const storedValue = await getPersistentStorageItem(
            getDeletedMessageStorageKey(conversationId)
        )

        if (!storedValue) {
            return []
        }

        return parseStoredDeletedMessages(JSON.parse(storedValue))
    } catch {
        await deletePersistentStorageItem(getDeletedMessageStorageKey(conversationId))
        return []
    }
}

export const persistDeletedMessageCache = async (
    conversationId: string,
    deletedMessages: ChatMessage[]
) => {
    const nextDeletedMessages = deletedMessages
        .slice(-MAX_PERSISTED_DELETED_MESSAGES)
        .map((message) => createDeletedMessage(message))

    if (!nextDeletedMessages.length) {
        await deletePersistentStorageItem(getDeletedMessageStorageKey(conversationId))
        return
    }

    await setPersistentStorageItem(
        getDeletedMessageStorageKey(conversationId),
        JSON.stringify(nextDeletedMessages)
    )
}

export const upsertDeletedMessageCache = (
    queryClient: QueryClient,
    conversationId: string,
    message: ChatMessage
) => {
    const deletedMessage = createDeletedMessage(message)
    let nextDeletedMessages: ChatMessage[] = []

    queryClient.setQueryData<ChatMessage[]>(
        queryKeys.chat.deletedMessages(conversationId),
        (old = []) => {
            nextDeletedMessages = [
                ...old.filter((cachedMessage) => cachedMessage.id !== deletedMessage.id),
                deletedMessage,
            ]

            return nextDeletedMessages
        }
    )

    return {
        deletedMessage,
        deletedMessages: nextDeletedMessages,
    }
}

export const restoreDeletedMessageCache = (
    queryClient: QueryClient,
    conversationId: string,
    deletedMessages: ChatMessage[]
) => {
    queryClient.setQueryData(
        queryKeys.chat.deletedMessages(conversationId),
        deletedMessages
    )
}
