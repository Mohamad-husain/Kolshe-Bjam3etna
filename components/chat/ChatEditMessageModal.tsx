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
                    <View style={styles.sheet}>
                        <View style={styles.handle} />

                        <View style={styles.topBar}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="close-outline" size={18} color="#2563EB" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.header}>
                            <View style={styles.headerIcon}>
                                <Ionicons name="create-outline" size={22} color="#2563EB" />
                            </View>

                            <View style={styles.headerCopy}>
                                <Text style={styles.title}>تعديل الرسالة</Text>
                                <Text style={styles.subtitle}>
                                    عدّل نص الرسالة ثم احفظ التغييرات.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.fieldWrap}>
                            <TextInput
                                value={value}
                                onChangeText={onChangeText}
                                multiline
                                autoFocus
                                textAlign="right"
                                placeholder="اكتب النص الجديد..."
                                placeholderTextColor="#94A3B8"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={onSave}
                                disabled={isSaving}
                            >
                                <Text style={styles.saveText}>
                                    {isSaving ? "جارٍ الحفظ..." : "حفظ"}
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
        backgroundColor: "#FFFFFF",
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
        backgroundColor: "#CBD5E1",
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
        backgroundColor: "#EFF6FF",
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    header: {
        flexDirection: "row-reverse",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 14,
    },
    headerIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#DBEAFE",
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
        color: "#0F172A",
        textAlign: "right",
    },
    subtitle: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 19,
        color: "#64748B",
        textAlign: "right",
    },
    fieldWrap: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 18,
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
    },
    input: {
        minHeight: 96,
        maxHeight: 220,
        color: "#0F172A",
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
        backgroundColor: "#2563EB",
        borderWidth: 1,
        borderColor: "#2563EB",
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
