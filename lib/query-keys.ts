export const queryKeys = {
  home: {
    news: ['home', 'news'] as const,
    partnerOffers: ['home', 'partner-offers'] as const,
  },
  auth: {
    user: ['auth', 'user'] as const,
    profile: ['auth', 'profile'] as const,
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
