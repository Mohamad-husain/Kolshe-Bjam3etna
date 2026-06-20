import { useCallback, useEffect, useState } from "react"
import { Alert, Linking, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"

import { useAppSettings, type TranslationKey } from "@/contexts/app-settings-context"
import { useThemePreference } from "@/contexts/theme-preference-context"
import { useSendChatMessage } from "@/hooks/chat/mutations/use-send-chat-message"
import type { ChatUploadInput } from "@/types/chat"

type ChatComposerMutationError = {
    response?: {
        data?: {
            message?: string
        }
    }
    message?: string
}

type ChatComposerSubmitPayload = {
    text?: string
    image?: ChatUploadInput | null
    file?: ChatUploadInput | null
    errorTitle: string
    fallbackMessage: string
}
type Translate = (key: TranslationKey, values?: Record<string, string | number>) => string

const IMAGE_LIBRARY_OPTIONS = {
    mediaTypes: ["images"],
    allowsEditing: true,
    allowsMultipleSelection: false,
    quality: 0.9,
} satisfies ImagePicker.ImagePickerOptions

const CAMERA_OPTIONS = {
    mediaTypes: ["images"],
    allowsEditing: true,
    cameraType: ImagePicker.CameraType.back,
    quality: 0.9,
} satisfies ImagePicker.ImagePickerOptions

const FILE_PICKER_OPTIONS = {
    multiple: false,
    copyToCacheDirectory: true,
    type: "*/*",
    base64: false,
} satisfies DocumentPicker.DocumentPickerOptions

const getAttachmentPreviewUrl = (
    assetUri: string,
    file?: File | null
) => {
    if (
        file &&
        typeof URL !== "undefined" &&
        typeof URL.createObjectURL === "function"
    ) {
        return URL.createObjectURL(file)
    }

    return assetUri
}

const createImageUploadInput = (
    asset: ImagePicker.ImagePickerAsset
): ChatUploadInput => {
    const previewUrl = getAttachmentPreviewUrl(asset.uri || "", asset.file)

    return {
        uri: previewUrl || asset.uri,
        previewUrl,
        name: asset.fileName || asset.file?.name || `chat-image-${Date.now()}.jpg`,
        type: asset.mimeType || asset.file?.type || "image/jpeg",
        file: asset.file,
    }
}

const createFileUploadInput = (
    asset: DocumentPicker.DocumentPickerAsset
): ChatUploadInput => ({
    uri: asset.uri,
    previewUrl: asset.uri,
    name: asset.name || `chat-file-${Date.now()}`,
    type: asset.mimeType || "application/octet-stream",
    file: asset.file,
})

const createImageSubmitPayload = (
    asset: ImagePicker.ImagePickerAsset,
    text: string,
    fallbackMessage: string,
    errorTitle: string
): ChatComposerSubmitPayload => ({
    text,
    image: createImageUploadInput(asset),
    errorTitle,
    fallbackMessage,
})

const getChatComposerConversationId = (conversationId: string, t: Translate) => {
    const numericConversationId = Number(conversationId)

    if (!numericConversationId || Number.isNaN(numericConversationId)) {
        Alert.alert(t("common.loadError"), t("chat.invalidConversation"))
        return null
    }

    return numericConversationId
}

const getChatComposerErrorMessage = (
    error: ChatComposerMutationError,
    fallbackMessage: string
) => error?.response?.data?.message || error?.message || fallbackMessage

const openChatComposerSettings = () => {
    void Linking.openSettings().catch(() => undefined)
}

const showPermissionSettingsAlert = (message: string, t: Translate) => {
    Alert.alert(t("chat.permissionRequired"), message, [
        {
            text: t("common.cancel"),
            style: "cancel",
        },
        {
            text: t("settings.title"),
            onPress: openChatComposerSettings,
        },
    ])
}

const pickChatComposerImage = async (text: string, t: Translate) => {
    try {
        const currentPermission = await ImagePicker.getMediaLibraryPermissionsAsync()

        if (!currentPermission.granted && !currentPermission.canAskAgain) {
            showPermissionSettingsAlert(
                t("chat.mediaPermissionMessage"),
                t
            )
            return null
        }

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permission.granted) {
            if (!permission.canAskAgain) {
                showPermissionSettingsAlert(
                    t("chat.mediaPermissionMessage"),
                    t
                )
            }

            return null
        }

        const result = await ImagePicker.launchImageLibraryAsync(IMAGE_LIBRARY_OPTIONS)

        if (result.canceled || !result.assets?.length) {
            return null
        }

        return createImageSubmitPayload(
            result.assets[0],
            text,
            t("chat.sendImageFailed"),
            t("chat.sendImageTitle")
        )
    } catch (error) {
        Alert.alert(
            t("chat.galleryFailed"),
            error instanceof Error ? error.message : t("chat.openGalleryFailed")
        )
        return null
    }
}

const captureChatComposerImage = async (text: string, t: Translate) => {
    try {
        const result = await ImagePicker.launchCameraAsync(CAMERA_OPTIONS)

        if (result.canceled || !result.assets?.length) {
            return null
        }

        return createImageSubmitPayload(
            result.assets[0],
            text,
            t("chat.sendCapturedImageFailed"),
            t("chat.sendImageTitle")
        )
    } catch (error) {
        Alert.alert(
            t("chat.cameraFailed"),
            error instanceof Error ? error.message : t("chat.openCameraFailed")
        )
        return null
    }
}

const pickChatComposerFile = async (text: string, t: Translate) => {
    const result = await DocumentPicker.getDocumentAsync(FILE_PICKER_OPTIONS)

    if (result.canceled || !result.assets?.length) {
        return null
    }

    return {
        text,
        file: createFileUploadInput(result.assets[0]),
        errorTitle: t("chat.sendFileTitle"),
        fallbackMessage: t("chat.sendFileFailed"),
    } satisfies ChatComposerSubmitPayload
}

const openChatComposerAttachmentMenu = ({
    onPickImage,
    onPickFile,
    t,
}: {
    onPickImage: () => void
    onPickFile: () => void
    t: Translate
}) => {
    Alert.alert(t("chat.attachmentMenuTitle"), t("chat.attachmentMenuMessage"), [
        {
            text: t("chat.attachmentImage"),
            onPress: onPickImage,
        },
        {
            text: t("chat.attachmentFile"),
            onPress: onPickFile,
        },
        {
            text: t("common.cancel"),
            style: "cancel",
        },
    ])
}

type Props = {
    conversationId: string
}

export default function ChatComposer({ conversationId }: Props) {
    const { t } = useAppSettings()
    const { colors } = useThemePreference()
    const [text, setText] = useState("")
    const [pendingCameraText, setPendingCameraText] = useState<string | null>(null)
    const sendChatMessageMutation = useSendChatMessage()
    const isSending = sendChatMessageMutation.isPending
    const trimmedText = text.trim()
    const hasText = trimmedText.length > 0

    const submitMessage = useCallback(
        ({
            text: nextText,
            image,
            file,
            errorTitle,
            fallbackMessage,
        }: ChatComposerSubmitPayload) => {
            const numericConversationId = getChatComposerConversationId(conversationId, t)

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
        },
        [conversationId, sendChatMessageMutation, t]
    )

    useEffect(() => {
        if (pendingCameraText === null) {
            return
        }

        let isCancelled = false

        const resolveCameraCapture = async () => {
            try {
                const currentPermission = await ImagePicker.getCameraPermissionsAsync()

                if (isCancelled) {
                    return
                }

                let permission = currentPermission

                if (!currentPermission.granted && currentPermission.canAskAgain) {
                    permission = await ImagePicker.requestCameraPermissionsAsync()
                }

                if (isCancelled) {
                    return
                }

                if (!permission.granted) {
                    if (!permission.canAskAgain) {
                        showPermissionSettingsAlert(
                            t("chat.cameraPermissionMessage"),
                            t
                        )
                    }

                    setPendingCameraText(null)
                    return
                }

                const nextText = pendingCameraText
                const nextPayload = await captureChatComposerImage(nextText, t)

                if (isCancelled) {
                    return
                }

                if (nextPayload) {
                    submitMessage(nextPayload)
                }

                setPendingCameraText(null)
            } catch (error) {
                if (!isCancelled) {
                    setPendingCameraText(null)
                    Alert.alert(
                        t("chat.cameraPermissionRequestFailed"),
                        error instanceof Error ? error.message : t("chat.cameraPermissionRequestFailed")
                    )
                }
            }
        }

        void resolveCameraCapture()

        return () => {
            isCancelled = true
        }
    }, [pendingCameraText, submitMessage, t])

    const handleSend = () => {
        if (!trimmedText) {
            return
        }

        submitMessage({
            text: trimmedText,
            errorTitle: t("chat.sendFailed"),
            fallbackMessage: t("chat.sendMessageFailed"),
        })
    }

    const handlePickImage = async () => {
        const nextPayload = await pickChatComposerImage(trimmedText, t)

        if (nextPayload) {
            submitMessage(nextPayload)
        }
    }

    const handleCaptureImage = () => {
        setPendingCameraText(trimmedText)
    }

    const handlePickFile = async () => {
        const nextPayload = await pickChatComposerFile(trimmedText, t)

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
            t,
        })
    }

    return (
        <View
            style={[
                styles.wrapper,
                { backgroundColor: colors.card, borderTopColor: colors.border },
            ]}
        >
            <View style={styles.actionSlot}>
                {hasText ? (
                    <TouchableOpacity
                        onPress={handleSend}
                        style={[
                            styles.sendButton,
                            {
                                backgroundColor: isSending ? `${colors.primary}80` : colors.primary,
                                shadowColor: colors.primary,
                            },
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
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                            },
                            isSending && styles.utilityButtonDisabled,
                        ]}
                        disabled={isSending}
                            onPress={() => {
                                void handleCaptureImage()
                            }}
                        >
                            <Ionicons name="camera-outline" size={19} color={colors.mutedForeground} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                            styles.utilityButton,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                            },
                            isSending && styles.utilityButtonDisabled,
                        ]}
                        disabled={isSending}
                            onPress={handleOpenAttachmentMenu}
                        >
                            <Ionicons name="attach-outline" size={19} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View
                style={[
                    styles.composerCard,
                    {
                        backgroundColor: colors.secondary,
                        borderColor: colors.border,
                    },
                ]}
            >
                <TextInput
                    placeholder={t("chat.placeholder")}
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.input, { color: colors.foreground }]}
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
        borderTopWidth: 1,
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
        borderRadius: 27,
        borderWidth: 1,
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
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 4,
        borderWidth: 1,
    },
    utilityButtonDisabled: {
        opacity: 0.55,
    },
    sendButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: "center",
        alignItems: "center",
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
    },
    sendButtonDisabled: {
    },
    input: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
        minHeight: 38,
        maxHeight: 92,
        paddingVertical: 8,
        paddingHorizontal: 0,
    },
})
