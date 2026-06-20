import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/contexts/app-settings-context';
import { useThemePreference } from '@/contexts/theme-preference-context';
import type { SettingsLanguageValue } from '@/lib/storage/settings-preferences';
import { FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

import { SettingsSection } from './SettingsSection';

type SettingsLanguageSectionProps = {
  value: SettingsLanguageValue;
  onChange: (language: SettingsLanguageValue) => void;
};

const languages: { value: SettingsLanguageValue; labelKey: 'settings.languageArabic' | 'settings.languageEnglish' }[] = [
  { value: 'ar', labelKey: 'settings.languageArabic' },
  { value: 'en', labelKey: 'settings.languageEnglish' },
];

export function SettingsLanguageSection({
  value,
  onChange,
}: SettingsLanguageSectionProps) {
  const { t, isRtl } = useAppSettings();
  const { colors } = useThemePreference();

  return (
    <SettingsSection title={t('settings.language')}>
      <View style={styles.wrapper}>
        <Text
          style={[
            styles.description,
            {
              color: colors.mutedForeground,
              textAlign: isRtl ? 'right' : 'left',
              writingDirection: isRtl ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('settings.languageDescription')}
        </Text>

        <View style={[styles.optionsRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {languages.map((language) => {
            const selected = language.value === value;

            return (
              <Pressable
                key={language.value}
                onPress={() => onChange(language.value)}
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: selected ? colors.primary : colors.secondary },
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    { color: selected ? '#ffffff' : colors.foreground },
                    selected && styles.optionLabelSelected,
                  ]}
                >
                  {t(language.labelKey)}
                </Text>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 14,
    gap: 12,
  },
  description: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  optionsRow: {
    gap: 10,
  },
  option: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  optionSelected: {
  },
  optionLabel: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  optionLabelSelected: {
    color: '#ffffff',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
