import axios from 'axios';

export type User = {
  id: string;
  name: string;
  email: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type ForgotPasswordInput = {
  email: string;
};

type VerifyResetCodeInput = {
  email: string;
  code: string;
};

type ResetPasswordInput = {
  email: string;
  code: string;
  newPassword: string;
};

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');

type ApiLoginResponse = {
  message?: string;
  token?: string | null;
  isProfileCompleted?: boolean;
};

type ApiRegisterResponse = {
  message?: string;
};

type ApiActionResponse = {
  message?: string;
};

let currentToken: string | null = null;

function buildUserName(name: string, email: string) {
  const fromEmail = email.split('@')[0]?.trim();

  if (fromEmail) {
    return fromEmail;
  }

  return name.replace(/\s+/g, '').toLowerCase() || `user${Date.now()}`;
}

function parseResponsePayload(payload: unknown) {
  if (!payload) {
    return null;
  }

  if (typeof payload !== 'string') {
    return payload;
  }

  try {
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return { message: payload } as Record<string, unknown>;
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function extractMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
}

async function postJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
  fallbackMessage: string,
): Promise<TResponse> {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL غير معرّف في ملف البيئة .env');
  }

  try {
    const response = await axios.post<TResponse>(`${API_BASE_URL}${path}`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = parseResponsePayload(response.data);

    return (payload ?? {}) as TResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const payload = parseResponsePayload(error.response.data);
        throw new Error(extractMessage(payload, fallbackMessage));
      }

      const details = error.message ? ` (${error.message})` : '';
      throw new Error(`تعذر الاتصال بالخادم. تأكد من الإنترنت وحاول مرة أخرى.${details}`);
    }

    const details = error instanceof Error ? ` (${error.message})` : '';
    throw new Error(`تعذر الاتصال بالخادم. تأكد من الإنترنت وحاول مرة أخرى.${details}`);
  }
}

export function getAuthToken() {
  return currentToken;
}

export async function login(input: LoginInput): Promise<User> {
  const email = normalizeEmail(input.email);

  const response = await postJson<ApiLoginResponse>(
    '/api/Account/login',
    {
      email,
      password: input.password,
    },
    'تعذر تسجيل الدخول',
  );

  if (!response.token) {
    throw new Error(response.message ?? 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  currentToken = response.token;

  return {
    id: email,
    name: email.split('@')[0] || 'User',
    email,
  };
}

export async function register(input: RegisterInput): Promise<User> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();

  if (!name) {
    throw new Error('يرجى إدخال الاسم الكامل');
  }

  if (input.password.trim().length < 8) {
    throw new Error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }

  await postJson<ApiRegisterResponse>(
    '/api/Account/register',
    {
      fullName: name,
      userName: buildUserName(name, email),
      email,
      password: input.password,
    },
    'تعذر إنشاء الحساب',
  );

  const user = await login({
    email,
    password: input.password,
  });

  return { ...user, name };
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<string | null> {
  const email = normalizeEmail(input.email);

  if (!email) {
    throw new Error('يرجى إدخال البريد الجامعي');
  }

  const response = await postJson<ApiActionResponse>(
    '/api/Account/forgot-password',
    { email },
    'تعذر إرسال رمز التحقق',
  );

  return response.message ?? null;
}

export async function verifyResetCode(input: VerifyResetCodeInput): Promise<string | null> {
  const email = normalizeEmail(input.email);
  const code = input.code.trim();

  if (!email) {
    throw new Error('يرجى إدخال البريد الجامعي');
  }

  if (!code) {
    throw new Error('يرجى إدخال رمز التحقق');
  }

  const response = await postJson<ApiActionResponse>(
    '/api/Account/verify-reset-code',
    { email, code },
    'رمز التحقق غير صحيح',
  );

  return response.message ?? null;
}

export async function resetPassword(input: ResetPasswordInput): Promise<string | null> {
  const email = normalizeEmail(input.email);
  const code = input.code.trim();
  const newPassword = input.newPassword.trim();

  if (!email) {
    throw new Error('يرجى إدخال البريد الجامعي');
  }

  if (!code) {
    throw new Error('يرجى إدخال رمز التحقق');
  }

  if (newPassword.length < 8) {
    throw new Error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }

  const response = await postJson<ApiActionResponse>(
    '/api/Account/reset-password',
    { email, code, newPassword },
    'تعذر تغيير كلمة المرور',
  );

  return response.message ?? null;
}
