import { StyleSheet, Text, View } from "react-native"

type Props = {
    label: string
}

export default function ChatDateBadge({ label }: Props) {
    if (!label) {
        return null
    }

    return (
        <View style={styles.wrap}>
            <Text style={styles.text}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: "center",
        marginBottom: 12,
    },
    text: {
        backgroundColor: "#E2E8F0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        fontSize: 12,
        color: "#475569",
        fontWeight: "700",
    },
})
