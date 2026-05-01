import { useState } from "react"
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { useSendChatMessage } from "@/hooks/chat/mutations/use-send-chat-message"
import {
    captureChatComposerImage,
    ChatComposerMutationError,
    ChatComposerSubmitPayload,
    getChatComposerConversationId,
    getChatComposerErrorMessage,
    openChatComposerAttachmentMenu,
    pickChatComposerFile,
    pickChatComposerImage,
} from "@/components/chat/chat-composer-utils"

type Props = {
    conversationId: string
}

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
    }: ChatComposerSubmitPayload) => {
        const numericConversationId = getChatComposerConversationId(conversationId)

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
                onError: (error: ChatComposerMutationError) => {
                    Alert.alert(
                        errorTitle,
                        getChatComposerErrorMessage(error, fallbackMessage)
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
        const nextPayload = await pickChatComposerImage(trimmedText)

        if (nextPayload) {
            submitMessage(nextPayload)
        }
    }

    const handleCaptureImage = async () => {
        const nextPayload = await captureChatComposerImage(trimmedText)

        if (nextPayload) {
            submitMessage(nextPayload)
        }
    }

    const handlePickFile = async () => {
        const nextPayload = await pickChatComposerFile(trimmedText)

        if (nextPayload) {
            submitMessage(nextPayload)
        }
    }

    const handleOpenAttachmentMenu = () => {
        openChatComposerAttachmentMenu({
            onPickImage: () => {
                void handlePickImage()
            },
            onPickFile: () => {
                void handlePickFile()
            },
        })
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.actionSlot}>
                {hasText ? (
                    <TouchableOpacity
                        onPress={handleSend}
                        style={[
                            styles.sendButton,
                            isSending && styles.sendButtonDisabled,
                        ]}
                        disabled={isSending}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="send"
                            size={18}
                            color={isSending ? "#BFDBFE" : "#FFFFFF"}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                                styles.utilityButton,
                                isSending && styles.utilityButtonDisabled,
                            ]}
                            disabled={isSending}
                            onPress={() => {
                                void handleCaptureImage()
                            }}
                        >
                            <Ionicons name="camera-outline" size={19} color="#475569" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                                styles.utilityButton,
                                isSending && styles.utilityButtonDisabled,
                            ]}
                            disabled={isSending}
                            onPress={handleOpenAttachmentMenu}
                        >
                            <Ionicons name="attach-outline" size={19} color="#475569" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.composerCard}>
                <TextInput
                    placeholder="اكتب رسالة..."
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    textAlign="right"
                    textAlignVertical="center"
                    multiline
                    maxLength={1000}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "row-reverse",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 12,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    actionSlot: {
        width: 84,
        minHeight: 54,
        justifyContent: "center",
        alignItems: "center",
    },
    composerCard: {
        flex: 1,
        justifyContent: "center",
        minHeight: 54,
        maxHeight: 132,
        backgroundColor: "#F8FAFC",
        borderRadius: 27,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    quickActions: {
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    utilityButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    utilityButtonDisabled: {
        opacity: 0.55,
    },
    sendButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#2563EB",
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
    },
    sendButtonDisabled: {
        backgroundColor: "#93C5FD",
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#111827",
        lineHeight: 22,
        minHeight: 38,
        maxHeight: 92,
        paddingVertical: 8,
        paddingHorizontal: 0,
    },
})
