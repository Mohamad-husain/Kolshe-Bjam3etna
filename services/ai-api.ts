import { apiClient, getApiErrorMessage, getAuthToken } from '@/services/http-client';

type AiChatResponse = {
  message?: string | null;
  reply?: string | null;
};

export async function sendAiChatMessage(message: string): Promise<string> {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new Error('يرجى كتابة رسالة');
  }

  if (!getAuthToken()?.trim()) {
    throw new Error('يجب تسجيل الدخول أولاً لاستخدام المساعد الذكي');
  }

  try {
    const response = await apiClient.post<AiChatResponse>('/api/ai/chat', {
      message: trimmedMessage,
    });
    const reply = response.data.reply?.trim() || response.data.message?.trim();

    if (!reply) {
      throw new Error('لم يتم استلام رد من المساعد الذكي');
    }

    return reply;
  } catch (error) {
    if (error instanceof Error && error.message === 'لم يتم استلام رد من المساعد الذكي') {
      throw error;
    }

    throw new Error(getApiErrorMessage(error, 'تعذر التواصل مع المساعد الذكي'));
  }
}
