import { apiClient, getAuthToken } from "../http-client"
import type {
    ChatConversation,
    ChatConversationApi,
    ChatMessage,
    ChatMessageApi,
    CreateDmResponse,
    SendImageRequest,
    SendMessageRequest,
} from "@/types/chat"

const CHAT_API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "")
    .trim()
    .replace(/\/$/, "")

const isWebRuntime =
    typeof window !== "undefined" && typeof document !== "undefined"

const getStringValue = (...values: unknown[]) => {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) {
            return value.trim()
        }
    }

    return ""
}

const getApiCollection = <T>(value: unknown): T[] => {
    if (Array.isArray(value)) {
        return value as T[]
    }

    return []
}

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

const mapConversation = (item: ChatConversationApi): ChatConversation | null => {
    const conversationId = String(item.conversationId ?? "")

    if (!conversationId) {
        return null
    }

    return {
        id: conversationId,
        otherUserId: getStringValue(item.otherUserId),
        otherUserName: getStringValue(item.otherFullName),
        otherUserUsername: "",
        otherUserAvatarUrl: getStringValue(item.otherProfileImageUrl) || null,
        contextLabel: "",
        lastMessageText: getStringValue(item.lastMessageText) || "ابدأ المحادثة الآن",
        lastMessageTime: getStringValue(item.lastMessageAtUtc),
        unreadCount:
            typeof item.unreadCount === "number" && item.unreadCount > 0
                ? item.unreadCount
                : 0,
    }
}

const mapMessage = (
    item: ChatMessageApi,
    conversationId: string,
    currentUserId: string
): ChatMessage | null => {
    const messageId = String(item.id ?? "")
    const senderId = getStringValue(item.senderId)

    if (!messageId) {
        return null
    }

    return {
        id: messageId,
        conversationId: String(item.conversationId ?? conversationId),
        content: getStringValue(item.text),
        imageUrl: getStringValue(item.imageUrl) || null,
        senderId,
        senderName: "",
        senderUsername: "",
        senderAvatarUrl: null,
        createdAt: getStringValue(item.sentAtUtc),
        isRead: item.isRead ?? false,
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

const createWebImagePart = async (payload: SendImageRequest["image"]) => {
    if (payload.file) {
        return payload.file
    }

    const response = await fetch(payload.uri)
    const blob = await response.blob()
    const fileName = payload.name ?? `chat-image-${Date.now()}.jpg`
    const mimeType = payload.type ?? blob.type ?? "image/jpeg"

    if (typeof File !== "undefined") {
        return new File([blob], fileName, { type: mimeType })
    }

    return blob
}

const buildTextFormData = (payload: SendMessageRequest) => {
    const formData = new FormData()
    formData.append("ConversationId", String(payload.conversationId))
    formData.append("Text", payload.text)
    return formData
}

const buildImageFormData = (
    payload: SendImageRequest,
    imagePart: Blob | File | null
) => {
    const formData = new FormData()
    const caption = payload.caption?.trim() || ""

    formData.append("ConversationId", String(payload.conversationId))

    if (caption) {
        formData.append("Text", caption)
    }

    if (imagePart) {
        if (typeof Blob !== "undefined" && imagePart instanceof Blob) {
            formData.append(
                "Image",
                imagePart,
                payload.image.name ?? `chat-image-${Date.now()}.jpg`
            )
        } else {
            formData.append("Image", imagePart as never)
        }

        return formData
    }

    formData.append(
        "Image",
        {
            uri: payload.image.uri,
            name: payload.image.name ?? `chat-image-${Date.now()}.jpg`,
            type: payload.image.type ?? "image/jpeg",
        } as never
    )

    return formData
}

const postWebFormData = async (
    endpoint: string,
    formData: FormData,
    fallbackMessage: string
) => {
    const token = getAuthToken()
    const response = await fetch(`${CHAT_API_BASE_URL}${endpoint}`, {
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
        throw new Error(
            typeof data === "string"
                ? data
                : typeof data === "object" &&
                    data &&
                    "message" in data &&
                    typeof data.message === "string"
                    ? data.message
                    : fallbackMessage
        )
    }

    return data
}

const postNativeFormData = async (endpoint: string, formData: FormData) => {
    const response = await apiClient.post(endpoint, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })

    return response.data
}

const postChatFormData = (formData: FormData, fallbackMessage: string) => {
    if (isWebRuntime && CHAT_API_BASE_URL) {
        return postWebFormData("/api/Chat/send", formData, fallbackMessage)
    }

    return postNativeFormData("/api/Chat/send", formData)
}

export const getConversations = async (): Promise<ChatConversation[]> => {
    const response = await apiClient.get("/api/Chat/list")

    return getApiCollection<ChatConversationApi>(response.data)
        .map(mapConversation)
        .filter((item): item is ChatConversation => item !== null)
}

export const getMessages = async (
    conversationId: string
): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/api/Chat/${conversationId}/messages`)
    const currentUserId = getCurrentUserIdFromToken()

    return getApiCollection<ChatMessageApi>(response.data)
        .map((item) => mapMessage(item, conversationId, currentUserId))
        .filter((item): item is ChatMessage => item !== null)
}

export const sendMessage = async (payload: SendMessageRequest) => {
    return postChatFormData(buildTextFormData(payload), "تعذر إرسال الرسالة")
}

export const sendImage = async (payload: SendImageRequest) => {
    if (isWebRuntime && CHAT_API_BASE_URL) {
        const imagePart = await createWebImagePart(payload.image)

        return postChatFormData(
            buildImageFormData(payload, imagePart),
            "تعذر إرسال الصورة"
        )
    }

    return postChatFormData(
        buildImageFormData(payload, null),
        "تعذر إرسال الصورة"
    )
}

export const createDM = async (
    otherUserId: string
): Promise<CreateDmResponse> => {
    const response = await apiClient.post("/api/Chat/dm", {
        otherUserId,
    })

    return {
        id: String(response.data?.conversationId ?? ""),
    }
}

export const markAsRead = async (conversationId: string) => {
    const response = await apiClient.post(`/api/Chat/${conversationId}/read`)
    return response.data
}
