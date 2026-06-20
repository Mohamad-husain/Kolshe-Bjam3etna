import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

import { useAppSettings } from "@/contexts/app-settings-context"
import { useThemePreference } from "@/contexts/theme-preference-context"

type Props = {
    visible: boolean
    value: string
    isSaving: boolean
    onChangeText: (value: string) => void
    onSave: () => void
    onClose: () => void
}

export default function ChatEditMessageModal({
    visible,
    value,
    isSaving,
    onChangeText,
    onSave,
    onClose,
}: Props) {
    const { t } = useAppSettings()
    const { colors } = useThemePreference()

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={0}
            >
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
                                <Ionicons name="create-outline" size={22} color={colors.primary} />
                            </View>

                            <View style={styles.headerCopy}>
                                <Text style={[styles.title, { color: colors.foreground }]}>{t("chat.editTitle")}</Text>
                                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                                    {t("chat.editSubtitle")}
                                </Text>
                            </View>
                        </View>

                        <View
                            style={[
                                styles.fieldWrap,
                                { backgroundColor: colors.secondary, borderColor: colors.border },
                            ]}
                        >
                            <TextInput
                                value={value}
                                onChangeText={onChangeText}
                                multiline
                                autoFocus
                                textAlign="right"
                                placeholder={t("chat.editPlaceholder")}
                                placeholderTextColor={colors.mutedForeground}
                                style={[styles.input, { color: colors.foreground }]}
                            />
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    {
                                        backgroundColor: colors.primary,
                                        borderColor: colors.primary,
                                    },
                                ]}
                                onPress={onSave}
                                disabled={isSaving}
                            >
                                <Text style={styles.saveText}>
                                    {isSaving ? t("chat.saving") : t("chat.save")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
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
        flexShrink: 1,
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 16,
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
    fieldWrap: {
        borderWidth: 1,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
    },
    input: {
        minHeight: 96,
        maxHeight: 220,
        fontSize: 15,
        lineHeight: 24,
        textAlignVertical: "top",
    },
    actions: {
        gap: 10,
    },
    saveButton: {
        minHeight: 52,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    saveText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#FFFFFF",
        textAlign: "center",
    },
})
