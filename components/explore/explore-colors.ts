import { SemanticColors } from "@/styles/ui-theme";

type AccentStyle = {
  color: string;
  softBg: string;
  strongBg: string;
};

function createAccent(color: string): AccentStyle {
  return {
    color,
    softBg: `${color}12`,
    strongBg: `${color}20`,
  };
}

const ACCENTS = {
  blue: createAccent(SemanticColors.blue),
  green: createAccent(SemanticColors.green),
  orange: createAccent(SemanticColors.orange),
  red: createAccent(SemanticColors.red),
  lavender: createAccent("#AF52DE"),
  sweet: createAccent("#DB2777"),
  strawberry: createAccent("#DC2626"),
  sky: createAccent("#2563EB"),
  tree: createAccent("#059669"),
  orange2: createAccent("#D97706"),
  other: createAccent("#5AC8FA"),
  violet: createAccent(SemanticColors.violet),
  lightBlue: createAccent(SemanticColors.lightBlue),
} as const;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function getCategoryAccent(category?: string | null): AccentStyle {
  const value = normalize(category ?? "");

  if (
    value.includes("كتاب") ||
    value.includes("كتب") ||
    value.includes("book")
  ) {
    return ACCENTS.orange;
  }
  if (
    value.includes("صيانة") ||
    category?.includes("maintenance") ||
    category?.includes("صيانة الأجهزة")
  ) {
    return ACCENTS.orange2;
  }
  if (
    value.includes("موسيقى وفنون") ||
    value.includes("فنون") ||
    value.includes("موسيقى") ||
    value.includes("art") ||
    value.includes("music") ||
    value.includes("music and art")
  ) {
    return ACCENTS.strawberry;
  }

  if (
    value.includes("تصميم") ||
    value.includes("design") ||
    value.includes("هواية")
  ) {
    return ACCENTS.sweet;
  }

  if (
    value.includes("برمجه") ||
    value.includes("تطوير") ||
    value.includes("code") ||
    value.includes("software") ||
    value.includes("إلكتروني") ||
    value.includes("الكترونيات") ||
    value.includes("حاسوب") ||
    value.includes("لابتوب") ||
    value.includes("تقني") ||
    value.includes("tech") ||
    value.includes("elect")
  ) {
    return ACCENTS.lavender;
  }
  if (
    value.includes("دروس خصوصية") ||
    value.includes("تعليم") ||
    value.includes("تعليمية") ||
    value.includes("تعليمى") ||
    value.includes("education") ||
    value.includes("educational") ||
    value.includes("tutoring")
  ) {
    return ACCENTS.sky;
  }
  if (
    value.includes("تصوير") ||
    value.includes("photo") ||
    value.includes("photography")
  ) {
    return ACCENTS.tree;
  }

  return ACCENTS.other;
}

export function getEventAccent(eventType?: string | null): AccentStyle {
  const value = normalize(eventType ?? "");

  if (value.includes("معرض") || value.includes("exhibition")) {
    return ACCENTS.orange;
  }

  if (value.includes("ورشة") || value.includes("workshop")) {
    return ACCENTS.violet;
  }

  if (value.includes("ندوة") || value.includes("seminar")) {
    return ACCENTS.lightBlue;
  }

  if (value.includes("لقاء") || value.includes("meetup")) {
    return ACCENTS.green;
  }

  return ACCENTS.violet;
}
