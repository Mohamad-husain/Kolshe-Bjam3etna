import { useState } from "react"
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Ionicons } from "@expo/vector-icons"

import { useSendImage } from "@/hooks/chat/mutations/use-send-image"
import { useSendMessage } from "@/hooks/chat/mutations/use-send-message"

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
) =>
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage

const getSelectedImagePayload = (asset: ImagePicker.ImagePickerAsset) => {
    const previewUrl =
        asset.file &&
        typeof URL !== "undefined" &&
        typeof URL.createObjectURL === "function"
            ? URL.createObjectURL(asset.file)
            : asset.uri || ""
    const normalizedFileName =
        asset.fileName ||
        asset.file?.name ||
        `chat-image-${Date.now()}.jpg`
    const normalizedMimeType =
        asset.mimeType ||
        asset.file?.type ||
        "image/jpeg"

    return {
        previewUrl,
        image: {
            uri: previewUrl || asset.uri,
            previewUrl,
            name: normalizedFileName,
            type: normalizedMimeType,
            file: asset.file,
        },
    }
}

export default function ChatComposer({ conversationId }: Props) {
    const [text, setText] = useState("")
    const sendMessageMutation = useSendMessage()
    const sendImageMutation = useSendImage()
    const isSending = sendMessageMutation.isPending || sendImageMutation.isPending

    const trimmedText = text.trim()
    const hasText = trimmedText.length > 0

    const handleSend = () => {
        if (!trimmedText) return

        const numericConversationId = getNumericConversationId(conversationId)

        if (!numericConversationId) {
            return
        }

        sendMessageMutation.mutate(
            {
                conversationId: numericConversationId,
                text: trimmedText,
            },
            {
                onSuccess: () => {
                    setText("")
                },
                onError: (error: MutationError) => {
                    console.log("sendMessage error:", error?.response?.data || error)

                    Alert.alert(
                        "فشل الإرسال",
                        getMutationErrorMessage(error, "تعذر إرسال الرسالة")
                    )
                },
            }
        )
    }

    const handlePickImage = async () => {
        const numericConversationId = getNumericConversationId(conversationId)

        if (!numericConversationId) {
            return
        }

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permission.granted) {
            Alert.alert("صلاحية مطلوبة", "يرجى السماح بالوصول إلى الصور لاختيار صورة وإرسالها.")
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.9,
        })

        if (result.canceled || !result.assets?.length) {
            return
        }

        const selectedImage = result.assets[0]
        const { previewUrl, image } = getSelectedImagePayload(selectedImage)

        if (!previewUrl && !selectedImage.file) {
            Alert.alert("فشل اختيار الصورة", "تعذر تجهيز الصورة للإرسال. جرّب صورة أخرى.")
            return
        }

        sendImageMutation.mutate(
            {
                conversationId: numericConversationId,
                caption: trimmedText,
                image,
            },
            {
                onSuccess: () => {
                    setText("")
                },
                onError: (error: MutationError) => {
                    console.log("sendImage error:", error?.response?.data || error)

                    Alert.alert(
                        "فشل إرسال الصورة",
                        getMutationErrorMessage(error, "تعذر إرسال الصورة")
                    )
                },
            }
        )
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
                style={[
                    styles.utilityButton,
                    isSending && styles.utilityButtonDisabled,
                ]}
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
