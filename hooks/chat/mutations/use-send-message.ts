import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sendMessage } from "@/services/chat/chat-api"
import type { SendMessageRequest, ChatConversation, ChatMessage } from "@/types/chat"
import { queryKeys } from "@/lib/query-keys"
import type { User } from "@/services/auth-api"

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

const createOptimisticMessage = (
    conversationId: string,
    text: string,
    currentUserName: string
): ChatMessage => ({
    id: `temp-${Date.now()}`,
    conversationId,
    content: text,
    imageUrl: null,
    senderId: "me",
    senderName: currentUserName,
    senderUsername: "",
    senderAvatarUrl: null,
    createdAt: new Date().toISOString(),
    isRead: true,
    isMine: true,
})

export const useSendMessage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: SendMessageRequest) => sendMessage(payload),

        onMutate: async (variables) => {
            const conversationId = String(variables.conversationId)
            const queryKey = queryKeys.chat.messages(conversationId)

            await queryClient.cancelQueries({ queryKey })
            await queryClient.cancelQueries({ queryKey: queryKeys.chat.conversations })

            const previousMessages =
                queryClient.getQueryData<ChatMessage[]>(queryKey) || []
            const previousConversations =
                queryClient.getQueryData<ChatConversation[]>(queryKeys.chat.conversations) || []
            const currentUser =
                queryClient.getQueryData<User | null>(queryKeys.auth.user) || null

            const optimisticMessage = createOptimisticMessage(
                conversationId,
                variables.text,
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
                        variables.text,
                        optimisticMessage.createdAt
                    )
            )

            return { previousMessages, previousConversations }
        },

        onError: (_error, variables, context) => {
            queryClient.setQueryData(
                queryKeys.chat.messages(String(variables.conversationId)),
                context?.previousMessages || []
            )
            queryClient.setQueryData(
                queryKeys.chat.conversations,
                context?.previousConversations || []
            )
        },

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.chat.messages(String(variables.conversationId)),
            })

            queryClient.invalidateQueries({
                queryKey: queryKeys.chat.conversations,
            })
        },

        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.chat.messages(String(variables.conversationId)),
            })

            queryClient.invalidateQueries({
                queryKey: queryKeys.chat.conversations,
            })
        },
    })
}
