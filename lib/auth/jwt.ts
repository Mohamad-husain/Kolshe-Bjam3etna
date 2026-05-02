export type JwtPayload = Record<string, unknown>

type BufferDecoder = {
    from: (value: string, encoding: string) => {
        toString: (outputEncoding: string) => string
    }
}

export const jwtClaimKeys = {
    displayName: [
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
        "name",
        "unique_name",
        "fullName",
        "full_name",
    ],
    nameIdentifier: [
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
        "nameid",
        "sub",
    ],
    roles: [
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role",
        "role",
        "roles",
    ],
} as const

const getBase64Decoder = () => {
    if (typeof atob === "function") {
        return (value: string) => atob(value)
    }

    const bufferDecoder = (globalThis as { Buffer?: BufferDecoder }).Buffer

    if (bufferDecoder) {
        return (value: string) => bufferDecoder.from(value, "base64").toString("utf-8")
    }

    return null
}

const decodeBase64Url = (value: string) => {
    const decoder = getBase64Decoder()

    if (!decoder) {
        return null
    }

    const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/")
    const paddedValue = normalizedValue.padEnd(
        normalizedValue.length + ((4 - (normalizedValue.length % 4)) % 4),
        "="
    )

    try {
        return decoder(paddedValue)
    } catch {
        return null
    }
}

const getStringValues = (value: unknown): string[] => {
    if (typeof value === "string") {
        const normalizedValue = value.trim()
        return normalizedValue ? [normalizedValue] : []
    }

    if (Array.isArray(value)) {
        return value.flatMap(getStringValues)
    }

    return []
}

export function decodeJwtPayload(token?: string | null): JwtPayload | null {
    const normalizedToken = token?.trim()

    if (!normalizedToken) {
        return null
    }

    const [, encodedPayload = ""] = normalizedToken.split(".")

    if (!encodedPayload) {
        return null
    }

    const decodedPayload = decodeBase64Url(encodedPayload)

    if (!decodedPayload) {
        return null
    }

    try {
        return JSON.parse(decodedPayload) as JwtPayload
    } catch {
        return null
    }
}

export function getJwtStringClaim(
    payload: JwtPayload | null,
    claimKeys: readonly string[]
) {
    if (!payload) {
        return ""
    }

    for (const claimKey of claimKeys) {
        const [claimValue = ""] = getStringValues(payload[claimKey])

        if (claimValue) {
            return claimValue
        }
    }

    return ""
}

export function getJwtStringClaims(
    payload: JwtPayload | null,
    claimKeys: readonly string[]
) {
    if (!payload) {
        return []
    }

    return Array.from(
        new Set(claimKeys.flatMap((claimKey) => getStringValues(payload[claimKey])))
    )
}
