import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

import ChatAvatar from "@/components/chat/ChatAvatar"
import {
    DELETED_MESSAGE_PREVIEW,
    EDITED_MESSAGE_PREVIEW,
    isDeletedMessageContent,
} from "@/hooks/chat/mutations/chat-mutation-utils"

const CHAT_AVATAR_COLORS = [
    "#2563EB",
    "#22C55E",
    "#38BDF8",
    "#F59E0B",
    "#A855F7",
    "#F97316",
] as const

const ISO_UTC_WITHOUT_ZONE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/

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

function getMessagePreviewText(value?: string | null) {
    const text = value?.trim()

    if (!text) {
        return ""
    }

    if (isDeletedMessageContent(text)) {
        return DELETED_MESSAGE_PREVIEW
    }

    if (/^\[(edited|updated)\]$/i.test(text) || /^edited$/i.test(text)) {
        return EDITED_MESSAGE_PREVIEW
    }

    if (/^\[(image|photo)\]$/i.test(text)) {
        return "صورة"
    }

    if (/^\[(file|document|attachment)\]$/i.test(text)) {
        return "ملف"
    }

    return text
}

function formatConversationTimestamp(value?: string | null) {
    const date = parseChatDate(value)

    if (!date) {
        return ""
    }

    const now = new Date()

    if (isSameCalendarDay(date, now)) {
        return date.toLocaleTimeString("ar", {
            hour: "numeric",
            minute: "2-digit",
        })
    }

    if (isYesterdayDate(date, now)) {
        return "أمس"
    }

    const diffMs = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 7) {
        return date.toLocaleDateString("ar", { weekday: "short" })
    }

    return date.toLocaleDateString("ar", {
        month: "numeric",
        day: "numeric",
    })
}

type Props = {
    item: {
        name: string
        message: string
        unread: number
        time?: string
        imageUrl?: string | null
    }
    onPress: () => void
}

export default function ConversationListItem({ item, onPress }: Props) {
    const timestamp = formatConversationTimestamp(item.time)
    const hasUnread = item.unread > 0
    const displayName = item.name?.trim() || ""
    const displayMessage = getMessagePreviewText(item.message) || "لا توجد رسائل بعد"

    return (
        <TouchableOpacity activeOpacity={0.88} style={styles.row} onPress={onPress}>
            <View style={styles.mainSection}>
                <View style={styles.avatarWrapper}>
                    <ChatAvatar
                        size={58}
                        name={displayName}
                        imageUrl={item.imageUrl}
                        color={getAvatarColor(displayName)}
                    />

                    {hasUnread && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.unread}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    <Text style={[styles.name, hasUnread && styles.nameUnread]} numberOfLines={1}>
                        {displayName}
                    </Text>

                    <Text
                        style={[styles.message, hasUnread && styles.messageUnread]}
                        numberOfLines={1}
                    >
                        {displayMessage}
                    </Text>
                </View>
            </View>

            <View style={styles.meta}>
                {!!timestamp && <Text style={styles.time}>{timestamp}</Text>}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row-reverse",
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingHorizontal: 2,
        paddingVertical: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#EEF2F7",
    },
    mainSection: {
        flex: 1,
        flexDirection: "row-reverse",
        alignItems: "center",
        minWidth: 0,
    },
    avatarWrapper: {
        position: "relative",
        marginLeft: 12,
    },
    meta: {
        width: 42,
        alignItems: "flex-end",
        justifyContent: "flex-start",
        paddingTop: 4,
    },
    time: {
        fontSize: 11,
        color: "#9CA3AF",
        fontWeight: "600",
    },
    badge: {
        position: "absolute",
        top: -3,
        left: -5,
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        paddingHorizontal: 7,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    content: {
        flex: 1,
        alignItems: "flex-end",
        justifyContent: "center",
        minWidth: 0,
    },
    name: {
        fontWeight: "800",
        fontSize: 16,
        color: "#1F2937",
        textAlign: "right",
        width: "100%",
    },
    nameUnread: {
        color: "#0F172A",
    },
    message: {
        marginTop: 7,
        fontSize: 13,
        lineHeight: 20,
        color: "#64748B",
        textAlign: "right",
        width: "100%",
    },
    messageUnread: {
        color: "#1E293B",
        fontWeight: "600",
    },
})
