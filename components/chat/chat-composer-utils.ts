import { Alert } from "react-native"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"

import type { ChatUploadInput } from "@/types/chat"

export type ChatComposerMutationError = {
    response?: {
        data?: {
            message?: string
        }
    }
    message?: string
}

export type ChatComposerSubmitPayload = {
    text?: string
    image?: ChatUploadInput | null
    file?: ChatUploadInput | null
    errorTitle: string
    fallbackMessage: string
}

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
    fallbackMessage: string
): ChatComposerSubmitPayload => ({
    text,
    image: createImageUploadInput(asset),
    errorTitle: "فشل إرسال الصورة",
    fallbackMessage,
})

export const getChatComposerConversationId = (conversationId: string) => {
    const numericConversationId = Number(conversationId)

    if (!numericConversationId || Number.isNaN(numericConversationId)) {
        Alert.alert("خطأ", "معرّف المحادثة غير صالح")
        return null
    }

    return numericConversationId
}

export const getChatComposerErrorMessage = (
    error: ChatComposerMutationError,
    fallbackMessage: string
) => error?.response?.data?.message || error?.message || fallbackMessage

export const pickChatComposerImage = async (text: string) => {
    try {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permission.granted) {
            Alert.alert(
                "صلاحية مطلوبة",
                "يرجى السماح بالوصول إلى الصور لاختيار صورة وإرسالها."
            )
            return null
        }

        const result = await ImagePicker.launchImageLibraryAsync(IMAGE_LIBRARY_OPTIONS)

        if (result.canceled || !result.assets?.length) {
            return null
        }

        return createImageSubmitPayload(
            result.assets[0],
            text,
            "تعذر إرسال الصورة"
        )
    } catch (error) {
        Alert.alert(
            "فشل اختيار الصورة",
            error instanceof Error ? error.message : "تعذر فتح معرض الصور"
        )
        return null
    }
}

export const captureChatComposerImage = async (text: string) => {
    try {
        const permission = await ImagePicker.requestCameraPermissionsAsync()

        if (!permission.granted) {
            Alert.alert(
                "صلاحية مطلوبة",
                "يرجى السماح بالوصول إلى الكاميرا لالتقاط صورة وإرسالها."
            )
            return null
        }

        const result = await ImagePicker.launchCameraAsync(CAMERA_OPTIONS)

        if (result.canceled || !result.assets?.length) {
            return null
        }

        return createImageSubmitPayload(
            result.assets[0],
            text,
            "تعذر إرسال الصورة الملتقطة"
        )
    } catch (error) {
        Alert.alert(
            "فشل تشغيل الكاميرا",
            error instanceof Error ? error.message : "تعذر فتح الكاميرا"
        )
        return null
    }
}

export const pickChatComposerFile = async (text: string) => {
    const result = await DocumentPicker.getDocumentAsync(FILE_PICKER_OPTIONS)

    if (result.canceled || !result.assets?.length) {
        return null
    }

    return {
        text,
        file: createFileUploadInput(result.assets[0]),
        errorTitle: "فشل إرسال الملف",
        fallbackMessage: "تعذر إرسال الملف",
    } satisfies ChatComposerSubmitPayload
}

export const openChatComposerAttachmentMenu = ({
    onPickImage,
    onPickFile,
}: {
    onPickImage: () => void
    onPickFile: () => void
}) => {
    Alert.alert("إرسال مرفق", "اختر نوع المرفق", [
        {
            text: "صورة",
            onPress: onPickImage,
        },
        {
            text: "ملف",
            onPress: onPickFile,
        },
        {
            text: "إلغاء",
            style: "cancel",
        },
    ])
}
