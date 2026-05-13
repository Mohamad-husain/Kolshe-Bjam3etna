import React, { useEffect, useMemo, useRef, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Linking,
    Platform,
    StyleSheet,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router, useLocalSearchParams } from "expo-router"
import * as FileSystem from "expo-file-system/legacy"
import * as MediaLibrary from "expo-media-library"
import * as Sharing from "expo-sharing"
import * as WebBrowser from "expo-web-browser"

import ChatComposer from "@/components/chat/ChatComposer"
import ChatDateBadge from "@/components/chat/ChatDateBadge"
import ChatEditMessageModal from "@/components/chat/ChatEditMessageModal"
import ChatEmptyState from "@/components/chat/ChatEmptyState"
import ChatHeader from "@/components/chat/ChatHeader"
import ChatImagePreviewModal from "@/components/chat/ChatImagePreviewModal"
import ChatMessageActionsModal, {
    type ChatMessageActionItem,
} from "@/components/chat/ChatMessageActionsModal"
import ChatMessageBubble from "@/components/chat/ChatMessageBubble"
import {
    DELETED_MESSAGE_PREVIEW,
    isDeletedMessageContent,
} from "@/hooks/chat/mutations/chat-mutation-utils"
import { useAuth } from "@/contexts/auth-context"
import { useDeleteMessage } from "@/hooks/chat/mutations/use-delete-message"
import { useMarkRead } from "@/hooks/chat/mutations/use-mark-read"
import { useUpdateMessage } from "@/hooks/chat/mutations/use-update-message"
import { useChatConversations } from "@/hooks/chat/queries/use-chat-conversations"
import { useChatMessages } from "@/hooks/chat/queries/use-chat-messages"
import type { ChatConversation, ChatMessage } from "@/types/chat"

const EMPTY_MESSAGES: ChatMessage[] = []

const scrollMessagesToEnd = (
    listRef: React.RefObject<FlatList<ChatMessage> | null>
) => {
    setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true })
    }, 100)
}

const CHAT_AVATAR_COLORS = [
    "#2563EB",
    "#22C55E",
    "#38BDF8",
    "#F59E0B",
    "#A855F7",
    "#F97316",
] as const

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/$/, "")
const ISO_UTC_WITHOUT_ZONE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/
const IMAGE_FILE_PATTERN = /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)(\?.*)?$/i

type OwnershipInput = {
    message: ChatMessage
    otherUserId?: string
    headerTitle: string
    currentUserName: string
    otherUserAvatarUrl: string | null
}

function parseChatDate(value?: string | null) {
    if (!value) {
        return null
    }

    const normalizedValue = value.trim()

    if (!normalizedValue) {
        return null
    }

    const valueWithTimezone = ISO_UTC_WITHOUT_ZONE_PATTERN.test(normalizedValue)
        ? `${normalizedValue}Z`
        : normalizedValue

    const date = new Date(valueWithTimezone)

    if (Number.isNaN(date.getTime())) {
        return null
    }

    return date
}

function isSameCalendarDay(firstDate: Date, secondDate: Date) {
    return (
        firstDate.getDate() === secondDate.getDate() &&
        firstDate.getMonth() === secondDate.getMonth() &&
        firstDate.getFullYear() === secondDate.getFullYear()
    )
}

function isYesterdayDate(date: Date, currentDate: Date) {
    const yesterday = new Date(currentDate)
    yesterday.setDate(currentDate.getDate() - 1)

    return isSameCalendarDay(date, yesterday)
}

function getAvatarColor(seed?: string | null) {
    const value = (seed ?? "").trim()

    if (!value) {
        return CHAT_AVATAR_COLORS[0]
    }

    const index =
        value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % CHAT_AVATAR_COLORS.length

    return CHAT_AVATAR_COLORS[index]
}

function getValidImageUri(value?: string | null) {
    const uri = value?.trim()

    if (!uri) {
        return null
    }

    if (
        uri.startsWith("http://") ||
        uri.startsWith("https://") ||
        uri.startsWith("data:") ||
        uri.startsWith("file:") ||
        uri.startsWith("blob:") ||
        uri.startsWith("content:")
    ) {
        return uri
    }

    if (!API_BASE_URL) {
        return null
    }

    if (uri.startsWith("/")) {
        return `${API_BASE_URL}${uri}`
    }

    return `${API_BASE_URL}/${uri.replace(/^\/+/, "")}`
}

function getDisplayImageUri(value?: string | null) {
    return getValidImageUri(value)
}

function getDisplayFileUri(value?: string | null) {
    return getValidImageUri(value)
}

async function openChatAsset(uri?: string | null) {
    const assetUri = getValidImageUri(uri)

    if (!assetUri) {
        return false
    }

    if (typeof window !== "undefined" && typeof document !== "undefined") {
        window.open(assetUri, "_blank", "noopener,noreferrer")
        return true
    }

    try {
        await WebBrowser.openBrowserAsync(assetUri)
        return true
    } catch {
        await Linking.openURL(assetUri)
        return true
    }
}

function getFileLabel(fileName?: string | null, fileUrl?: string | null) {
    const directName = fileName?.trim()

    if (directName) {
        return directName
    }

    const filePath = fileUrl?.trim().split("?")[0] || ""
    const segments = filePath.split("/").filter(Boolean)
    const lastSegment = segments[segments.length - 1]

    return lastSegment || "ملف"
}

function isImageAsset(uri?: string | null, suggestedName?: string | null) {
    const candidate = `${suggestedName?.trim() || ""} ${uri?.trim() || ""}`
    return IMAGE_FILE_PATTERN.test(candidate)
}

function getDownloadExtension(uri?: string | null, suggestedName?: string | null) {
    const source = getFileLabel(suggestedName, uri)
    const match = source.match(/\.[a-z0-9]+$/i)
    return match?.[0] || ".jpg"
}

function getDownloadFileName(uri?: string | null, suggestedName?: string | null) {
    return (suggestedName?.trim() || getFileLabel(suggestedName, uri)).replace(
        /[<>:"/\\|?*\x00-\x1F]/g,
        "_"
    )
}

async function saveFileToAndroidDownloads(
    tempFileUri: string,
    fileName: string,
    mimeType?: string | null
) {
    const downloadsUri = FileSystem.StorageAccessFramework.getUriForDirectoryInRoot("Download")
    const permission =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(downloadsUri)

    if (!permission.granted) {
        return false
    }

    const targetUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permission.directoryUri,
        fileName,
        mimeType?.trim() || "application/octet-stream"
    )

    const fileBase64 = await FileSystem.readAsStringAsync(tempFileUri, {
        encoding: FileSystem.EncodingType.Base64,
    })

    await FileSystem.StorageAccessFramework.writeAsStringAsync(targetUri, fileBase64, {
        encoding: FileSystem.EncodingType.Base64,
    })

    return true
}

async function downloadChatAsset(
    uri?: string | null,
    suggestedName?: string | null,
    mimeType?: string | null
) {
    const downloadUri = getValidImageUri(uri)

    if (!downloadUri) {
        return false
    }

    const safeName = getDownloadFileName(uri, suggestedName)

    if (typeof window !== "undefined" && typeof document !== "undefined") {
        const link = document.createElement("a")
        link.href = downloadUri
        link.download = safeName
        link.target = "_blank"
        link.rel = "noopener noreferrer"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return true
    }

    if (isImageAsset(downloadUri, suggestedName)) {
        const permission = await MediaLibrary.requestPermissionsAsync()

        if (!permission.granted) {
            return false
        }

        const baseDirectory = FileSystem.cacheDirectory || FileSystem.documentDirectory

        if (!baseDirectory) {
            return false
        }

        const fileUri = `${baseDirectory}chat-download-${Date.now()}${getDownloadExtension(
            downloadUri,
            suggestedName
        )}`

        const result = await FileSystem.downloadAsync(downloadUri, fileUri)
        await MediaLibrary.createAssetAsync(result.uri)
        return true
    }

    const baseDirectory = FileSystem.documentDirectory || FileSystem.cacheDirectory

    if (!baseDirectory) {
        return false
    }

    const result = await FileSystem.downloadAsync(downloadUri, `${baseDirectory}${safeName}`)

    if (Platform.OS === "android") {
        const saved = await saveFileToAndroidDownloads(result.uri, safeName, mimeType)

        if (saved) {
            return true
        }
    }

    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
            dialogTitle: "حفظ الملف",
        })
        return true
    }

    await Linking.openURL(result.uri)
    return true
}

function formatChatDateLabel(value?: string | null) {
    const date = parseChatDate(value)

    if (!date) {
        return ""
    }

    const now = new Date()

    if (isSameCalendarDay(date, now)) {
        return "اليوم"
    }

    if (isYesterdayDate(date, now)) {
        return "أمس"
    }

    const isSameYear = date.getFullYear() === now.getFullYear()

    return date.toLocaleDateString("ar", {
        day: "numeric",
        month: "long",
        ...(isSameYear ? {} : { year: "numeric" as const }),
    })
}

function resolveMessageOwnership({
    message,
    otherUserId,
    headerTitle,
    currentUserName,
    otherUserAvatarUrl,
}: OwnershipInput): ChatMessage {
    const isMine =
        otherUserId && message.senderId
            ? message.senderId.trim() !== otherUserId
            : message.isMine

    return {
        ...message,
        isMine,
        senderName: isMine ? currentUserName : headerTitle,
        senderAvatarUrl: isMine
            ? null
            : message.senderAvatarUrl || otherUserAvatarUrl,
    }
}

function getChatDateLabel(messages: ChatMessage[]) {
    const candidateDates = [
        messages[0]?.createdAt,
        messages[messages.length - 1]?.createdAt,
    ]

    for (const value of candidateDates) {
        const label = formatChatDateLabel(value)

        if (label) {
            return label
        }
    }

    return ""
}

const isOwnMessage = (message: ChatMessage) => message.isMine

const hasImageAttachment = (message: ChatMessage) =>
    !!getDisplayImageUri(message.imageUrl)

const hasFileAttachment = (message: ChatMessage) =>
    !!getDisplayFileUri(message.fileUrl) || !!message.fileName.trim()

function getMessageActionsState(message: ChatMessage) {
    const isDeleted = isDeletedMessageContent(message.content)
    const canEdit = isOwnMessage(message) && !isDeleted
    const canDelete = isOwnMessage(message) && !isDeleted
    const canDownloadImage = !isDeleted && hasImageAttachment(message)
    const canDownloadFile = !isDeleted && hasFileAttachment(message)

    return {
        canEdit,
        canDelete,
        canDownloadImage,
        canDownloadFile,
        hasAny: canEdit || canDelete || canDownloadImage || canDownloadFile,
    }
}

const hasMessageActions = (message: ChatMessage) =>
    getMessageActionsState(message).hasAny

function getMessageActionSubtitle(message: ChatMessage) {
    if (isDeletedMessageContent(message.content)) {
        return DELETED_MESSAGE_PREVIEW
    }

    if (message.content.trim()) {
        return message.content.trim()
    }

    if (hasImageAttachment(message)) {
        return "رسالة تحتوي على صورة"
    }

    if (hasFileAttachment(message)) {
        return getFileLabel(message.fileName, message.fileUrl)
    }

    return "اختر الإجراء المناسب لهذه الرسالة"
}

export default function ChatScreen() {
    const params = useLocalSearchParams<{
        conversationId: string
        otherUserName?: string
        otherUserAvatarUrl?: string
    }>()
    const flatListRef = useRef<FlatList<ChatMessage> | null>(null)
    const { user } = useAuth()

    const conversationId = params.conversationId || ""
    const passedOtherUserName = params.otherUserName || ""
    const passedAvatarUrl = params.otherUserAvatarUrl || ""

    const { data: messagesData, isLoading: isMessagesLoading } = useChatMessages(conversationId)
    const { data: conversationsData, isLoading: isConversationsLoading } = useChatConversations()
    const markReadMutation = useMarkRead()
    const deleteMessageMutation = useDeleteMessage()
    const updateMessageMutation = useUpdateMessage()

    const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null)
    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null)
    const [editedText, setEditedText] = useState("")
    const [previewImageUri, setPreviewImageUri] = useState<string | null>(null)

    const messages = messagesData ?? EMPTY_MESSAGES
    const conversations: ChatConversation[] = conversationsData ?? []
    const currentConversation = conversations.find(
        (conversation) => conversation.id === conversationId
    )

    const headerTitle = currentConversation?.otherUserName || passedOtherUserName
    const avatarColor = getAvatarColor(headerTitle)
    const otherUserAvatarUrl =
        currentConversation?.otherUserAvatarUrl || passedAvatarUrl || null
    const currentUserName = user?.name?.trim() || ""

    const resolvedMessages = useMemo(
        () =>
            messages.map((message) =>
                resolveMessageOwnership({
                    message,
                    otherUserId: currentConversation?.otherUserId?.trim(),
                    headerTitle,
                    currentUserName,
                    otherUserAvatarUrl,
                })
            ),
        [
            currentConversation?.otherUserId,
            currentUserName,
            headerTitle,
            messages,
            otherUserAvatarUrl,
        ]
    )

    const chatDateLabel = getChatDateLabel(resolvedMessages)

    useEffect(() => {
        if (conversationId && (currentConversation?.unreadCount ?? 1) > 0) {
            markReadMutation.mutate(conversationId)
        }
    }, [conversationId, currentConversation?.unreadCount, markReadMutation])

    useEffect(() => {
        if (messages.length > 0) {
            scrollMessagesToEnd(flatListRef)
        }
    }, [messages.length])

    const closeActionsModal = () => setSelectedMessage(null)
    const closeEditModal = () => {
        setEditingMessage(null)
        setEditedText("")
    }

    const handleOpenMessageActions = (message: ChatMessage) => {
        if (!hasMessageActions(message)) {
            return
        }

        setSelectedMessage(message)
    }

    const handlePreviewImage = (imageUri: string) => {
        if (!imageUri) {
            Alert.alert("تعذر فتح الصورة", "لم نتمكن من عرض الصورة حالياً.")
            return
        }

        setPreviewImageUri(imageUri)
    }

    const handleDownloadImage = async (message: ChatMessage) => {
        const downloaded = await downloadChatAsset(
            message.imageUrl,
            `chat-image-${message.id}`
        )

        if (!downloaded) {
            Alert.alert("تعذر التنزيل", "لم نتمكن من فتح الصورة أو تنزيلها.")
        }

        closeActionsModal()
    }

    const handleDownloadFile = async (message: ChatMessage) => {
        const downloaded = await downloadChatAsset(
            message.fileUrl,
            getFileLabel(message.fileName, message.fileUrl),
            message.fileMimeType
        )

        if (!downloaded) {
            Alert.alert("تعذر التنزيل", "لم نتمكن من فتح الملف أو تنزيله.")
        }

        closeActionsModal()
    }

    const handleOpenFile = async (message: ChatMessage) => {
        const opened = await openChatAsset(message.fileUrl)

        if (!opened) {
            Alert.alert("تعذر فتح الملف", "لم نتمكن من فتح الملف حالياً.")
        }
    }

    const handleStartEdit = (message: ChatMessage) => {
        setEditingMessage(message)
        setEditedText(message.content)
        closeActionsModal()
    }

    const handleSaveEdit = () => {
        if (!editingMessage) {
            return
        }

        const nextText = editedText.trim()
        const currentText = editingMessage.content.trim()

        if (nextText === currentText) {
            closeEditModal()
            return
        }

        updateMessageMutation.mutate(
            {
                conversationId,
                messageId: editingMessage.id,
                text: nextText || null,
            },
            {
                onSuccess: closeEditModal,
                onError: () => {
                    Alert.alert("فشل التعديل", "تعذر تعديل الرسالة حالياً.")
                },
            }
        )
    }

    const handleDeleteMessage = (message: ChatMessage) => {
        Alert.alert("حذف الرسالة", "هل تريد حذف هذه الرسالة نهائياً؟", [
            { text: "إلغاء", style: "cancel" },
            {
                text: "حذف",
                style: "destructive",
                onPress: () => {
                    deleteMessageMutation.mutate(
                        { conversationId, messageId: message.id },
                        {
                            onError: () => {
                                Alert.alert("فشل الحذف", "تعذر حذف الرسالة حالياً.")
                            },
                        }
                    )
                },
            },
        ])

        closeActionsModal()
    }

    const selectedMessageActions: ChatMessageActionItem[] = selectedMessage
        ? (() => {
            const actionState = getMessageActionsState(selectedMessage)
            const actions: ChatMessageActionItem[] = []

            if (actionState.canEdit) {
                actions.push({
                    key: "edit",
                    label: "تعديل الرسالة",
                    icon: "create-outline",
                    color: "#2563EB",
                    textStyle: styles.actionText,
                    onPress: () => handleStartEdit(selectedMessage),
                })
            }

            if (actionState.canDownloadImage) {
                actions.push({
                    key: "download-image",
                    label: "تنزيل الصورة",
                    icon: "download-outline",
                    color: "#0F172A",
                    textStyle: styles.actionText,
                    onPress: () => {
                        void handleDownloadImage(selectedMessage)
                    },
                })
            }

            if (actionState.canDownloadFile) {
                actions.push({
                    key: "download-file",
                    label: "تنزيل الملف",
                    icon: "download-outline",
                    color: "#0F172A",
                    textStyle: styles.actionText,
                    onPress: () => {
                        void handleDownloadFile(selectedMessage)
                    },
                })
            }

            if (actionState.canDelete) {
                actions.push({
                    key: "delete",
                    label: "حذف الرسالة",
                    icon: "trash-bin-outline",
                    color: "#DC2626",
                    textStyle: styles.deleteText,
                    onPress: () => handleDeleteMessage(selectedMessage),
                })
            }

            return actions
        })()
        : []

    if (isMessagesLoading || isConversationsLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 6 : 0}
            >
                <View style={styles.container}>
                    <ChatHeader
                        title={headerTitle}
                        avatarUrl={otherUserAvatarUrl}
                        avatarColor={avatarColor}
                        onBack={() => router.back()}
                    />

                    <FlatList
                        ref={flatListRef}
                        data={resolvedMessages}
                        renderItem={({ item }) => (
                            <ChatMessageBubble
                                message={item}
                                avatarColor={avatarColor}
                                onLongPress={handleOpenMessageActions}
                                onPressImage={handlePreviewImage}
                                onPressFile={handleOpenFile}
                            />
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messages}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => scrollMessagesToEnd(flatListRef)}
                        ListHeaderComponent={<ChatDateBadge label={chatDateLabel} />}
                        ListEmptyComponent={
                            <ChatEmptyState
                                iconName="chatbubble-ellipses-outline"
                                title="ابدأ المحادثة الآن"
                                description="أرسل أول رسالة للتواصل ومناقشة التفاصيل بسهولة."
                            />
                        }
                    />

                    <ChatComposer conversationId={conversationId} />
                </View>
            </KeyboardAvoidingView>

            <ChatImagePreviewModal
                imageUri={previewImageUri}
                onClose={() => setPreviewImageUri(null)}
            />

            <ChatMessageActionsModal
                visible={!!selectedMessage}
                title="إجراءات الرسالة"
                subtitle={
                    selectedMessage
                        ? getMessageActionSubtitle(selectedMessage)
                        : "اختر الإجراء المناسب لهذه الرسالة"
                }
                actions={selectedMessageActions}
                onClose={closeActionsModal}
            />

            <ChatEditMessageModal
                visible={!!editingMessage}
                value={editedText}
                isSaving={updateMessageMutation.isPending}
                onChangeText={setEditedText}
                onSave={handleSaveEdit}
                onClose={closeEditModal}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    keyboardContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
    messages: {
        padding: 16,
        paddingBottom: 24,
        flexGrow: 1,
    },
    actionText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
        textAlign: "center",
    },
    deleteText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#DC2626",
        textAlign: "center",
    },
})
