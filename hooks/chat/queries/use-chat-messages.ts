import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import {
    mergeMessagesWithDeletedTombstones,
} from "@/hooks/chat/mutations/chat-mutation-utils"
import { useDeletedChatMessages } from "@/hooks/chat/queries/use-deleted-chat-messages"
import { getMessages } from "@/services/chat/chat-api"
import { queryKeys } from "@/lib/query-keys"
import type { ChatMessage } from "@/types/chat"

const EMPTY_MESSAGES: ChatMessage[] = []

export const useChatMessages = (conversationId: string) => {
    const messagesQuery = useQuery({
        queryKey: queryKeys.chat.messages(conversationId),
        queryFn: () => getMessages(conversationId),
        enabled: !!conversationId,
        staleTime: 2_000,
        refetchInterval: conversationId ? 3_000 : false,
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: true,
    })

    const { data: deletedMessages = EMPTY_MESSAGES } =
        useDeletedChatMessages(conversationId)

    const mergedMessages = useMemo(
        () =>
            mergeMessagesWithDeletedTombstones(
                messagesQuery.data ?? EMPTY_MESSAGES,
                deletedMessages
            ),
        [deletedMessages, messagesQuery.data]
    )

    return {
        ...messagesQuery,
        data: mergedMessages,
    }
}
