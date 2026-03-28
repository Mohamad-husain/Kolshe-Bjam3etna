import React, { useEffect, useMemo, useRef } from "react"
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import ChatAvatar from "@/components/chat/ChatAvatar"
import ChatComposer from "@/components/chat/ChatComposer"
import ChatMessageBubble from "@/components/chat/ChatMessageBubble"
import { formatChatDateLabel, getAvatarColor } from "@/components/chat/chat-ui"
import { useAuth } from "@/contexts/auth-context"
import { useMarkRead } from "@/hooks/chat/mutations/use-mark-read"
import { useChatConversations } from "@/hooks/chat/queries/use-chat-conversations"
import { useChatMessages } from "@/hooks/chat/queries/use-chat-messages"
import type { ChatMessage } from "@/types/chat"

const resolveMessageOwnership = ({
    message,
    otherUserId,
    headerTitle,
    currentUserName,
    otherUserAvatarUrl,
}: {
    message: ChatMessage
    otherUserId?: string
    headerTitle: string
    currentUserName: string
    otherUserAvatarUrl: string | null
}) => {
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

const getChatDateLabel = (messages: ChatMessage[]) => {
    if (messages.length === 0) {
        return ""
    }

    return (
        formatChatDateLabel(messages[0]?.createdAt) ||
        formatChatDateLabel(messages[messages.length - 1]?.createdAt)
    )
}

export default function ChatScreen() {
    const params = useLocalSearchParams<{
        conversationId: string
        otherUserName?: string
        otherUserUsername?: string
        otherUserAvatarUrl?: string
    }>()

    const conversationId = params.conversationId || ""
    const passedOtherUserName = params.otherUserName || ""
    const passedOtherUserUsername = params.otherUserUsername || ""
    const passedAvatarUrl = params.otherUserAvatarUrl || ""
    const { user } = useAuth()

    const { data: messagesData, isLoading: isMessagesLoading } = useChatMessages(conversationId)
    const { data: conversationsData, isLoading: isConversationsLoading } = useChatConversations()
    const markReadMutation = useMarkRead()
    const flatListRef = useRef<FlatList>(null)

    const messages = useMemo(() => messagesData ?? [], [messagesData])
    const conversations = useMemo(() => conversationsData ?? [], [conversationsData])

    const currentConversation = useMemo(
        () => conversations.find((item) => String(item.id) === String(conversationId)),
        [conversations, conversationId]
    )

    const headerTitle =
        currentConversation?.otherUserName || passedOtherUserName
    const headerUsername =
        currentConversation?.otherUserUsername || passedOtherUserUsername

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
    const chatDateLabel = useMemo(
        () => getChatDateLabel(resolvedMessages),
        [resolvedMessages]
    )

    useEffect(() => {
        if (conversationId && (currentConversation?.unreadCount ?? 1) > 0) {
            markReadMutation.mutate(conversationId)
        }
    }, [conversationId, currentConversation?.unreadCount, markReadMutation])

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true })
            }, 100)
        }
    }, [messages])

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
                    <View style={styles.header}>
                        <View style={styles.actions}>
                            <TouchableOpacity activeOpacity={0.85} style={styles.headerButton}>
                                <Ionicons name="videocam-outline" size={20} color="#2563EB" />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.85} style={styles.headerButton}>
                                <Ionicons name="call-outline" size={20} color="#2563EB" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.userInfo}>
                            <ChatAvatar
                                size={52}
                                name={headerTitle}
                                imageUrl={otherUserAvatarUrl}
                                color={avatarColor}
                            />

                            <View style={styles.userCopy}>
                                <Text style={styles.name} numberOfLines={1}>
                                    {headerTitle}
                                </Text>
                                {!!headerUsername && (
                                    <Text style={styles.username} numberOfLines={1}>
                                        @{headerUsername.replace(/^@+/, "")}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backLabel}>الرسائل</Text>
                            <Ionicons name="chevron-forward" size={20} color="#2563EB" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={resolvedMessages}
                        renderItem={({ item }) => (
                            <ChatMessageBubble
                                message={item}
                                avatarColor={avatarColor}
                            />
                        )}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={styles.messages}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() =>
                            flatListRef.current?.scrollToEnd({ animated: true })
                        }
                        ListHeaderComponent={
                            chatDateLabel ? (
                                <View style={styles.dateWrap}>
                                    <Text style={styles.date}>{chatDateLabel}</Text>
                                </View>
                            ) : null
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIcon}>
                                    <Ionicons
                                        name="chatbubble-ellipses-outline"
                                        size={26}
                                        color="#2563EB"
                                    />
                                </View>
                                <Text style={styles.emptyTitle}>ابدأ المحادثة الآن</Text>
                                <Text style={styles.emptyText}>
                                    أول رسالة ستظهر هنا بشكل مرتب مع اسم وصورة الطرف الآخر.
                                </Text>
                            </View>
                        }
                    />

                    <ChatComposer conversationId={conversationId} />
                </View>
            </KeyboardAvoidingView>
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    backLabel: {
        color: "#2563EB",
        fontSize: 17,
        fontWeight: "700",
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        justifyContent: "center",
        alignItems: "center",
    },
    userInfo: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    userCopy: {
        alignItems: "center",
        marginTop: 6,
    },
    name: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0F172A",
        textAlign: "center",
    },
    username: {
        color: "#2563EB",
        fontSize: 12,
        fontWeight: "700",
        marginTop: 3,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    dateWrap: {
        alignItems: "center",
        marginBottom: 12,
    },
    date: {
        backgroundColor: "#E2E8F0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        fontSize: 12,
        color: "#475569",
        fontWeight: "700",
    },
    messages: {
        padding: 16,
        paddingBottom: 24,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 28,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 8,
    },
    emptyText: {
        color: "#64748B",
        fontSize: 14,
        lineHeight: 22,
        textAlign: "center",
    },
})
