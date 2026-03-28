import { useQuery } from "@tanstack/react-query"

import { getMessages } from "@/services/chat/chat-api"
import { queryKeys } from "@/lib/query-keys"

export const useChatMessages = (conversationId: string) => {
    return useQuery({
        queryKey: queryKeys.chat.messages(conversationId),
        queryFn: () => getMessages(conversationId),
        enabled: !!conversationId,
        staleTime: 2_000,
        refetchInterval: conversationId ? 3_000 : false,
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: true,
    })
}
