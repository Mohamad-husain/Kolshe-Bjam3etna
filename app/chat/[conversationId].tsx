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
    getChatDateLabel,
    getChatDownloadExtension,
    getChatDownloadFileName,
    getFileLabel,
    getMessageActionsState,
    getMessageActionSubtitle,
    getValidChatAssetUri,
    isImageChatAsset,
    openChatAsset,
    resolveMessageOwnership,
} from "@/components/chat/chat-message-helpers"
import { getAvatarColor } from "@/components/chat/chat-ui"
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
    const downloadUri = getValidChatAssetUri(uri)

    if (!downloadUri) {
        return false
    }

    const safeName = getChatDownloadFileName(uri, suggestedName)

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

    if (isImageChatAsset(downloadUri, suggestedName)) {
        const permission = await MediaLibrary.requestPermissionsAsync()

        if (!permission.granted) {
            return false
        }

        const baseDirectory = FileSystem.cacheDirectory || FileSystem.documentDirectory

        if (!baseDirectory) {
            return false
        }

        const fileUri = `${baseDirectory}chat-download-${Date.now()}${getChatDownloadExtension(
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
        if (!getMessageActionsState(message).hasAny) {
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
