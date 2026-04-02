import { useEffect } from "react"
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated"

type Props = {
    imageUri: string | null
    onClose: () => void
}

export default function ChatImagePreviewModal({ imageUri, onClose }: Props) {
    const previewScale = useSharedValue(1)
    const previewSavedScale = useSharedValue(1)

    useEffect(() => {
        previewScale.value = 1
        previewSavedScale.value = 1
    }, [imageUri, previewSavedScale, previewScale])

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            previewScale.value = Math.min(
                Math.max(previewSavedScale.value * event.scale, 1),
                4
            )
        })
        .onEnd(() => {
            previewSavedScale.value = previewScale.value
        })

    const previewImageAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: previewScale.value }],
    }))

    const handleClose = () => {
        previewScale.value = 1
        previewSavedScale.value = 1
        onClose()
    }

    return (
        <Modal
            visible={!!imageUri}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    onPress={handleClose}
                    activeOpacity={1}
                />

                <SafeAreaView style={styles.safeArea} edges={["top"]}>
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="close-outline" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        {imageUri ? (
                            <GestureDetector gesture={pinchGesture}>
                                <Animated.View
                                    style={[styles.zoomContainer, previewImageAnimatedStyle]}
                                >
                                    <Image
                                        source={{ uri: imageUri }}
                                        contentFit="contain"
                                        style={styles.image}
                                    />
                                </Animated.View>
                            </GestureDetector>
                        ) : null}
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(2, 6, 23, 0.94)",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    closeButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(255,255,255,0.16)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    zoomContainer: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        width: "100%",
        height: "100%",
    },
})
