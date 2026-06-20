import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppSettings } from "@/contexts/app-settings-context"
import { useThemePreference } from "@/contexts/theme-preference-context"

type Filter = "all" | "unread"

type Props = {
    search: string
    unreadSummary: string
    unreadCount: number
    filter: Filter
    onChangeSearch: (value: string) => void
    onChangeFilter: (value: Filter) => void
}

export default function MessagesHeroCard({
    search,
    unreadSummary,
    unreadCount,
    filter,
    onChangeSearch,
    onChangeFilter,
}: Props) {
    const { t, isRtl } = useAppSettings()
    const { colors } = useThemePreference()

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={[styles.title, { color: colors.foreground }]}>{t("messages.title")}</Text>
                    <Text style={[styles.unreadText, { color: colors.primary }]}>{unreadSummary}</Text>
                </View>
            </View>

            <View
                style={[
                    styles.searchBox,
                    {
                        backgroundColor: colors.secondary,
                        borderColor: colors.border,
                        flexDirection: isRtl ? "row-reverse" : "row",
                    },
                ]}
            >
                <Ionicons name="search" size={18} color="#94A3B8" />

                <TextInput
                    placeholder={t("messages.searchPlaceholder")}
                    placeholderTextColor="#94A3B8"
                    style={[
                        styles.searchInput,
                        {
                            color: colors.foreground,
                            textAlign: isRtl ? "right" : "left",
                            marginRight: isRtl ? 8 : 0,
                            marginLeft: isRtl ? 0 : 8,
                        },
                    ]}
                    value={search}
                    onChangeText={onChangeSearch}
                />
            </View>

            <View style={[styles.filters, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                        styles.filterButton,
                        { backgroundColor: colors.secondary },
                        filter === "all" && [styles.filterButtonActive, { backgroundColor: colors.primary }],
                    ]}
                    onPress={() => onChangeFilter("all")}
                >
                    <Text
                        style={[
                            filter === "all" ? styles.filterTextActive : styles.filterText,
                            { color: filter === "all" ? "#FFFFFF" : colors.mutedForeground },
                        ]}
                    >
                        {t("messages.all")}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                        styles.filterButton,
                        { backgroundColor: colors.secondary },
                        filter === "unread" && [styles.filterButtonActive, { backgroundColor: colors.primary }],
                    ]}
                    onPress={() => onChangeFilter("unread")}
                >
                    <Text
                        style={[
                            filter === "unread" ? styles.filterTextActive : styles.filterText,
                            { color: filter === "unread" ? "#FFFFFF" : colors.mutedForeground },
                        ]}
                    >
                        {t("messages.unread")} {unreadCount > 0 ? `(${unreadCount})` : ""}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        marginTop: 10,
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 18,
        borderRadius: 30,
        borderWidth: 1,
        shadowColor: "#0F172A",
        shadowOpacity: 0.06,
        shadowRadius: 20,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        elevation: 2,
    },
    header: {
        alignItems: "center",
        justifyContent: "center",
    },
    headerContent: {
        alignItems: "center",
    },
    title: {
        fontSize: 31,
        fontWeight: "800",
    },
    unreadText: {
        fontSize: 13,
        marginTop: 5,
        fontWeight: "600",
    },
    searchBox: {
        alignItems: "center",
        borderRadius: 18,
        borderWidth: 1,
        paddingHorizontal: 14,
        height: 50,
        marginTop: 20,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 0,
        marginRight: 8,
    },
    filters: {
        marginTop: 16,
    },
    filterButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        marginLeft: 8,
    },
    filterButtonActive: {
    },
    filterText: {
        fontSize: 12,
        fontWeight: "600",
    },
    filterTextActive: {
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "700",
    },
})
