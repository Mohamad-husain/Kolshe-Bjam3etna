import type { ComponentProps } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

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
    return (
        <View style={[styles.container, compact && styles.containerCompact]}>
            <View style={styles.icon}>
                <Ionicons name={iconName} size={26} color="#2563EB" />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
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
        marginTop: 40,
        flex: 0,
        paddingHorizontal: 24,
    },
    icon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 8,
        textAlign: "center",
    },
    description: {
        color: "#64748B",
        fontSize: 14,
        lineHeight: 22,
        textAlign: "center",
    },
})
