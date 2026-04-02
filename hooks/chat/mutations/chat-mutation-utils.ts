import type { QueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import type { ChatConversation, ChatMessage, ChatUploadInput } from "@/types/chat"

export const DELETED_MESSAGE_PREVIEW = "تم حذف رسالة"
export const EDITED_MESSAGE_PREVIEW = "تم تعديل رسالة"

const getAttachmentPreviewUri = (attachment?: ChatUploadInput | null) =>
    attachment?.previewUrl?.trim() || attachment?.uri?.trim() || ""

export type ChatMutationSnapshot = {
    previousMessages: ChatMessage[]
    previousConversations: ChatConversation[]
}

export const cancelChatQueries = async (
    queryClient: QueryClient,
    conversationId: string
) => {
    await queryClient.cancelQueries({
        queryKey: queryKeys.chat.messages(conversationId),
    })
    await queryClient.cancelQueries({
        queryKey: queryKeys.chat.conversations,
    })
}

export const getChatMutationSnapshot = (
    queryClient: QueryClient,
    conversationId: string
): ChatMutationSnapshot => ({
    previousMessages:
        queryClient.getQueryData<ChatMessage[]>(queryKeys.chat.messages(conversationId)) || [],
    previousConversations:
        queryClient.getQueryData<ChatConversation[]>(queryKeys.chat.conversations) || [],
})

export const restoreChatMutationSnapshot = (
    queryClient: QueryClient,
    conversationId: string,
    snapshot?: ChatMutationSnapshot
) => {
    queryClient.setQueryData(
        queryKeys.chat.messages(conversationId),
        snapshot?.previousMessages || []
    )
    queryClient.setQueryData(
        queryKeys.chat.conversations,
        snapshot?.previousConversations || []
    )
}

export const invalidateChatQueries = (
    queryClient: QueryClient,
    conversationId: string
) => {
    queryClient.invalidateQueries({
        queryKey: queryKeys.chat.messages(conversationId),
    })
    queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversations,
    })
}

export const getConversationPreviewText = ({
    content,
    imageUrl,
    fileUrl,
    fileName,
}: Pick<ChatMessage, "content" | "imageUrl" | "fileUrl" | "fileName">) => {
    if (content.trim()) {
        return content.trim()
    }

    if (fileUrl || fileName.trim()) {
        return fileName.trim() || "ملف"
    }

    if (imageUrl) {
        return "صورة"
    }

    return "رسالة جديدة"
}

export const updateConversationPreview = (
    conversations: ChatConversation[],
    conversationId: string,
    previewText: string,
    previewTime: string
) => {
    const targetConversation = conversations.find(
        (conversation) => conversation.id === conversationId
    )

    if (!targetConversation) {
        return conversations
    }

    const updatedConversation: ChatConversation = {
        ...targetConversation,
        lastMessageText: previewText,
        lastMessageTime: previewTime,
        unreadCount: 0,
    }

    return [
        updatedConversation,
        ...conversations.filter((conversation) => conversation.id !== conversationId),
    ]
}

export const createOptimisticMessage = ({
    conversationId,
    text,
    image,
    file,
    currentUserName,
}: {
    conversationId: string
    text?: string
    image?: ChatUploadInput | null
    file?: ChatUploadInput | null
    currentUserName: string
}): ChatMessage => ({
    id: `temp-${Date.now()}`,
    conversationId,
    content: text?.trim() || "",
    imageUrl: image ? getAttachmentPreviewUri(image) || null : null,
    fileUrl: file ? getAttachmentPreviewUri(file) || null : null,
    fileName: file?.name?.trim() || "",
    fileMimeType: file?.type?.trim() || "",
    senderId: "me",
    senderName: currentUserName,
    senderAvatarUrl: null,
    createdAt: new Date().toISOString(),
    isRead: true,
    isMine: true,
})
