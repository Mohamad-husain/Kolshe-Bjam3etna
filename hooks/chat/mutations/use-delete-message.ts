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
import {
    getDeletedMessageCache,
    persistDeletedMessageCache,
    restoreDeletedMessageCache,
    upsertDeletedMessageCache,
} from "@/hooks/chat/mutations/deleted-message-cache"
import type { ChatConversation, ChatMessage } from "@/types/chat"

type DeleteMessageInput = {
    conversationId: string
    messageId: string
}

type MutationContext = ReturnType<typeof getChatMutationSnapshot> & {
    previousDeletedMessages: ChatMessage[]
}

export const useDeleteMessage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ messageId }: DeleteMessageInput) => deleteMessage(messageId),

        onMutate: async (variables): Promise<MutationContext> => {
            const queryKey = queryKeys.chat.messages(variables.conversationId)

            await cancelChatQueries(queryClient, variables.conversationId)
            const snapshot = getChatMutationSnapshot(queryClient, variables.conversationId)
            const previousDeletedMessages = getDeletedMessageCache(
                queryClient,
                variables.conversationId
            )
            const lastMessage =
                snapshot.previousMessages[snapshot.previousMessages.length - 1]
            const targetMessage = snapshot.previousMessages.find(
                (message) => message.id === variables.messageId
            )

            if (targetMessage) {
                const { deletedMessage, deletedMessages } = upsertDeletedMessageCache(
                    queryClient,
                    variables.conversationId,
                    targetMessage
                )

                queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) =>
                    old.map((message) =>
                        message.id === variables.messageId ? deletedMessage : message
                    )
                )

                await persistDeletedMessageCache(
                    variables.conversationId,
                    deletedMessages
                )
            }

            if (lastMessage?.id === variables.messageId) {
                queryClient.setQueryData<ChatConversation[]>(
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

            return {
                ...snapshot,
                previousDeletedMessages,
            }
        },

        onError: (_error, variables, context) => {
            restoreChatMutationSnapshot(queryClient, variables.conversationId, context)
            restoreDeletedMessageCache(
                queryClient,
                variables.conversationId,
                context?.previousDeletedMessages || []
            )
            void persistDeletedMessageCache(
                variables.conversationId,
                context?.previousDeletedMessages || []
            ).catch(() => undefined)
        },

        onSettled: (_data, _error, variables) => {
            invalidateChatQueries(queryClient, variables.conversationId)
        },
    })
}
