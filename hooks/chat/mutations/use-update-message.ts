import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { updateMessage } from "@/services/chat/chat-api"
import {
    cancelChatQueries,
    EDITED_MESSAGE_PREVIEW,
    getChatMutationSnapshot,
    invalidateChatQueries,
    restoreChatMutationSnapshot,
    updateConversationPreview,
} from "@/hooks/chat/mutations/chat-mutation-utils"
import type {
    ChatConversation,
    ChatMessage,
    UpdateChatMessageRequest,
} from "@/types/chat"

type UpdateMessageInput = UpdateChatMessageRequest & {
    conversationId: string
}

export const useUpdateMessage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ conversationId: _conversationId, ...payload }: UpdateMessageInput) =>
            updateMessage(payload),

        onMutate: async (variables) => {
            const queryKey = queryKeys.chat.messages(variables.conversationId)

            await cancelChatQueries(queryClient, variables.conversationId)
            const snapshot = getChatMutationSnapshot(queryClient, variables.conversationId)
            const lastMessage =
                snapshot.previousMessages[snapshot.previousMessages.length - 1]

            queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) =>
                old.map((message) =>
                    message.id === variables.messageId
                        ? {
                            ...message,
                            content: variables.text?.trim() || "",
                        }
                        : message
                )
            )

            const updatedMessage =
                snapshot.previousMessages.find((message) => message.id === variables.messageId)

            if (updatedMessage && lastMessage?.id === variables.messageId) {
                queryClient.setQueryData<ChatConversation[]>(
                    queryKeys.chat.conversations,
                    (old = []) =>
                        updateConversationPreview(
                            old,
                            variables.conversationId,
                            EDITED_MESSAGE_PREVIEW,
                            updatedMessage.createdAt
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
