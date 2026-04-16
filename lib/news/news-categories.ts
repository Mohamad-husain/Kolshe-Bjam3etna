import type { Category } from "@/components/explore/CategoryFilter";

export const ALL_NEWS_CATEGORY = "الكل";

export const NEWS_CATEGORY_LABELS = [
  "إعلان عام",
  "أكاديمي",
  "منح وبعثات",
  "أنشطة ورياضة",
  "مرافق وخدمات",
] as const;

export const NEWS_CATEGORIES: Category[] = [
  { id: ALL_NEWS_CATEGORY, label: ALL_NEWS_CATEGORY },
  ...NEWS_CATEGORY_LABELS.map((label) => ({ id: label, label })),
];

const NEWS_CATEGORY_ALIASES: Record<string, string> = {
  "1": "إعلان عام",
  "2": "أكاديمي",
  "3": "منح وبعثات",
  "4": "أنشطة ورياضة",
  "5": "مرافق وخدمات",
  "0": "إعلان عام",
  "عام": "إعلان عام",
  "اعلان عام": "إعلان عام",
  "أكاديمي": "أكاديمي",
  "اكاديمي": "أكاديمي",
  "منح": "منح وبعثات",
  "منح وبعثات": "منح وبعثات",
  "انشطة": "أنشطة ورياضة",
  "أنشطة": "أنشطة ورياضة",
  "أنشطة ورياضة": "أنشطة ورياضة",
  "رياضة": "أنشطة ورياضة",
  "مرافق": "مرافق وخدمات",
  "خدمات": "مرافق وخدمات",
  "مرافق وخدمات": "مرافق وخدمات",
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeNewsCategory(category?: string | null) {
  const rawValue = category?.trim();

  if (!rawValue) {
    return "إعلان عام";
  }

  return NEWS_CATEGORY_ALIASES[normalizeKey(rawValue)] ?? rawValue;
}

