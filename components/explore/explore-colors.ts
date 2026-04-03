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
    value.includes("إلكترون") ||
    value.includes("الكترون") ||
    value.includes("حاسوب") ||
    value.includes("لابتوب") ||
    value.includes("تقني") ||
    value.includes("tech") ||
    value.includes("elect")
  ) {
    return ACCENTS.lightBlue;
  }

  if (
    value.includes("تصميم") ||
    value.includes("design") ||
    value.includes("هوية")
  ) {
    return ACCENTS.violet;
  }

  if (
    value.includes("برمجه") ||
    value.includes("تطوير") ||
    value.includes("code") ||
    value.includes("software")
  ) {
    return ACCENTS.green;
  }

  if (
    value.includes("خدمة") ||
    value.includes("service") ||
    value.includes("استشارة")
  ) {
    return ACCENTS.blue;
  }

  return ACCENTS.blue;
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
