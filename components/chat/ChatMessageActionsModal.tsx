import type { ComponentProps } from "react"
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import type { StyleProp, TextStyle } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useThemePreference } from "@/contexts/theme-preference-context"

export type ChatMessageActionItem = {
    key: string
    label: string
    icon: ComponentProps<typeof Ionicons>["name"]
    color: string
    textStyle: StyleProp<TextStyle>
    onPress: () => void
}

type Props = {
    visible: boolean
    title: string
    subtitle: string
    iconName?: ComponentProps<typeof Ionicons>["name"]
    actions: ChatMessageActionItem[]
    onClose: () => void
}

export default function ChatMessageActionsModal({
    visible,
    title,
    subtitle,
    iconName = "ellipsis-horizontal-circle-outline",
    actions,
    onClose,
}: Props) {
    const { colors } = useThemePreference()

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />

                <SafeAreaView edges={[]} style={styles.safeArea}>
                    <View style={[styles.sheet, { backgroundColor: colors.card }]}>
                        <View style={[styles.handle, { backgroundColor: `${colors.mutedForeground}55` }]} />

                        <View style={styles.topBar}>
                            <TouchableOpacity
                                style={[
                                    styles.closeButton,
                                    {
                                        backgroundColor: colors.secondary,
                                        borderColor: colors.border,
                                    },
                                ]}
                                onPress={onClose}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="close-outline" size={18} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View
                            style={[
                                styles.header,
                                { backgroundColor: colors.secondary, borderColor: colors.border },
                            ]}
                        >
                            <View style={[styles.headerIcon, { backgroundColor: `${colors.primary}20` }]}>
                                <Ionicons
                                    name={iconName}
                                    size={22}
                                    color={colors.primary}
                                />
                            </View>

                            <View style={styles.headerCopy}>
                                <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
                                <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={2}>
                                    {subtitle}
                                </Text>
                            </View>
                        </View>

                        {actions.map((action) => (
                            <TouchableOpacity
                                key={action.key}
                                style={[
                                    styles.actionButton,
                                    { backgroundColor: colors.card, borderColor: colors.border },
                                ]}
                                onPress={action.onPress}
                            >
                                <Ionicons
                                    name={action.icon}
                                    size={18}
                                    color={action.color}
                                />
                                <Text style={action.textStyle}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(15, 23, 42, 0.35)",
    },
    backdrop: {
        flex: 1,
    },
    safeArea: {
        justifyContent: "flex-end",
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 24,
    },
    handle: {
        width: 44,
        height: 5,
        borderRadius: 999,
        alignSelf: "center",
        marginTop: 6,
        marginBottom: 16,
    },
    topBar: {
        alignItems: "flex-end",
        marginBottom: 8,
    },
    closeButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    header: {
        flexDirection: "row-reverse",
        alignItems: "center",
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 14,
    },
    headerIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 12,
    },
    headerCopy: {
        flex: 1,
        alignItems: "flex-end",
    },
    title: {
        fontSize: 17,
        fontWeight: "800",
        textAlign: "right",
    },
    subtitle: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 19,
        textAlign: "right",
    },
    actionButton: {
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        minHeight: 52,
        borderRadius: 18,
        borderWidth: 1,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
})
