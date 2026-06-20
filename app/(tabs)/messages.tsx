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
import { useAppSettings } from "@/contexts/app-settings-context"
import { useThemePreference } from "@/contexts/theme-preference-context"
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

export default function MessagesScreen() {
    const { t } = useAppSettings()
    const { colors } = useThemePreference()
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
            <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        )
    }

    return (
        <SafeAreaView edges={["top"]} style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <MessagesHeroCard
                    search={search}
                    unreadSummary={
                        unreadCount === 1
                            ? t("messages.singleUnread")
                            : t("messages.unreadSummary", { count: unreadCount })
                    }
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
                            title={t("messages.emptyTitle")}
                            description={t("messages.emptyBody")}
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
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        paddingTop: 18,
        paddingBottom: 28,
    },
})
