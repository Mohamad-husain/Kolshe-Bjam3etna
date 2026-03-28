export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
    universities: ['auth', 'universities'] as const,
  },
  chat: {
    conversations: ['chat', 'conversations'] as const,
    messages: (conversationId: string) => ['chat', 'messages', conversationId] as const,
  },
  explore: {
    services: ['explore', 'services'] as const,
    products: ['explore', 'products'] as const,
    swaps: ['explore', 'swaps'] as const,
    events: ['explore', 'events'] as const,
  },
};
