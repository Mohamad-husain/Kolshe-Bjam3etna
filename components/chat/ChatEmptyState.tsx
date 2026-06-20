import type { ComponentProps } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemePreference } from "@/contexts/theme-preference-context"

type Props = {
    iconName: ComponentProps<typeof Ionicons>["name"]
    title: string
    description: string
    compact?: boolean
}

export default function ChatEmptyState({
    iconName,
    title,
    description,
    compact = false,
}: Props) {
    const { colors } = useThemePreference()

    return (
        <View style={[styles.container, compact && styles.containerCompact]}>
            <View style={[styles.icon, { backgroundColor: colors.secondary }]}>
                <Ionicons name={iconName} size={26} color={colors.primary} />
            </View>

            <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 28,
    },
    containerCompact: {
        marginTop: 72,
        flex: 0,
        paddingHorizontal: 24,
    },
    icon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 8,
        textAlign: "center",
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: "center",
    },
})
