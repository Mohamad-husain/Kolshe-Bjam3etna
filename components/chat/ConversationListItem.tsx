import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ChatAvatar from '@/components/chat/ChatAvatar';
import {
    formatConversationTimestamp,
    getAvatarColor,
    getMessagePreviewText,
} from '@/components/chat/chat-ui';

type Props = {
    item: {
        name: string
        username?: string
        message: string
        unread: number
        time?: string
        label?: string
        color?: string
        imageUrl?: string | null
    }
    onPress: () => void
}

export default function ConversationListItem({ item, onPress }: Props) {
    const timestamp = formatConversationTimestamp(item.time)
    const hasUnread = item.unread > 0
    const displayUsername = item.username?.trim().replace(/^@+/, "") || ""
    const displayName = item.name?.trim() || displayUsername
    const displayLabel = item.label?.trim() || ""
    const displayMessage = getMessagePreviewText(item.message) || "لا توجد رسائل بعد"
    const avatarName = displayName || displayUsername

    return (
        <TouchableOpacity activeOpacity={0.88} style={styles.row} onPress={onPress}>
            <View style={styles.mainSection}>
                <View style={styles.avatarWrapper}>
                    <ChatAvatar
                        size={58}
                        name={avatarName}
                        imageUrl={item.imageUrl}
                        color={item.color || getAvatarColor(avatarName)}
                    />

                    {hasUnread && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.unread}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    {!!displayName && (
                        <Text style={[styles.name, hasUnread && styles.nameUnread]} numberOfLines={1}>
                            {displayName}
                        </Text>
                    )}

                    {!!displayUsername && (
                        <Text style={styles.username} numberOfLines={1}>
                            @{displayUsername}
                        </Text>
                    )}

                    {!!displayLabel && (
                        <Text style={styles.label} numberOfLines={1}>
                            {displayLabel}
                        </Text>
                    )}

                    <Text
                        style={[
                            styles.message,
                            !displayName && !displayLabel && !displayUsername && styles.messageCompact,
                            hasUnread && styles.messageUnread,
                        ]}
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
    label: {
        alignSelf: "flex-end",
        marginTop: 4,
        fontSize: 11,
        lineHeight: 17,
        color: "#2563EB",
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        overflow: "hidden",
    },
    username: {
        width: "100%",
        marginTop: 4,
        color: "#2563EB",
        fontSize: 12,
        fontWeight: "700",
        textAlign: "right",
    },
    message: {
        marginTop: 7,
        fontSize: 13,
        lineHeight: 20,
        color: "#64748B",
        textAlign: "right",
        width: "100%",
    },
    messageCompact: {
        marginTop: 0,
    },
    messageUnread: {
        color: "#1E293B",
        fontWeight: "600",
    },
})
