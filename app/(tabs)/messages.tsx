import React, { useState } from "react"
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"

import ChatEmptyState from "@/components/chat/ChatEmptyState"
import ConversationListItem from "@/components/chat/ConversationListItem"
import MessagesHeroCard from "@/components/chat/MessagesHeroCard"
import { useChatConversations } from "@/hooks/chat/queries/use-chat-conversations"
import type { ChatConversation } from "@/types/chat"

type Filter = "all" | "unread"

const matchesConversationFilter = (
    conversation: ChatConversation,
    normalizedSearch: string,
    filter: Filter
) => {
    const searchMatch =
        !normalizedSearch ||
        conversation.otherUserName?.toLowerCase().includes(normalizedSearch) ||
        conversation.lastMessageText?.toLowerCase().includes(normalizedSearch)

    const filterMatch = filter === "all" || conversation.unreadCount > 0

    return searchMatch && filterMatch
}

const getUnreadSummary = (unreadCount: number) =>
    unreadCount === 1 ? "1 رسالة غير مقروءة" : `${unreadCount} رسائل غير مقروءة`

export default function MessagesScreen() {
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<Filter>("all")
    const { data, isLoading } = useChatConversations()

    const conversations = data ?? []
    const normalizedSearch = search.trim().toLowerCase()
    const unreadCount = conversations.reduce(
        (sum, conversation) => sum + (conversation.unreadCount || 0),
        0
    )

    const filteredConversations = conversations.filter((conversation) =>
        matchesConversationFilter(conversation, normalizedSearch, filter)
    )

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        )
    }

    return (
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
            <View style={styles.container}>
                <MessagesHeroCard
                    search={search}
                    unreadSummary={getUnreadSummary(unreadCount)}
                    unreadCount={unreadCount}
                    filter={filter}
                    onChangeSearch={setSearch}
                    onChangeFilter={setFilter}
                />

                <FlatList
                    data={filteredConversations}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ConversationListItem
                            item={{
                                name: item.otherUserName,
                                message: item.lastMessageText,
                                unread: item.unreadCount,
                                time: item.lastMessageTime,
                                imageUrl: item.otherUserAvatarUrl,
                            }}
                            onPress={() =>
                                router.push({
                                    pathname: "/chat/[conversationId]",
                                    params: {
                                        conversationId: item.id,
                                        otherUserName: item.otherUserName,
                                        otherUserAvatarUrl: item.otherUserAvatarUrl ?? "",
                                    },
                                })
                            }
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <ChatEmptyState
                            compact
                            iconName="chatbubble-ellipses-outline"
                            title="لا توجد محادثات مطابقة"
                            description="جرّب البحث باسم مختلف أو انتظر حتى تصلك رسالة جديدة."
                        />
                    }
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 16,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
    listContent: {
        paddingTop: 18,
        paddingBottom: 28,
    },
})
