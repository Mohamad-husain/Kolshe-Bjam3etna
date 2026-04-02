import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Image } from "expo-image"
import { Ionicons } from "@expo/vector-icons"

import ChatAvatar from "@/components/chat/ChatAvatar"
import {
    formatMessageTime,
    getAvatarColor,
    getDisplayImageUri,
    getFileLabel,
    getMessageBodyText,
} from "@/components/chat/chat-ui"
import type { ChatMessage } from "@/types/chat"

type Props = {
    message: ChatMessage
    avatarColor?: string
    onLongPress?: (message: ChatMessage) => void
    onPressImage?: (imageUri: string) => void
    onPressFile?: (message: ChatMessage) => void
}

export default function ChatMessageBubble({
    message,
    avatarColor,
    onLongPress,
    onPressImage,
    onPressFile,
}: Props) {
    const formattedTime = formatMessageTime(message.createdAt)
    const senderName = message.senderName?.trim() || ""
    const displayImageUri = getDisplayImageUri(message.imageUrl)
    const fileLabel = getFileLabel(message.fileName, message.fileUrl)
    const hasImage = !!displayImageUri
    const hasFile = !!message.fileUrl?.trim() || !!message.fileName.trim()
    const bodyText = getMessageBodyText(message.content, hasImage || hasFile)
    const hasText = !!bodyText

    return (
        <View
            style={[
                styles.row,
                message.isMine ? styles.rowMine : styles.rowOther,
            ]}
        >
            <View
                style={[
                    styles.avatarSlot,
                    message.isMine ? styles.avatarSlotMine : styles.avatarSlotOther,
                ]}
            >
                {!message.isMine ? (
                    <ChatAvatar
                        size={30}
                        name={senderName}
                        imageUrl={message.senderAvatarUrl}
                        color={avatarColor || getAvatarColor(senderName)}
                    />
                ) : null}
            </View>

            <View
                style={[
                    styles.bubbleWrap,
                    message.isMine ? styles.bubbleWrapMine : styles.bubbleWrapOther,
                ]}
            >
                <TouchableOpacity
                    activeOpacity={0.92}
                    onLongPress={onLongPress ? () => onLongPress(message) : undefined}
                    delayLongPress={260}
                    style={[
                        styles.container,
                        (hasImage || hasFile) && styles.containerWithAttachment,
                        message.isMine ? styles.mine : styles.other,
                    ]}
                >
                    {hasImage ? (
                        <TouchableOpacity
                            activeOpacity={0.88}
                            onPress={
                                onPressImage
                                    ? (event) => {
                                        event.stopPropagation()
                                        onPressImage(displayImageUri)
                                    }
                                    : undefined
                            }
                            style={styles.imageButton}
                        >
                            <Image
                                source={{ uri: displayImageUri }}
                                contentFit="cover"
                                style={styles.messageImage}
                            />
                        </TouchableOpacity>
                    ) : null}

                    {hasFile ? (
                        <TouchableOpacity
                            activeOpacity={0.88}
                            style={[
                                styles.fileCard,
                                message.isMine ? styles.fileCardMine : styles.fileCardOther,
                                hasImage && styles.fileCardWithImage,
                            ]}
                            onPress={onPressFile ? () => onPressFile(message) : undefined}
                        >
                            <View style={styles.fileIconWrap}>
                                <Ionicons
                                    name="document-attach-outline"
                                    size={18}
                                    color={message.isMine ? "#FFFFFF" : "#2563EB"}
                                />
                            </View>

                            <View style={styles.fileTextWrap}>
                                <Text
                                    style={[
                                        styles.fileName,
                                        message.isMine ? styles.mineText : styles.otherText,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {fileLabel}
                                </Text>
                                <Text
                                    style={[
                                        styles.fileAction,
                                        message.isMine ? styles.fileActionMine : styles.fileActionOther,
                                    ]}
                                >
                                    فتح الملف
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ) : null}

                    {hasText ? (
                        <Text
                            style={[
                                styles.text,
                                (hasImage || hasFile) && styles.textWithAttachment,
                                message.isMine ? styles.mineText : styles.otherText,
                            ]}
                        >
                            {bodyText}
                        </Text>
                    ) : null}

                    {!!formattedTime && (
                        <Text
                            style={[
                                styles.time,
                                message.isMine ? styles.timeMine : styles.timeOther,
                            ]}
                        >
                            {formattedTime}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        width: "100%",
        alignItems: "flex-end",
        marginVertical: 7,
    },
    rowMine: {
        flexDirection: "row-reverse",
        justifyContent: "flex-start",
    },
    rowOther: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    avatarSlot: {
        width: 38,
        justifyContent: "flex-end",
    },
    avatarSlotMine: {
        width: 0,
        marginLeft: 0,
    },
    avatarSlotOther: {
        marginRight: 10,
    },
    bubbleWrap: {
        maxWidth: "78%",
    },
    bubbleWrapMine: {
        alignItems: "flex-end",
    },
    bubbleWrapOther: {
        alignItems: "flex-start",
    },
    container: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 22,
    },
    containerWithAttachment: {
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    mine: {
        backgroundColor: "#2563EB",
        borderBottomRightRadius: 8,
    },
    other: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderBottomLeftRadius: 8,
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: "right",
    },
    textWithAttachment: {
        marginTop: 10,
    },
    mineText: {
        color: "#FFFFFF",
    },
    otherText: {
        color: "#0F172A",
    },
    time: {
        fontSize: 10,
        marginTop: 6,
        fontWeight: "600",
    },
    timeMine: {
        color: "rgba(255,255,255,0.8)",
        textAlign: "right",
    },
    timeOther: {
        color: "#94A3B8",
        textAlign: "left",
    },
    imageButton: {
        overflow: "hidden",
        width: 220,
        height: 240,
    },
    messageImage: {
        backgroundColor: "#E2E8F0",
        width: 220,
        height: 240,
        borderRadius: 18,
    },
    fileCard: {
        flexDirection: "row-reverse",
        alignItems: "center",
        width: 220,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    fileCardWithImage: {
        marginTop: 10,
    },
    fileCardMine: {
        backgroundColor: "rgba(255,255,255,0.14)",
    },
    fileCardOther: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    fileIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    fileTextWrap: {
        width: 150,
        overflow: "hidden",
        alignItems: "flex-end",
        justifyContent: "center",
        marginRight: 10,
    },
    fileName: {
        fontSize: 13,
        fontWeight: "700",
        textAlign: "right",
        width: "100%",
    },
    fileAction: {
        marginTop: 2,
        fontSize: 11,
        fontWeight: "600",
        alignSelf: "stretch",
        textAlign: "right",
    },
    fileActionMine: {
        color: "rgba(255,255,255,0.8)",
    },
    fileActionOther: {
        color: "#2563EB",
    },
})
