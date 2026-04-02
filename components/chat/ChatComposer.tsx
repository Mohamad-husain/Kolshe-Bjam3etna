import { useState } from "react"
import {
    Alert,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"

import { useSendChatMessage } from "@/hooks/chat/mutations/use-send-chat-message"
import type { ChatUploadInput } from "@/types/chat"

type Props = {
    conversationId: string
}

type MutationError = {
    response?: {
        data?: {
            message?: string
        }
    }
    message?: string
}

const getNumericConversationId = (conversationId: string) => {
    const numericConversationId = Number(conversationId)

    if (!numericConversationId || Number.isNaN(numericConversationId)) {
        Alert.alert("خطأ", "معرّف المحادثة غير صالح")
        return null
    }

    return numericConversationId
}

const getMutationErrorMessage = (
    error: MutationError,
    fallbackMessage: string
) => error?.response?.data?.message || error?.message || fallbackMessage

const getImageUploadInput = (asset: ImagePicker.ImagePickerAsset): ChatUploadInput => {
    const previewUrl =
        asset.file &&
        typeof URL !== "undefined" &&
        typeof URL.createObjectURL === "function"
            ? URL.createObjectURL(asset.file)
            : asset.uri || ""

    return {
        uri: previewUrl || asset.uri,
        previewUrl,
        name: asset.fileName || asset.file?.name || `chat-image-${Date.now()}.jpg`,
        type: asset.mimeType || asset.file?.type || "image/jpeg",
        file: asset.file,
    }
}

const getFileUploadInput = (
    asset: DocumentPicker.DocumentPickerAsset
): ChatUploadInput => ({
    uri: asset.uri,
    previewUrl: asset.uri,
    name: asset.name || `chat-file-${Date.now()}`,
    type: asset.mimeType || "application/octet-stream",
    file: asset.file,
})

export default function ChatComposer({ conversationId }: Props) {
    const [text, setText] = useState("")
    const sendChatMessageMutation = useSendChatMessage()
    const isSending = sendChatMessageMutation.isPending
    const trimmedText = text.trim()
    const hasText = trimmedText.length > 0

    const submitMessage = ({
        text: nextText,
        image,
        file,
        errorTitle,
        fallbackMessage,
    }: {
        text?: string
        image?: ChatUploadInput | null
        file?: ChatUploadInput | null
        errorTitle: string
        fallbackMessage: string
    }) => {
        const numericConversationId = getNumericConversationId(conversationId)

        if (!numericConversationId) {
            return
        }

        sendChatMessageMutation.mutate(
            {
                conversationId: numericConversationId,
                text: nextText?.trim() || undefined,
                image,
                file,
            },
            {
                onSuccess: () => {
                    setText("")
                },
                onError: (error: MutationError) => {
                    Alert.alert(
                        errorTitle,
                        getMutationErrorMessage(error, fallbackMessage)
                    )
                },
            }
        )
    }

    const handleSend = () => {
        if (!trimmedText) {
            return
        }

        submitMessage({
            text: trimmedText,
            errorTitle: "فشل الإرسال",
            fallbackMessage: "تعذر إرسال الرسالة",
        })
    }

    const handlePickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permission.granted) {
            Alert.alert("صلاحية مطلوبة", "يرجى السماح بالوصول إلى الصور لاختيار صورة وإرسالها.")
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            allowsMultipleSelection: false,
            quality: 0.9,
        })

        if (result.canceled || !result.assets?.length) {
            return
        }

        submitMessage({
            text: trimmedText,
            image: getImageUploadInput(result.assets[0]),
            errorTitle: "فشل إرسال الصورة",
            fallbackMessage: "تعذر إرسال الصورة",
        })
    }

    const handlePickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            multiple: false,
            copyToCacheDirectory: true,
            type: "*/*",
            base64: false,
        })

        if (result.canceled || !result.assets?.length) {
            return
        }

        submitMessage({
            text: trimmedText,
            file: getFileUploadInput(result.assets[0]),
            errorTitle: "فشل إرسال الملف",
            fallbackMessage: "تعذر إرسال الملف",
        })
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="اكتب رسالة..."
                    placeholderTextColor="#A1A1AA"
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    textAlign="right"
                    returnKeyType="send"
                    blurOnSubmit={false}
                    onSubmitEditing={handleSend}
                />
            </View>

            <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.utilityButton, isSending && styles.utilityButtonDisabled]}
                disabled={isSending}
                onPress={() => {
                    void handlePickFile()
                }}
            >
                <Ionicons name="document-attach-outline" size={20} color="#A1A1AA" />
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.utilityButton, isSending && styles.utilityButtonDisabled]}
                disabled={isSending}
                onPress={() => {
                    void handlePickImage()
                }}
            >
                <Ionicons name="image-outline" size={20} color="#A1A1AA" />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleSend}
                style={[
                    styles.sendButton,
                    !hasText && styles.sendButtonIdle,
                    isSending && styles.sendButtonDisabled,
                ]}
                disabled={!hasText || isSending}
                activeOpacity={0.8}
            >
                <Ionicons
                    name="send"
                    size={20}
                    color={
                        isSending
                            ? "#BFDBFE"
                            : hasText
                                ? "#FFFFFF"
                                : "#94A3B8"
                    }
                />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 14,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    utilityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 4,
    },
    utilityButtonDisabled: {
        opacity: 0.55,
    },
    sendButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginHorizontal: 4,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonIdle: {
        backgroundColor: "#E2E8F0",
    },
    sendButtonDisabled: {
        backgroundColor: "#93C5FD",
    },
    inputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        minHeight: 46,
        backgroundColor: "#F8FAFC",
        borderRadius: 23,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 12,
        marginHorizontal: 6,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#111827",
        paddingVertical: 0,
    },
})
