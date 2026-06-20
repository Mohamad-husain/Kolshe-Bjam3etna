import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

import ChatAvatar from "@/components/chat/ChatAvatar"
import {
    formatConversationTimestamp,
    getMessagePreviewText,
} from "@/components/chat/chat-message-helpers"
import { getAvatarColor } from "@/components/chat/chat-ui"
import { useAppSettings } from "@/contexts/app-settings-context"
import { useThemePreference } from "@/contexts/theme-preference-context"

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
    const { isRtl, language, t } = useAppSettings()
    const { colors } = useThemePreference()
    const timestamp = formatConversationTimestamp(item.time, language)
    const hasUnread = item.unread > 0
    const displayName = item.name?.trim() || ""
    const displayMessage = getMessagePreviewText(item.message, {
        image: t("chat.attachmentImage"),
        file: t("chat.attachmentFile"),
    }) || t("messages.noMessages")

    return (
        <TouchableOpacity
            activeOpacity={0.88}
            style={[
                styles.row,
                {
                    backgroundColor: colors.background,
                    borderBottomColor: colors.border,
                    flexDirection: isRtl ? "row-reverse" : "row",
                },
            ]}
            onPress={onPress}
        >
            <View style={[styles.mainSection, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
                <View style={styles.avatarWrapper}>
                    <ChatAvatar
                        size={58}
                        name={displayName}
                        imageUrl={item.imageUrl}
                        color={getAvatarColor(displayName)}
                    />

                    {hasUnread && (
                        <View style={[styles.badge, { borderColor: colors.background }]}>
                            <Text style={styles.badgeText}>{item.unread}</Text>
                        </View>
                    )}
                </View>

                <View style={[styles.content, { alignItems: isRtl ? "flex-end" : "flex-start" }]}>
                    <Text
                        style={[
                            styles.name,
                            {
                                color: hasUnread ? colors.foreground : colors.foreground,
                                textAlign: isRtl ? "right" : "left",
                            },
                            hasUnread && styles.nameUnread,
                        ]}
                        numberOfLines={1}
                    >
                        {displayName}
                    </Text>

                    <Text
                        style={[
                            styles.message,
                            {
                                color: hasUnread ? colors.foreground : colors.mutedForeground,
                                textAlign: isRtl ? "right" : "left",
                            },
                            hasUnread && styles.messageUnread,
                        ]}
                        numberOfLines={1}
                    >
                        {displayMessage}
                    </Text>
                </View>
            </View>

            <View style={styles.meta}>
                {!!timestamp && <Text style={[styles.time, { color: colors.mutedForeground }]}>{timestamp}</Text>}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    row: {
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingHorizontal: 2,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    mainSection: {
        flex: 1,
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
        width: "100%",
    },
    nameUnread: {
    },
    message: {
        marginTop: 7,
        fontSize: 13,
        lineHeight: 20,
        width: "100%",
    },
    messageUnread: {
        fontWeight: "600",
    },
})
