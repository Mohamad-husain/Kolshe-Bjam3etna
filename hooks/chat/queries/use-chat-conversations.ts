import { useQuery } from "@tanstack/react-query"
import { getConversations } from "@/services/chat/chat-api"
import { queryKeys } from "@/lib/query-keys"

export const useChatConversations = () => {
    return useQuery({
        queryKey: queryKeys.chat.conversations,
        queryFn: getConversations,
        staleTime: 2_000,
        refetchInterval: 5_000,
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: true,
    })
}
