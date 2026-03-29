export type ChatConversationApi = {
    conversationId?: number
    otherUserId?: string
    otherFullName?: string
    otherProfileImageUrl?: string | null
    lastMessageText?: string
    lastMessageAtUtc?: string
    unreadCount?: number
}

export type ChatConversation = {
    id: string
    otherUserId: string
    otherUserName: string
    otherUserUsername: string
    otherUserAvatarUrl: string | null
    contextLabel: string
    lastMessageText: string
    lastMessageTime: string
    unreadCount: number
}

export type ChatMessageApi = {
    id?: number
    conversationId?: number
    senderId?: string
    text?: string | null
    imageUrl?: string | null
    sentAtUtc?: string
    isRead?: boolean
}

export type ChatMessage = {
    id: string
    conversationId: string
    content: string
    imageUrl: string | null
    senderId: string
    senderName: string
    senderUsername: string
    senderAvatarUrl: string | null
    createdAt: string
    isRead: boolean
    isMine: boolean
}

export type SendMessageRequest = {
    conversationId: number
    text: string
}

export type SendImageInput = {
    uri: string
    previewUrl?: string | null
    name?: string | null
    type?: string | null
    file?: File
}

export type SendImageRequest = {
    conversationId: number
    caption?: string
    image: SendImageInput
}

export type CreateDmResponse = {
    id: string
}
