import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

import ChatAvatar from "@/components/chat/ChatAvatar"
import {
    formatConversationTimestamp,
    getMessagePreviewText,
} from "@/components/chat/chat-message-helpers"
import { getAvatarColor } from "@/components/chat/chat-ui"

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
