import { useQuery } from "@tanstack/react-query"

import { loadDeletedMessageCache } from "@/hooks/chat/mutations/deleted-message-cache"
import { queryKeys } from "@/lib/query-keys"
import type { ChatMessage } from "@/types/chat"

const EMPTY_DELETED_MESSAGES: ChatMessage[] = []

export const useDeletedChatMessages = (conversationId: string) => {
    return useQuery({
        queryKey: queryKeys.chat.deletedMessages(conversationId),
        queryFn: () => loadDeletedMessageCache(conversationId),
        enabled: !!conversationId,
        placeholderData: EMPTY_DELETED_MESSAGES,
        staleTime: Infinity,
    })
}
