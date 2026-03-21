export const CODE_LENGTH = 6;
export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
