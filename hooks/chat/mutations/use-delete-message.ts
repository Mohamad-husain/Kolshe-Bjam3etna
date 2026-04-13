import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { deleteMessage } from "@/services/chat/chat-api"
import {
    cancelChatQueries,
    DELETED_MESSAGE_PREVIEW,
    getChatMutationSnapshot,
    invalidateChatQueries,
    restoreChatMutationSnapshot,
    updateConversationPreview,
} from "@/hooks/chat/mutations/chat-mutation-utils"
import type { ChatMessage } from "@/types/chat"

type DeleteMessageInput = {
    conversationId: string
    messageId: string
}

export const useDeleteMessage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ messageId }: DeleteMessageInput) => deleteMessage(messageId),

        onMutate: async (variables) => {
            const queryKey = queryKeys.chat.messages(variables.conversationId)

            await cancelChatQueries(queryClient, variables.conversationId)
            const snapshot = getChatMutationSnapshot(queryClient, variables.conversationId)
            const lastMessage =
                snapshot.previousMessages[snapshot.previousMessages.length - 1]

            queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) =>
                old.filter((message) => message.id !== variables.messageId)
            )

            if (lastMessage?.id === variables.messageId) {
                queryClient.setQueryData(
                    queryKeys.chat.conversations,
                    (old = []) =>
                        updateConversationPreview(
                            old,
                            variables.conversationId,
                            DELETED_MESSAGE_PREVIEW,
                            lastMessage.createdAt
                        )
                )
            }

            return snapshot
        },

        onError: (_error, variables, context) => {
            restoreChatMutationSnapshot(queryClient, variables.conversationId, context)
        },

        onSettled: (_data, _error, variables) => {
            invalidateChatQueries(queryClient, variables.conversationId)
        },
    })
}
