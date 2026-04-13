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
  profile: {
    myServices: ['profile', 'my-services'] as const,
    myAds: ['profile', 'my-ads'] as const,
    mySwaps: ['profile', 'my-swaps'] as const,
    incomingOffers: ['profile', 'incoming-offers'] as const,
    outgoingOffers: ['profile', 'outgoing-offers'] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    users: ['admin', 'users'] as const,
    news: ['admin', 'news'] as const,
    roles: ['admin', 'roles'] as const,
    roleSummary: ['admin', 'role-summary'] as const,
    roleOptions: ['admin', 'role-options'] as const,
    roleScopes: ['admin', 'role-scopes'] as const,
    offers: ['admin', 'offers'] as const,
    clubs: ['admin', 'clubs'] as const,
    clubSummary: ['admin', 'club-summary'] as const,
  },
};
