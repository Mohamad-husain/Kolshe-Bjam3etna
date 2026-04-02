export type ChatConversationApi = {
    conversationId?: number | string | null
    otherUserId?: string | null
    otherFullName?: string | null
    otherProfileImageUrl?: string | null
    lastMessageText?: string | null
    lastMessageAtUtc?: string | null
    unreadCount?: number | null
}

export type ChatImageApi = {
    imageUrl?: string | null
}

export type ChatMessageApi = {
    id?: number | string | null
    conversationId?: number | string | null
    senderId?: string | null
    text?: string | null
    images?: ChatImageApi[] | null
    fileUrl?: string | null
    fileName?: string | null
    fileContentType?: string | null
    sentAtUtc?: string | null
    isRead?: boolean | null
}

export type ChatConversation = {
    id: string
    otherUserId: string
    otherUserName: string
    otherUserAvatarUrl: string | null
    lastMessageText: string
    lastMessageTime: string
    unreadCount: number
}

export type ChatMessage = {
    id: string
    conversationId: string
    content: string
    imageUrl: string | null
    fileUrl: string | null
    fileName: string
    fileMimeType: string
    senderId: string
    senderName: string
    senderAvatarUrl: string | null
    createdAt: string
    isRead: boolean
    isMine: boolean
}

export type ChatUploadInput = {
    uri: string
    previewUrl?: string | null
    name?: string | null
    type?: string | null
    file?: File
}

export type SendChatMessageRequest = {
    conversationId: number
    text?: string
    image?: ChatUploadInput | null
    file?: ChatUploadInput | null
}

export type UpdateChatMessageRequest = {
    messageId: string
    text: string | null
}
