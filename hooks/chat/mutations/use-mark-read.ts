import { useMutation, useQueryClient } from "@tanstack/react-query"
import { markAsRead } from "@/services/chat/chat-api"
import type { ChatConversation, ChatMessage } from "@/types/chat"
import { queryKeys } from "@/lib/query-keys"

export const useMarkRead = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (conversationId: string) => markAsRead(conversationId),
        onMutate: async (conversationId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.chat.conversations })
            await queryClient.cancelQueries({
                queryKey: queryKeys.chat.messages(conversationId),
            })

            const previousConversations =
                queryClient.getQueryData<ChatConversation[]>(queryKeys.chat.conversations) || []
            const previousMessages =
                queryClient.getQueryData<ChatMessage[]>(
                    queryKeys.chat.messages(conversationId)
                ) || []

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

            return { previousConversations, previousMessages }
        },
        onError: (_error, conversationId, context) => {
            queryClient.setQueryData(
                queryKeys.chat.conversations,
                context?.previousConversations || []
            )
            queryClient.setQueryData(
                queryKeys.chat.messages(conversationId),
                context?.previousMessages || []
            )
        },
        onSuccess: (_, conversationId) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.chat.conversations,
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.chat.messages(conversationId),
            })
        },
    })
}
