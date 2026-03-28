import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import ChatAvatar from '@/components/chat/ChatAvatar';
import {
    formatMessageTime,
    getAvatarColor,
    getDisplayImageUri,
    getMessageBodyText,
} from '@/components/chat/chat-ui';

type Props = {
    message: {
        content: string
        imageUrl?: string | null
        isMine: boolean
        createdAt?: string
        senderName?: string
        senderAvatarUrl?: string | null
    }
    avatarColor?: string
}

export default function ChatMessageBubble({ message, avatarColor }: Props) {
    const formattedTime = formatMessageTime(message.createdAt)
    const senderName = message.senderName?.trim() || ""
    const resolvedImageUri = getDisplayImageUri(message.imageUrl)
    const hasImage = !!resolvedImageUri
    const bodyText = getMessageBodyText(message.content, hasImage)
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
                <View
                    style={[
                        styles.container,
                        hasImage && styles.containerWithImage,
                        message.isMine ? styles.mine : styles.other,
                    ]}
                >
                    {hasImage ? (
                        <Image
                            source={{ uri: resolvedImageUri || undefined }}
                            contentFit="cover"
                            style={styles.messageImage}
                        />
                    ) : null}

                    {hasText ? (
                        <Text
                            style={[
                                styles.text,
                                hasImage && styles.textWithImage,
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
                </View>
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
        maxWidth: "76%",
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
    containerWithImage: {
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
    textWithImage: {
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
    messageImage: {
        width: 220,
        height: 240,
        borderRadius: 18,
        backgroundColor: "#E2E8F0",
    },
})
