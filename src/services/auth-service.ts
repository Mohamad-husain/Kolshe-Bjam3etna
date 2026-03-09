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

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');

type ApiLoginResponse = {
  message?: string;
  token?: string | null;
  isProfileCompleted?: boolean;
};

type ApiRegisterResponse = {
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

function parseResponsePayload(text: string) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text } as Record<string, unknown>;
  }
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

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    const details = error instanceof Error ? ` (${error.message})` : '';
    throw new Error(`تعذر الاتصال بالخادم. تأكد من الإنترنت وحاول مرة أخرى.${details}`);
  }

  const raw = await response.text();
  const payload = parseResponsePayload(raw);

  if (!response.ok) {
    throw new Error(extractMessage(payload, fallbackMessage));
  }

  return (payload ?? {}) as TResponse;
}

export function getAuthToken() {
  return currentToken;
}

export async function login(input: LoginInput): Promise<User> {
  const email = input.email.trim().toLowerCase();

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
  const email = input.email.trim().toLowerCase();
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
