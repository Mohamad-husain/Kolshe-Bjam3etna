import { StyleSheet } from "react-native";

export const LightColors = {
  background: "#f2f2f7",
  foreground: "#1c1c1e",
  card: "rgba(255,255,255,0.72)",
  primary: "#2563eb",
  secondary: "rgba(120,120,128,0.08)",
  mutedForeground: "#8e8e93",
  destructive: "#ff3b30",
  border: "rgba(60,60,67,0.08)",
} as const;

export const DarkColors = {
  background: "#000000",
  foreground: "#ffffff",
  card: "rgba(28,28,30,0.72)",
  primary: "#0a84ff",
  secondary: "rgba(120,120,128,0.24)",
  mutedForeground: "#8e8e93",
  destructive: "#ff453a",
  border: "rgba(84,84,88,0.36)",
} as const;

export const SemanticColors = {
  blue: "#2563eb",
  green: "#34c759",
  orange: "#ff9500",
  red: "#ff3b30",
  violet: "#af52de",
  lightBlue: "#5ac8fa",
} as const;

export const Colors = LightColors;

export const Dimensions = {
  maxWidthMobile: 448,
  radiusCard: 24,
  radiusButton: 16,
  radiusChip: 12,
  radiusFull: 999,
  bottomNavigationHeight: 86,
  fabSize: 54,
  fabLift: 24,
  iconLg: 24,
  iconMd: 18,
  iconSm: 14,
  avatarLg: 88,
  avatarMd: 40,
  avatarSm: 32,
  glassBlur: 20,
  baseRadius: 16,
} as const;

export const Spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const STRINGS = {
  appName: "Kolshe Bjam3etna",
  authTitle: "تسجيل الدخول",
  authEmailPlaceholder: "Email",
  authPasswordPlaceholder: "Password",
  authLoginButton: "Login",
} as const;

export const FontFamily = {
  cairo: "Cairo",
} as const;

export const FontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const;

export const FontSize = {
  xxs: 9,
  xs: 10,
  x11: 11,
  sm: 12,
  x13: 13,
  md: 14,
  x15: 15,
  base: 16,
  x17: 17,
  lg: 20,
  xl: 24,
  hero: 30,
} as const;

export const Typography = StyleSheet.create({
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    fontFamily: FontFamily.cairo,
  },
  body: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    fontFamily: FontFamily.cairo,
  },
  label: {
    fontSize: FontSize.x11,
    fontWeight: FontWeight.medium,
    fontFamily: FontFamily.cairo,
  },
});

export const IconSet = {
  nav: ["Home", "Compass", "Plus", "MessageCircle", "User"],
  content: [
    "Briefcase",
    "ShoppingBag",
    "Calendar",
    "Megaphone",
    "GraduationCap",
    "BookOpen",
  ],
  profile: ["Settings", "Edit", "Camera", "Globe", "Phone", "Mail"],
  actions: ["Star", "Heart", "Bookmark", "Share2", "Copy", "Upload", "Send"],
  status: ["CheckCircle", "XCircle", "AlertCircle", "Shield"],
} as const;
