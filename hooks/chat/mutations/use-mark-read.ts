import { useMutation, useQueryClient } from "@tanstack/react-query"
import { markAsRead } from "@/services/chat/chat-api"
import { queryKeys } from "@/lib/query-keys"
import {
    cancelChatQueries,
    getChatMutationSnapshot,
    invalidateChatQueries,
    restoreChatMutationSnapshot,
} from "@/hooks/chat/mutations/chat-mutation-utils"
import type { ChatConversation, ChatMessage } from "@/types/chat"

export const useMarkRead = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (conversationId: string) => markAsRead(conversationId),
        onMutate: async (conversationId) => {
            await cancelChatQueries(queryClient, conversationId)
            const snapshot = getChatMutationSnapshot(queryClient, conversationId)

            queryClient.setQueryData<ChatConversation[]>(
                queryKeys.chat.conversations,
                (old = []) =>
                    old.map((conversation) =>
                        conversation.id === conversationId
                            ? { ...conversation, unreadCount: 0 }
                            : conversation
                    )
            )

            queryClient.setQueryData<ChatMessage[]>(
                queryKeys.chat.messages(conversationId),
                (old = []) => old.map((message) => ({ ...message, isRead: true }))
            )

            return snapshot
        },
        onError: (_error, conversationId, context) => {
            restoreChatMutationSnapshot(queryClient, conversationId, context)
        },
        onSuccess: (_, conversationId) => {
            invalidateChatQueries(queryClient, conversationId)
        },
    })
}
