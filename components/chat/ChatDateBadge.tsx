import { StyleSheet, Text, View } from "react-native"
import { useThemePreference } from "@/contexts/theme-preference-context"

type Props = {
    label: string
}

export default function ChatDateBadge({ label }: Props) {
    const { colors } = useThemePreference()

    if (!label) {
        return null
    }

    return (
        <View style={styles.wrap}>
            <Text
                style={[
                    styles.text,
                    { backgroundColor: colors.secondary, color: colors.mutedForeground },
                ]}
            >
                {label}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: "center",
        marginBottom: 12,
    },
    text: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        fontSize: 12,
        fontWeight: "700",
    },
})
