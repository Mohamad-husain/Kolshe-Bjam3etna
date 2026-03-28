import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import ConversationListItem from '@/components/chat/ConversationListItem';
import { useChatConversations } from '@/hooks/chat/queries/use-chat-conversations';
import type { ChatConversation } from '@/types/chat';

type Filter = "all" | "unread"

const matchesConversationFilter = (
    conversation: ChatConversation,
    normalizedSearch: string,
    filter: Filter
) => {
    const searchMatch =
        !normalizedSearch ||
        conversation.otherUserName?.toLowerCase().includes(normalizedSearch) ||
        conversation.otherUserUsername?.toLowerCase().includes(normalizedSearch) ||
        conversation.lastMessageText?.toLowerCase().includes(normalizedSearch)

    const filterMatch = filter === "all" || conversation.unreadCount > 0

    return searchMatch && filterMatch
}

export default function MessagesScreen() {
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<Filter>("all")
    const { data, isLoading } = useChatConversations()

    const conversations = useMemo(() => data ?? [], [data])
    const normalizedSearch = search.trim().toLowerCase()

    const unreadCount = conversations.reduce(
        (sum, c) => sum + (c.unreadCount || 0),
        0
    )
    const unreadSummary =
        unreadCount === 1
            ? "1 رسالة غير مقروءة"
            : `${unreadCount} رسائل غير مقروءة`

    const filteredConversations = useMemo(() => {
        return conversations.filter((conversation) =>
            matchesConversationFilter(conversation, normalizedSearch, filter)
        )
    }, [conversations, normalizedSearch, filter])

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
                <View style={styles.heroCard}>
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Text style={styles.title}>الرسائل</Text>
                            <Text style={styles.unreadText}>
                                {unreadSummary}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={18} color="#94A3B8" />

                        <TextInput
                            placeholder="ابحث في المحادثات..."
                            placeholderTextColor="#94A3B8"
                            style={styles.searchInput}
                            value={search}
                            onChangeText={setSearch}
                            textAlign="right"
                        />
                    </View>

                    <View style={styles.filters}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[styles.filterBtn, filter === "all" && styles.filterActive]}
                            onPress={() => setFilter("all")}
                        >
                            <Text
                                style={
                                    filter === "all"
                                        ? styles.filterTextActive
                                        : styles.filterText
                                }
                            >
                                الكل
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[styles.filterBtn, filter === "unread" && styles.filterActive]}
                            onPress={() => setFilter("unread")}
                        >
                            <Text
                                style={
                                    filter === "unread"
                                        ? styles.filterTextActive
                                        : styles.filterText
                                }
                            >
                                غير مقروء {unreadCount > 0 ? `(${unreadCount})` : ""}
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>

                <FlatList
                    data={filteredConversations}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <ConversationListItem
                            item={{
                                name: item.otherUserName,
                                username: item.otherUserUsername,
                                message: item.lastMessageText,
                                unread: item.unreadCount,
                                time: item.lastMessageTime,
                                label: item.contextLabel,
                                imageUrl: item.otherUserAvatarUrl,
                            }}
                            onPress={() =>
                                router.push({
                                    pathname: "/chat/[conversationId]",
                                    params: {
                                        conversationId: String(item.id),
                                        otherUserName: item.otherUserName,
                                        otherUserUsername: item.otherUserUsername,
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
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="chatbubble-ellipses-outline" size={26} color="#2563EB" />
                            </View>
                            <Text style={styles.emptyTitle}>لا توجد محادثات مطابقة</Text>
                            <Text style={styles.emptyText}>
                                جرّب البحث باسم مختلف أو انتظر حتى تصلك رسالة جديدة.
                            </Text>
                        </View>
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
    heroCard: {
        marginTop: 10,
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 18,
        backgroundColor: "#FFFFFF",
        borderRadius: 30,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#0F172A",
        shadowOpacity: 0.06,
        shadowRadius: 20,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        elevation: 2,
    },
    header: {
        alignItems: "center",
        justifyContent: "center",
    },
    headerContent: {
        alignItems: "center",
    },
    title: {
        fontSize: 31,
        fontWeight: "800",
        color: "#0F172A",
    },
    unreadText: {
        color: "#2563EB",
        fontSize: 13,
        marginTop: 5,
        fontWeight: "600",
    },
    searchBox: {
        flexDirection: "row-reverse",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 14,
        height: 50,
        marginTop: 20,
    },
    searchInput: {
        flex: 1,
        textAlign: "right",
        color: "#0F172A",
        fontSize: 15,
        paddingVertical: 0,
        marginRight: 8,
    },
    filters: {
        flexDirection: "row-reverse",
        marginTop: 16,
    },
    filterBtn: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        marginLeft: 8,
    },
    filterActive: {
        backgroundColor: "#2563EB",
    },
    filterText: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "600",
    },
    filterTextActive: {
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "700",
    },
    listContent: {
        paddingTop: 18,
        paddingBottom: 28,
    },
    emptyContainer: {
        marginTop: 40,
        alignItems: "center",
        paddingHorizontal: 24,
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
