import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { sendImage } from "@/services/chat/chat-api"
import type { ChatConversation, ChatMessage, SendImageRequest } from "@/types/chat"
import type { User } from "@/services/auth-api"

const getStringValue = (...values: unknown[]) => {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) {
            return value.trim()
        }
    }

    return ""
}

const getIdentifierValue = (...values: unknown[]) => {
    for (const value of values) {
        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value)
        }

        if (typeof value === "string" && value.trim()) {
            return value.trim()
        }
    }

    return ""
}

const getResponsePayload = (value: unknown) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, unknown>
    }

    return null
}

const getConversationPreviewText = (value: string) => value || "صورة"

const updateConversationPreview = (
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

const createOptimisticImageMessage = (
    conversationId: string,
    caption: string,
    imageUrl: string,
    currentUserName: string
): ChatMessage => ({
    id: `temp-image-${Date.now()}`,
    conversationId,
    content: caption,
    imageUrl,
    senderId: "me",
    senderName: currentUserName,
    senderUsername: "",
    senderAvatarUrl: null,
    createdAt: new Date().toISOString(),
    isRead: true,
    isMine: true,
})

export const useSendImage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: SendImageRequest) => sendImage(payload),

        onMutate: async (variables) => {
            const conversationId = String(variables.conversationId)
            const queryKey = queryKeys.chat.messages(conversationId)
            const currentUser =
                queryClient.getQueryData<User | null>(queryKeys.auth.user) || null
            const caption = variables.caption?.trim() || ""
            const previewImageUrl =
                variables.image.previewUrl || variables.image.uri || ""

            await queryClient.cancelQueries({ queryKey })
            await queryClient.cancelQueries({ queryKey: queryKeys.chat.conversations })

            const previousMessages =
                queryClient.getQueryData<ChatMessage[]>(queryKey) || []
            const previousConversations =
                queryClient.getQueryData<ChatConversation[]>(queryKeys.chat.conversations) || []
            const optimisticMessage = createOptimisticImageMessage(
                conversationId,
                caption,
                previewImageUrl,
                currentUser?.name?.trim() || ""
            )

            queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) => [
                ...old,
                optimisticMessage,
            ])
            queryClient.setQueryData<ChatConversation[]>(
                queryKeys.chat.conversations,
                (old = []) =>
                    updateConversationPreview(
                        old,
                        conversationId,
                        getConversationPreviewText(caption),
                        optimisticMessage.createdAt
                    )
            )

            return {
                conversationId,
                optimisticMessage,
                previousMessages,
                previousConversations,
            }
        },

        onError: (_error, _variables, context) => {
            queryClient.setQueryData(
                queryKeys.chat.messages(context?.conversationId || ""),
                context?.previousMessages || []
            )
            queryClient.setQueryData(
                queryKeys.chat.conversations,
                context?.previousConversations || []
            )
        },

        onSuccess: (data, _variables, context) => {
            const responsePayload = getResponsePayload(data)
            const resolvedMessageId = getIdentifierValue(responsePayload?.id)
            const resolvedContent = getStringValue(responsePayload?.text)
            const resolvedImageUrl = getStringValue(responsePayload?.imageUrl)
            const resolvedCreatedAt = getStringValue(responsePayload?.sentAtUtc)
            const conversationId = context?.conversationId || ""

            queryClient.setQueryData<ChatMessage[]>(
                queryKeys.chat.messages(conversationId),
                (old = []) =>
                    old.map((message) =>
                        message.id === context?.optimisticMessage.id
                            ? {
                                ...message,
                                id: resolvedMessageId || message.id,
                                content: resolvedContent,
                                imageUrl: resolvedImageUrl || message.imageUrl,
                                createdAt: resolvedCreatedAt || message.createdAt,
                            }
                            : message
                    )
            )
            queryClient.setQueryData<ChatConversation[]>(
                queryKeys.chat.conversations,
                (old = []) =>
                    updateConversationPreview(
                        old,
                        conversationId,
                        getConversationPreviewText(resolvedContent),
                        resolvedCreatedAt || context?.optimisticMessage.createdAt || ""
                    )
            )
        },

        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.chat.messages(String(variables.conversationId)),
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.chat.conversations,
            })
        },
    })
}
