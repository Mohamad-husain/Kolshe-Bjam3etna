import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import {
  createDirectConversation,
  createDirectConversationByEmail,
} from '@/services/chat/chat-api';

type StartDirectChatInput =
  | { otherUserId: string; otherUserEmail?: never }
  | { otherUserId?: never; otherUserEmail: string };

export function useStartDirectChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StartDirectChatInput) => {
      if (input.otherUserId) {
        return createDirectConversation(input.otherUserId);
      }

      return createDirectConversationByEmail(input.otherUserEmail ?? '');
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations });
    },
  });
}
