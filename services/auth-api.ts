import { apiClient, getApiErrorMessage, setAuthToken } from '@/services/http-client';

export type User = {
  id: string;
  name: string;
  email: string;
  isProfileCompleted: boolean;
};

export type University = {
  id: number;
  name: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type VerifyResetCodeInput = {
  email: string;
  code: string;
};

export type ResetPasswordInput = {
  email: string;
  code: string;
  newPassword: string;
};

export type ProfileImageInput = {
  uri: string;
  name?: string | null;
  type?: string | null;
  file?: File;
};

export type CompleteProfileInput = {
  universityId: number;
  major: string;
  bio: string;
  profileImage: ProfileImageInput;
};

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

type ApiUniversitiesResponse = {
  message?: string;
  data?: University[];
};

type ApiCompleteProfileResponse = {
  message?: string;
};

function buildUserName(name: string, email: string) {
  const fromEmail = email.split('@')[0]?.trim();

  if (fromEmail) {
    return fromEmail;
  }

  return name.replace(/\s+/g, '').toLowerCase() || `user${Date.now()}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeProfileCompletionStatus(value?: boolean) {
  return value !== false;
}

function mapAuthenticatedUser({
  email,
  name,
  isProfileCompleted,
}: {
  email: string;
  name: string;
  isProfileCompleted?: boolean;
}): User {
  return {
    id: email,
    name,
    email,
    isProfileCompleted: normalizeProfileCompletionStatus(isProfileCompleted),
  };
}

async function postJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
  fallbackMessage: string,
): Promise<TResponse> {
  try {
    const response = await apiClient.post<TResponse>(path, body);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
}

async function getRequest<TResponse>(path: string, fallbackMessage: string): Promise<TResponse> {
  try {
    const response = await apiClient.get<TResponse>(path);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
}

async function postMultipart<TResponse>(
  path: string,
  body: FormData,
  fallbackMessage: string,
): Promise<TResponse> {
  try {
    const response = await apiClient.post<TResponse>(path, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
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

  setAuthToken(response.token);

  return mapAuthenticatedUser({
    email,
    name: email.split('@')[0] || 'User',
    isProfileCompleted: response.isProfileCompleted,
  });
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

export async function getUniversities(): Promise<University[]> {
  const response = await getRequest<ApiUniversitiesResponse>(
    '/api/Account/universities',
    'تعذر تحميل قائمة الجامعات',
  );

  return response.data ?? [];
}

export async function completeProfile(input: CompleteProfileInput): Promise<string | null> {
  const universityId = Number(input.universityId);
  const major = input.major.trim();
  const bio = input.bio.trim();

  if (!Number.isFinite(universityId) || universityId <= 0) {
    throw new Error('يرجى اختيار الجامعة');
  }

  if (!major) {
    throw new Error('يرجى إدخال التخصص أو القسم');
  }

  if (!input.profileImage?.uri) {
    throw new Error('يرجى اختيار صورة شخصية');
  }

  const formData = new FormData();
  formData.append('UniversityId', String(universityId));
  formData.append('Major', major);
  formData.append('Bio', bio);

  if (input.profileImage.file) {
    formData.append('ProfileImageUrl', input.profileImage.file);
  } else {
    formData.append(
      'ProfileImageUrl',
      {
        uri: input.profileImage.uri,
        name: input.profileImage.name ?? `profile-${Date.now()}.jpg`,
        type: input.profileImage.type ?? 'image/jpeg',
      } as never,
    );
  }

  const response = await postMultipart<ApiCompleteProfileResponse>(
    '/api/Account/complete-profile',
    formData,
    'تعذر إكمال الملف الشخصي',
  );

  return response.message ?? null;
}
