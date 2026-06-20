export const CHAT_AVATAR_COLORS = [
    "#2563EB",
    "#22C55E",
    "#38BDF8",
    "#F59E0B",
    "#A855F7",
    "#F97316",
] as const

const CHAT_API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "")
    .trim()
    .replace(/\/$/, "")

export function getAvatarColor(seed?: string | null) {
    const value = (seed ?? "").trim()

    if (!value) {
        return CHAT_AVATAR_COLORS[0]
    }

    const index =
        value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
        CHAT_AVATAR_COLORS.length

    return CHAT_AVATAR_COLORS[index]
}

export function getAvatarInitial(name?: string | null) {
    const value = (name ?? "").trim()
    return value[0]?.toUpperCase() ?? "U"
}

export function getValidChatAssetUri(value?: string | null) {
    const uri = value?.trim()

    if (!uri) {
        return null
    }

    if (
        uri.startsWith("http://") ||
        uri.startsWith("https://") ||
        uri.startsWith("data:") ||
        uri.startsWith("file:") ||
        uri.startsWith("blob:") ||
        uri.startsWith("content:")
    ) {
        return uri
    }

    if (!CHAT_API_BASE_URL) {
        return null
    }

    if (uri.startsWith("/")) {
        return `${CHAT_API_BASE_URL}${uri}`
    }

    return `${CHAT_API_BASE_URL}/${uri.replace(/^\/+/, "")}`
}
