import { apiClient, getAuthToken } from "../http-client"
import type {
    ChatConversation,
    ChatConversationApi,
    ChatImageApi,
    ChatMessage,
    ChatMessageApi,
    ChatUploadInput,
    SendChatMessageRequest,
    UpdateChatMessageRequest,
} from "@/types/chat"

const CHAT_API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "")
    .trim()
    .replace(/\/$/, "")

const isWebRuntime =
    typeof window !== "undefined" && typeof document !== "undefined"

const getTrimmedString = (value?: string | null) => value?.trim() || ""

const toIdString = (value?: string | number | null) =>
    value === null || value === undefined ? "" : String(value).trim()

const toApiCollection = <T>(value: unknown): T[] =>
    Array.isArray(value) ? (value as T[]) : []

const getCurrentUserIdFromToken = () => {
    const token = getAuthToken()?.trim()

    if (!token) {
        return ""
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]))

        return (
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
            payload.nameid ||
            payload.sub ||
            ""
        )
    } catch {
        return ""
    }
}

const getMessageImageUrl = (message: ChatMessageApi) => {
    for (const image of toApiCollection<ChatImageApi>(message.images)) {
        const imageUrl = getTrimmedString(image.imageUrl)

        if (imageUrl) {
            return imageUrl
        }
    }

    return ""
}

const mapConversation = (conversation: ChatConversationApi): ChatConversation | null => {
    const id = toIdString(conversation.conversationId)

    if (!id) {
        return null
    }

    return {
        id,
        otherUserId: getTrimmedString(conversation.otherUserId),
        otherUserName: getTrimmedString(conversation.otherFullName),
        otherUserAvatarUrl: getTrimmedString(conversation.otherProfileImageUrl) || null,
        lastMessageText:
            getTrimmedString(conversation.lastMessageText) || "ابدأ المحادثة الآن",
        lastMessageTime: getTrimmedString(conversation.lastMessageAtUtc),
        unreadCount:
            typeof conversation.unreadCount === "number" && conversation.unreadCount > 0
                ? conversation.unreadCount
                : 0,
    }
}

const mapMessage = (
    message: ChatMessageApi,
    fallbackConversationId: string,
    currentUserId: string
): ChatMessage | null => {
    const id = toIdString(message.id)
    const imageUrl = getMessageImageUrl(message) || null
    const fileUrl = getTrimmedString(message.fileUrl) || null
    const content = getTrimmedString(message.text)

    if (!id || (!content && !imageUrl && !fileUrl)) {
        return null
    }

    const senderId = getTrimmedString(message.senderId)

    return {
        id,
        conversationId: toIdString(message.conversationId) || fallbackConversationId,
        content,
        imageUrl,
        fileUrl,
        fileName: getTrimmedString(message.fileName),
        fileMimeType: getTrimmedString(message.fileContentType),
        senderId,
        senderName: "",
        senderAvatarUrl: null,
        createdAt: getTrimmedString(message.sentAtUtc),
        isRead: Boolean(message.isRead),
        isMine: currentUserId ? senderId === currentUserId : false,
    }
}

const parseUnknownResponse = async (response: Response) => {
    const contentType = response.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
        return response.json()
    }

    const text = await response.text()

    if (!text.trim()) {
        return null
    }

    try {
        return JSON.parse(text)
    } catch {
        return text
    }
}

const getRequestErrorMessage = (value: unknown, fallbackMessage: string) => {
    if (typeof value === "string" && value.trim()) {
        return value
    }

    if (value && typeof value === "object" && "message" in value) {
        return (
            getTrimmedString((value as { message?: string | null }).message) ||
            fallbackMessage
        )
    }

    return fallbackMessage
}

const createWebUploadPart = async (payload: ChatUploadInput) => {
    if (payload.file) {
        return payload.file
    }

    const response = await fetch(payload.uri)
    const blob = await response.blob()
    const fileName = payload.name ?? `chat-upload-${Date.now()}`
    const mimeType = payload.type ?? blob.type ?? "application/octet-stream"

    if (typeof File !== "undefined") {
        return new File([blob], fileName, { type: mimeType })
    }

    return blob
}

const appendUploadField = (
    formData: FormData,
    fieldName: "Images" | "File",
    payload: ChatUploadInput,
    webPart: Blob | File | null
) => {
    if (webPart) {
        if (typeof Blob !== "undefined" && webPart instanceof Blob) {
            formData.append(fieldName, webPart, payload.name ?? `chat-upload-${Date.now()}`)
            return
        }

        formData.append(fieldName, webPart as never)
        return
    }

    formData.append(
        fieldName,
        {
            uri: payload.uri,
            name: payload.name ?? `chat-upload-${Date.now()}`,
            type: payload.type ?? "application/octet-stream",
        } as never
    )
}

const createSendMessageFormData = (
    payload: SendChatMessageRequest,
    webParts?: { image?: Blob | File | null; file?: Blob | File | null }
) => {
    const formData = new FormData()
    const text = payload.text?.trim() || ""

    formData.append("ConversationId", String(payload.conversationId))

    if (text) {
        formData.append("Text", text)
    }

    if (payload.image) {
        appendUploadField(formData, "Images", payload.image, webParts?.image ?? null)
    }

    if (payload.file) {
        appendUploadField(formData, "File", payload.file, webParts?.file ?? null)
    }

    return formData
}

const postNativeSendMessage = async (formData: FormData) => {
    const response = await apiClient.post("/api/Chat/send", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })

    return response.data
}

const postWebSendMessage = async (formData: FormData, fallbackMessage: string) => {
    const token = getAuthToken()
    const response = await fetch(`${CHAT_API_BASE_URL}/api/Chat/send`, {
        method: "POST",
        headers: token
            ? {
                Authorization: `Bearer ${token}`,
            }
            : undefined,
        body: formData,
    })
    const data = await parseUnknownResponse(response)

    if (!response.ok) {
        throw new Error(getRequestErrorMessage(data, fallbackMessage))
    }

    return data
}

const sendChatFormData = async (
    payload: SendChatMessageRequest,
    fallbackMessage: string
) => {
    const webParts =
        isWebRuntime && CHAT_API_BASE_URL
            ? {
                image: payload.image ? await createWebUploadPart(payload.image) : null,
                file: payload.file ? await createWebUploadPart(payload.file) : null,
            }
            : undefined

    const formData = createSendMessageFormData(payload, webParts)

    if (isWebRuntime && CHAT_API_BASE_URL) {
        return postWebSendMessage(formData, fallbackMessage)
    }

    return postNativeSendMessage(formData)
}

export const getConversations = async (): Promise<ChatConversation[]> => {
    const response = await apiClient.get("/api/Chat/list")

    return toApiCollection<ChatConversationApi>(response.data)
        .map(mapConversation)
        .filter((conversation): conversation is ChatConversation => conversation !== null)
}

export const getMessages = async (conversationId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/api/Chat/${conversationId}/messages`)
    const currentUserId = getCurrentUserIdFromToken()

    return toApiCollection<ChatMessageApi>(response.data)
        .map((message) => mapMessage(message, conversationId, currentUserId))
        .filter((message): message is ChatMessage => message !== null)
}

export const sendChatMessage = async (
    payload: SendChatMessageRequest
): Promise<ChatMessage> => {
    const response = await sendChatFormData(payload, "تعذر إرسال الرسالة")
    const currentUserId = getCurrentUserIdFromToken()
    const message = mapMessage(
        response as ChatMessageApi,
        String(payload.conversationId),
        currentUserId
    )

    if (!message) {
        throw new Error("تعذر قراءة بيانات الرسالة المرسلة")
    }

    return message
}

export const deleteMessage = async (messageId: string) => {
    const response = await apiClient.delete(`/api/Chat/messages/${messageId}`)
    return response.data
}

export const updateMessage = async ({
    messageId,
    text,
}: UpdateChatMessageRequest) => {
    const response = await apiClient.put(`/api/Chat/messages/${messageId}`, {
        text,
    })

    return response.data
}

export const markAsRead = async (conversationId: string) => {
    const response = await apiClient.post(`/api/Chat/${conversationId}/read`)
    return response.data
}
