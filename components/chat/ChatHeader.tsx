import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import ChatAvatar from "@/components/chat/ChatAvatar"

type Props = {
    title: string
    avatarUrl?: string | null
    avatarColor: string
    onBack: () => void
}

export default function ChatHeader({
    title,
    avatarUrl,
    avatarColor,
    onBack,
}: Props) {
    return (
        <View style={styles.header}>
            <View style={styles.sideSpacer} />

            <View style={styles.userInfo}>
                <ChatAvatar
                    size={35}
                    name={title}
                    imageUrl={avatarUrl}
                    color={avatarColor}
                />

                <View style={styles.userCopy}>
                    <Text style={styles.name} numberOfLines={1}>
                        {title}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                activeOpacity={0.85}
                style={styles.backButton}
                onPress={onBack}
            >
                <Text style={styles.backLabel}>الرسائل</Text>
                <Ionicons name="chevron-forward" size={20} color="#2563EB" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
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
    sideSpacer: {
        width: 0,
    },
    userInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: 0,
    },
    userCopy: {
        alignItems: "flex-start",
        marginLeft: 12,
        flexShrink: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0F172A",
        textAlign: "left",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        width: 78,
        gap: 4,
    },
    backLabel: {
        color: "#2563EB",
        fontSize: 17,
        fontWeight: "700",
    },
})
