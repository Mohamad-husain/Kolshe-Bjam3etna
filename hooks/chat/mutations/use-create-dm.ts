import { useMutation } from "@tanstack/react-query"
import { createDM } from "@/services/chat/chat-api"

export const useCreateDm = () => {
    return useMutation({
        mutationFn: (otherUserId: string) => createDM(otherUserId),
    })
}
