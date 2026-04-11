export const AUTH_COPY = {
  appTitle: 'كلشي بجامعتنا',
  appSubtitle: 'منصتك الجامعية الشاملة للخدمات والتواصل.',
  loginTab: 'تسجيل الدخول',
  registerTab: 'إنشاء حساب',
  termsAgreement: 'بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية',
  fullNamePlaceholder: 'الاسم الكامل',
  universityEmailPlaceholder: 'البريد الجامعي',
  passwordPlaceholder: 'كلمة المرور',
  forgotPassword: 'نسيت كلمة المرور؟',
  loginButton: 'دخول',
  loginButtonPending: 'جاري الدخول...',
  registerButton: 'إنشاء الحساب',
  registerButtonPending: 'جاري إنشاء الحساب...',
  registerHint: 'استخدم بريدك الجامعي (.edu) للتوثيق الفوري.',
  fullNameRequired: 'يرجى إدخال الاسم الكامل',
  fullNameTooShort: 'الاسم الكامل قصير جدًا',
  emailRequired: 'يرجى إدخال البريد الجامعي',
  invalidEmail: 'صيغة البريد غير صحيحة',
  passwordRequired: 'يرجى إدخال كلمة المرور',
  loginPasswordMinLength: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  registerPasswordMinLength: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
  passwordStrength: 'يجب أن تحتوي على حرف كبير وصغير ورمز',
  loginFailed: 'تعذر تسجيل الدخول',
  invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  registerFailed: 'تعذر إنشاء الحساب',
} as const;

export const AUTH_PATTERNS = {
  email: /^\S+@\S+\.\S+$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
} as const;

export const AUTH_VALIDATION = {
  name: {
    required: AUTH_COPY.fullNameRequired,
    minLength: {
      value: 3,
      message: AUTH_COPY.fullNameTooShort,
    },
  },
  email: {
    required: AUTH_COPY.emailRequired,
    pattern: {
      value: AUTH_PATTERNS.email,
      message: AUTH_COPY.invalidEmail,
    },
  },
  loginPassword: {
    required: AUTH_COPY.passwordRequired,
    minLength: {
      value: 6,
      message: AUTH_COPY.loginPasswordMinLength,
    },
  },
  registerPassword: {
    required: AUTH_COPY.passwordRequired,
    minLength: {
      value: 8,
      message: AUTH_COPY.registerPasswordMinLength,
    },
    pattern: {
      value: AUTH_PATTERNS.strongPassword,
      message: AUTH_COPY.passwordStrength,
    },
  },
} as const;
