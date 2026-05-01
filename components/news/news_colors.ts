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
  violet: createAccent(SemanticColors.violet),
  lightBlue: createAccent(SemanticColors.lightBlue),
} as const;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function getNewsAccent(category?: string | null): AccentStyle {
  const value = normalize(category ?? "");

  if (
    value.includes("منح") ||
    value.includes("منحة") ||
    value.includes("grant")
  ) {
    return ACCENTS.green;
  }

  if (value.includes("أكاديمي") || value.includes("اكاديمي") || value.includes("تعليم")) {
    return ACCENTS.orange;
  }

  if (value.includes("أنشطة") || value.includes("انشطة") || value.includes("رياض")) {
    return ACCENTS.red;
  }

  if (value.includes("مرافق") || value.includes("خدمات")) {
    return ACCENTS.violet;
  }

  if (value.includes("تسجيل") || value.includes("enrollment")) {
    return ACCENTS.lightBlue;
  }

  if (value.includes("إدارة") || value.includes("ادارة") || value.includes("management")) {
    return ACCENTS.violet;
  }

  if (value.includes("تقنية") || value.includes("technology")) {
    return ACCENTS.blue;
  }
  if (
    value.includes("إعلان عام") ||
    value.includes("اعلان عام") ||
    value.includes("general")
  ) {
    return ACCENTS.blue;
  }

  return ACCENTS.blue;
}
