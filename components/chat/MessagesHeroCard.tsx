import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

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
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>الرسائل</Text>
                    <Text style={styles.unreadText}>{unreadSummary}</Text>
                </View>
            </View>

            <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#94A3B8" />

                <TextInput
                    placeholder="ابحث في المحادثات..."
                    placeholderTextColor="#94A3B8"
                    style={styles.searchInput}
                    value={search}
                    onChangeText={onChangeSearch}
                    textAlign="right"
                />
            </View>

            <View style={styles.filters}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
                    onPress={() => onChangeFilter("all")}
                >
                    <Text
                        style={filter === "all" ? styles.filterTextActive : styles.filterText}
                    >
                        الكل
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                        styles.filterButton,
                        filter === "unread" && styles.filterButtonActive,
                    ]}
                    onPress={() => onChangeFilter("unread")}
                >
                    <Text
                        style={filter === "unread" ? styles.filterTextActive : styles.filterText}
                    >
                        غير مقروء {unreadCount > 0 ? `(${unreadCount})` : ""}
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
        backgroundColor: "#FFFFFF",
        borderRadius: 30,
        borderWidth: 1,
        borderColor: "#E5E7EB",
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
        color: "#0F172A",
    },
    unreadText: {
        color: "#2563EB",
        fontSize: 13,
        marginTop: 5,
        fontWeight: "600",
    },
    searchBox: {
        flexDirection: "row-reverse",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 14,
        height: 50,
        marginTop: 20,
    },
    searchInput: {
        flex: 1,
        textAlign: "right",
        color: "#0F172A",
        fontSize: 15,
        paddingVertical: 0,
        marginRight: 8,
    },
    filters: {
        flexDirection: "row-reverse",
        marginTop: 16,
    },
    filterButton: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        marginLeft: 8,
    },
    filterButtonActive: {
        backgroundColor: "#2563EB",
    },
    filterText: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "600",
    },
    filterTextActive: {
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "700",
    },
})
