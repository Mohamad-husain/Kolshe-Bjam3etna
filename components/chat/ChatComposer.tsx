import { useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import { useSendChatMessage } from "@/hooks/chat/mutations/use-send-chat-message";
import type { ChatUploadInput } from "@/types/chat";

type ChatComposerMutationError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

type ChatComposerSubmitPayload = {
  text?: string;
  image?: ChatUploadInput | null;
  file?: ChatUploadInput | null;
  errorTitle: string;
  fallbackMessage: string;
};

const IMAGE_LIBRARY_OPTIONS = {
  mediaTypes: ["images"],
  allowsEditing: true,
  allowsMultipleSelection: false,
  quality: 0.9,
} satisfies ImagePicker.ImagePickerOptions;

const CAMERA_OPTIONS = {
  mediaTypes: ["images"],
  allowsEditing: true,
  cameraType: ImagePicker.CameraType.back,
  quality: 0.9,
} satisfies ImagePicker.ImagePickerOptions;

const FILE_PICKER_OPTIONS = {
  multiple: false,
  copyToCacheDirectory: true,
  type: "*/*",
  base64: false,
} satisfies DocumentPicker.DocumentPickerOptions;

const getAttachmentPreviewUrl = (assetUri: string, file?: File | null) => {
  if (
    file &&
    typeof URL !== "undefined" &&
    typeof URL.createObjectURL === "function"
  ) {
    return URL.createObjectURL(file);
  }

  return assetUri;
};

const createImageUploadInput = (
  asset: ImagePicker.ImagePickerAsset,
): ChatUploadInput => {
  const previewUrl = getAttachmentPreviewUrl(asset.uri || "", asset.file);

  return {
    uri: previewUrl || asset.uri,
    previewUrl,
    name: asset.fileName || asset.file?.name || `chat-image-${Date.now()}.jpg`,
    type: asset.mimeType || asset.file?.type || "image/jpeg",
    file: asset.file,
  };
};

const createFileUploadInput = (
  asset: DocumentPicker.DocumentPickerAsset,
): ChatUploadInput => ({
  uri: asset.uri,
  previewUrl: asset.uri,
  name: asset.name || `chat-file-${Date.now()}`,
  type: asset.mimeType || "application/octet-stream",
  file: asset.file,
});

const createImageSubmitPayload = (
  asset: ImagePicker.ImagePickerAsset,
  text: string,
  fallbackMessage: string,
): ChatComposerSubmitPayload => ({
  text,
  image: createImageUploadInput(asset),
  errorTitle: "فشل إرسال الصورة",
  fallbackMessage,
});

const getChatComposerConversationId = (conversationId: string) => {
  const numericConversationId = Number(conversationId);

  if (!numericConversationId || Number.isNaN(numericConversationId)) {
    Alert.alert("خطأ", "معرّف المحادثة غير صالح");
    return null;
  }

  return numericConversationId;
};

const getChatComposerErrorMessage = (
  error: ChatComposerMutationError,
  fallbackMessage: string,
) => error?.response?.data?.message || error?.message || fallbackMessage;

const requestChatComposerCameraPermission = async () => {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "صلاحية مطلوبة",
        "يرجى السماح بالوصول إلى الكاميرا لالتقاط صورة وإرسالها.",
      );
      return false;
    }

    return true;
  } catch (error) {
    Alert.alert(
      "فشل طلب صلاحية الكاميرا",
      error instanceof Error ? error.message : "تعذر طلب صلاحية الكاميرا",
    );
    return false;
  }
};

const pickChatComposerImage = async (text: string) => {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "صلاحية مطلوبة",
        "يرجى السماح بالوصول إلى الصور لاختيار صورة وإرسالها.",
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync(
      IMAGE_LIBRARY_OPTIONS,
    );

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    return createImageSubmitPayload(
      result.assets[0],
      text,
      "تعذر إرسال الصورة",
    );
  } catch (error) {
    Alert.alert(
      "فشل اختيار الصورة",
      error instanceof Error ? error.message : "تعذر فتح معرض الصور",
    );
    return null;
  }
};

const captureChatComposerImage = async (text: string) => {
  const hasPermission = await requestChatComposerCameraPermission();

  if (!hasPermission) {
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync(CAMERA_OPTIONS);

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    return createImageSubmitPayload(
      result.assets[0],
      text,
      "تعذر إرسال الصورة الملتقطة",
    );
  } catch (error) {
    Alert.alert(
      "فشل تشغيل الكاميرا",
      error instanceof Error ? error.message : "تعذر فتح الكاميرا",
    );
    return null;
  }
};

const pickChatComposerFile = async (text: string) => {
  const result = await DocumentPicker.getDocumentAsync(FILE_PICKER_OPTIONS);

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  return {
    text,
    file: createFileUploadInput(result.assets[0]),
    errorTitle: "فشل إرسال الملف",
    fallbackMessage: "تعذر إرسال الملف",
  } satisfies ChatComposerSubmitPayload;
};

const openChatComposerAttachmentMenu = ({
  onPickImage,
  onPickFile,
}: {
  onPickImage: () => void;
  onPickFile: () => void;
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
  ]);
};

type Props = {
  conversationId: string;
};

export default function ChatComposer({ conversationId }: Props) {
  const [text, setText] = useState("");
  const sendChatMessageMutation = useSendChatMessage();
  const isSending = sendChatMessageMutation.isPending;
  const trimmedText = text.trim();
  const hasText = trimmedText.length > 0;

  const submitMessage = ({
    text: nextText,
    image,
    file,
    errorTitle,
    fallbackMessage,
  }: ChatComposerSubmitPayload) => {
    const numericConversationId = getChatComposerConversationId(conversationId);

    if (!numericConversationId) {
      return;
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
          setText("");
        },
        onError: (error: ChatComposerMutationError) => {
          Alert.alert(
            errorTitle,
            getChatComposerErrorMessage(error, fallbackMessage),
          );
        },
      },
    );
  };

  const handleSend = () => {
    if (!trimmedText) {
      return;
    }

    submitMessage({
      text: trimmedText,
      errorTitle: "فشل الإرسال",
      fallbackMessage: "تعذر إرسال الرسالة",
    });
  };

  const handlePickImage = async () => {
    const nextPayload = await pickChatComposerImage(trimmedText);

    if (nextPayload) {
      submitMessage(nextPayload);
    }
  };

  const handleCaptureImage = async () => {
    const nextPayload = await captureChatComposerImage(trimmedText);

    if (nextPayload) {
      submitMessage(nextPayload);
    }
  };

  const handlePickFile = async () => {
    const nextPayload = await pickChatComposerFile(trimmedText);

    if (nextPayload) {
      submitMessage(nextPayload);
    }
  };

  const handleOpenAttachmentMenu = () => {
    openChatComposerAttachmentMenu({
      onPickImage: () => {
        void handlePickImage();
      },
      onPickFile: () => {
        void handlePickFile();
      },
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.actionSlot}>
        {hasText ? (
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
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
                void handleCaptureImage();
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
  );
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
});
