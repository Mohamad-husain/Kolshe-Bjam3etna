import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Colors } from '@/styles/ui-theme';

import {
  SERVICE_REQUEST_CATEGORIES,
  serviceRequestStyles as styles,
  type ServiceRequestCategoryOption,
} from './shared';
import { ServiceRequestSectionHeader } from './service-request-section-header';

type Props = {
  title: string;
  titleError: string;
  selectedCategoryId: number | null;
  canProceed: boolean;
  onTitleChange: (value: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onNext: () => void;
};

function getCategoryButtonStyle(
  active: boolean,
  category: ServiceRequestCategoryOption,
) {
  if (!active) {
    return null;
  }

  return {
    borderColor: `${category.color}45`,
    shadowColor: category.color,
    shadowOpacity: 0.1 as const,
  };
}

export function ServiceRequestBasicStep({
  title,
  titleError,
  selectedCategoryId,
  canProceed,
  onTitleChange,
  onCategoryChange,
  onNext,
}: Props) {
  return (
    <View style={styles.card}>
      <ServiceRequestSectionHeader
        step={1}
        title="المعلومات الأساسية"
        subtitle="العنوان والتصنيف"
      />

      <View style={styles.fieldBlock}>
        <View style={styles.fieldTopRow}>
          <Text style={styles.counter}>{title.length}/80</Text>
          <View style={styles.labelRow}>
            <Ionicons name="pricetag-outline" size={14} color={Colors.primary} />
            <Text style={styles.fieldLabel}>عنوان الطلب</Text>
          </View>
        </View>
        <View style={[styles.fieldRow, titleError ? styles.fieldRowError : null]}>
          <TextInput
            value={title}
            onChangeText={onTitleChange}
            maxLength={80}
            placeholder="مثال: مطلوب مدرس تفاضل وتكامل"
            placeholderTextColor="rgba(142,142,147,0.65)"
            style={styles.input}
            textAlign="right"
          />
          <Ionicons name="search-outline" size={18} color={Colors.mutedForeground} />
        </View>
        {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
      </View>

      <View style={styles.fieldBlock}>
        <View style={styles.labelRow}>
          <Ionicons name="grid-outline" size={14} color={Colors.primary} />
          <Text style={styles.fieldLabel}>التصنيف</Text>
        </View>

        <View style={styles.grid}>
          {SERVICE_REQUEST_CATEGORIES.map((item) => {
            const active = selectedCategoryId === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => onCategoryChange(active ? null : item.id)}
                style={({ pressed }) => [
                  styles.categoryButton,
                  getCategoryButtonStyle(active, item),
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    active && { backgroundColor: `${item.color}12` },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={active ? item.color : Colors.mutedForeground}
                  />
                </View>
                <Text style={[styles.categoryText, active && { color: item.color }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={onNext}
        disabled={!canProceed}
        style={({ pressed }) => [
          styles.primaryButton,
          !canProceed && styles.primaryButtonDisabled,
          pressed && canProceed && styles.pressed,
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={18}
          color={canProceed ? '#ffffff' : Colors.mutedForeground}
        />
        <Text style={[styles.primaryText, !canProceed && styles.primaryTextDisabled]}>
          التالي
        </Text>
      </Pressable>
    </View>
  );
}
