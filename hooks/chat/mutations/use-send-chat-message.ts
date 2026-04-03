import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { sendChatMessage } from "@/services/chat/chat-api"
import {
    cancelChatQueries,
    ChatMutationSnapshot,
    createOptimisticMessage,
    getConversationPreviewText,
    getChatMutationSnapshot,
    invalidateChatQueries,
    restoreChatMutationSnapshot,
    updateConversationPreview,
} from "@/hooks/chat/mutations/chat-mutation-utils"
import type { ChatConversation, ChatMessage, SendChatMessageRequest } from "@/types/chat"
import type { User } from "@/services/auth-api"

type MutationContext = ChatMutationSnapshot & {
    conversationId: string
    optimisticMessage: ChatMessage
}

export const useSendChatMessage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: SendChatMessageRequest) => sendChatMessage(payload),

        onMutate: async (variables): Promise<MutationContext> => {
            const conversationId = String(variables.conversationId)
            const queryKey = queryKeys.chat.messages(conversationId)
            const currentUser =
                queryClient.getQueryData<User | null>(queryKeys.auth.user) || null

            await cancelChatQueries(queryClient, conversationId)
            const snapshot = getChatMutationSnapshot(queryClient, conversationId)

            const optimisticMessage = createOptimisticMessage({
                conversationId,
                text: variables.text,
                image: variables.image,
                file: variables.file,
                currentUserName: currentUser?.name?.trim() || "",
            })

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
                        getConversationPreviewText(optimisticMessage),
                        optimisticMessage.createdAt
                    )
            )

            return {
                conversationId,
                optimisticMessage,
                ...snapshot,
            }
        },

        onError: (_error, _variables, context) => {
            restoreChatMutationSnapshot(
                queryClient,
                context?.conversationId || "",
                context
            )
        },

        onSuccess: (data, _variables, context) => {
            const conversationId = context?.conversationId || ""

            queryClient.setQueryData<ChatMessage[]>(
                queryKeys.chat.messages(conversationId),
                (old = []) =>
                    old.map((message) =>
                        message.id === context?.optimisticMessage.id
                            ? {
                                ...message,
                                ...data,
                                senderName: context?.optimisticMessage.senderName || "",
                                senderAvatarUrl: null,
                                isMine: true,
                                imageUrl: data.imageUrl || message.imageUrl,
                                fileUrl: data.fileUrl || message.fileUrl,
                                fileName: data.fileName || message.fileName,
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
                        getConversationPreviewText(data),
                        data.createdAt || context?.optimisticMessage.createdAt || ""
                    )
            )
        },

        onSettled: (_data, _error, variables) => {
            invalidateChatQueries(queryClient, String(variables.conversationId))
        },
    })
}
