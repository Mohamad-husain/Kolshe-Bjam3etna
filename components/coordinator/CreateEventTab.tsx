import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  useCreateEventMutation,
  useUpdateEventMutation,
} from "@/hooks/queries/use-coordinator-queries";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Colors,
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
  Spacing,
} from "@/styles/ui-theme";
import type { CoordinatorEvent } from "@/services/coordinator-api";
import { useState } from "react";

type FormValues = {
  title: string;
  type: string;
  location: string;
  date: string;
  time: string;
  capacity: string;
  description: string;
  content: string;
  coverImage?: {
    uri: string;
    name: string;
    type: string;
  };
};

type CreateEventTabProps = {
  editingEvent?: CoordinatorEvent | null;
  onDone?: () => void;
};

const EVENT_TYPES = [
  { id: "workshop", label: "ورشة عمل" },
  { id: "exhibition", label: "معرض" },
  { id: "seminar", label: "ندوة" },
  { id: "meetup", label: "لقاء" },
];

export function CreateEventTab({ editingEvent, onDone }: CreateEventTabProps) {
  const isEditing = !!editingEvent;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { mutate: createEvent, isPending: isCreating } =
    useCreateEventMutation();
  const { mutate: updateEvent, isPending: isUpdating } =
    useUpdateEventMutation();
  const isPending = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: editingEvent?.title ?? "",
      type: editingEvent?.type ?? "workshop",
      location: editingEvent?.location ?? "",
      date: editingEvent?.dateTimeUtc?.split("T")[0] ?? "",
      time: editingEvent?.dateTimeUtc?.split("T")[1]?.slice(0, 5) ?? "",
      capacity: editingEvent?.capacity ? String(editingEvent.capacity) : "",
      description: editingEvent?.description ?? "",
      content: editingEvent?.description ?? "",
      coverImage: undefined,
    },
  });
  const pickImage = async (onChange: (value: any) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert(" اعطي إذن للوصول للصور");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      onChange({
        uri: asset.uri,
        name: "cover.jpg",
        type: "image/jpeg",
      });
    }
  };

  const onSubmit = handleSubmit((values) => {
    if (!values.date || !values.time) {
      Alert.alert("خطأ", " التاريخ والوقت مطلوب");
      return;
    }
    const dateTime = new Date(`${values.date}T${values.time}:00Z`);
    if (isNaN(dateTime.getTime())) {
      Alert.alert("خطأ", "التاريخ أو الوقت غير صالح");
      return;
    }
    const dateTimeUtc = dateTime.toISOString();
    const eventData = {
      title: values.title,
      type: values.type,
      location: values.location,
      dateTimeUtc,
      capacity: Number(values.capacity),
      description: values.description,
      content: values.content || values.description,
      agendaJson: "[]",
      coverImage: values.coverImage,
    };

    if (isEditing && editingEvent) {
      updateEvent(
        { ...eventData, eventId: editingEvent.id },
        {
          onSuccess: () => {
            Alert.alert("تم", "تم تعديل الفعالية بنجاح");
            onDone?.();
          },
          onError: (error) => {
            Alert.alert(
              "خطأ",
              error instanceof Error ? error.message : "تعذر تعديل الفعالية",
            );
          },
        },
      );
    } else {
      createEvent(eventData, {
        onSuccess: () => {
          Alert.alert("تم", "تم نشر الفعالية بنجاح");
          reset();
          onDone?.();
        },
        onError: (error) => {
          Alert.alert(
            "خطأ",
            error instanceof Error ? error.message : "تعذر إنشاء الفعالية",
          );
        },
      });
    }
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Controller
          control={control}
          name="coverImage"
          render={({ field: { onChange, value } }) => (
            <Pressable
              style={styles.imagePicker}
              onPress={() => pickImage(onChange)}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={32}
                color={SemanticColors.green}
              />

              <Text style={styles.imagePickerText}>
                {value ? "تم اختيار صورة" : "أضف صورة أو بوستر للفعالية"}
              </Text>
            </Pressable>
          )}
        />

        <Text style={styles.label}>عنوان الفعالية *</Text>
        <Controller
          control={control}
          name="title"
          rules={{ required: "عنوان الفعالية مطلوب" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="مثال: ورشة عمل البرمجة بالبايثون"
              placeholderTextColor={Colors.mutedForeground}
              value={value}
              onChangeText={onChange}
              textAlign="right"
            />
          )}
        />
        {errors.title && (
          <Text style={styles.errorText}>{errors.title.message}</Text>
        )}

        <Text style={styles.label}>نوع الفعالية</Text>
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <View style={styles.typeRow}>
              {EVENT_TYPES.map((type) => (
                <Pressable
                  key={type.id}
                  onPress={() => onChange(type.id)}
                  style={[
                    styles.typeChip,
                    value === type.id && styles.typeChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      value === type.id && styles.typeChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>الوقت</Text>
            <Controller
              control={control}
              name="time"
              rules={{ required: "الوقت مطلوب" }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Pressable
                    onPress={() => setShowTimePicker(true)}
                    style={styles.input}
                  >
                    <Text style={{ textAlign: "right" }}>
                      {value || "اختر الوقت"}
                    </Text>
                  </Pressable>

                  {showTimePicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="time"
                      is24Hour={true}
                      display="default"
                      onChange={(event, selectedTime) => {
                        setShowTimePicker(false);
                        if (selectedTime) {
                          const hours = selectedTime
                            .getHours()
                            .toString()
                            .padStart(2, "0");
                          const minutes = selectedTime
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");

                          onChange(`${hours}:${minutes}`);
                        }
                      }}
                    />
                  )}
                </>
              )}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>التاريخ</Text>
            <Controller
              control={control}
              name="date"
              rules={{ required: "التاريخ مطلوب" }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    style={styles.input}
                  >
                    <Text style={{ textAlign: "right" }}>
                      {value || "اختر التاريخ"}
                    </Text>
                  </Pressable>

                  {showDatePicker && (
                    <DateTimePicker
                      value={value ? new Date(value) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          const formatted = selectedDate
                            .toISOString()
                            .split("T")[0];
                          onChange(formatted);
                        }
                      }}
                    />
                  )}
                </>
              )}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>الحد الأقصى</Text>
            <Controller
              control={control}
              name="capacity"
              rules={{ required: "الحد الأقصى مطلوب" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.capacity && styles.inputError]}
                  placeholder="50"
                  placeholderTextColor={Colors.mutedForeground}
                  value={value}
                  onChangeText={onChange}
                  textAlign="right"
                  keyboardType="numeric"
                />
              )}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>المكان</Text>
            <Controller
              control={control}
              name="location"
              rules={{ required: "المكان مطلوب" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.location && styles.inputError]}
                  placeholder="قاعة الحاسوب"
                  placeholderTextColor={Colors.mutedForeground}
                  value={value}
                  onChangeText={onChange}
                  textAlign="right"
                />
              )}
            />
          </View>
        </View>

        <Text style={styles.label}>شرح التفاصيل</Text>
        <Controller
          control={control}
          name="description"
          rules={{ required: "الوصف مطلوب" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.description && styles.inputError,
              ]}
              placeholder="اشرح هدف الفعالية، ماذا سيستفيد المشاركون، والمحاور الرئيسية..."
              placeholderTextColor={Colors.mutedForeground}
              value={value}
              onChangeText={onChange}
              textAlign="right"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description.message}</Text>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
            isPending && styles.submitButtonDisabled,
          ]}
          onPress={() => void onSubmit()}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#fff"
              />
              {/* ⑤ نص الزر يتغير حسب الوضع */}
              <Text style={styles.submitButtonText}>
                {isEditing ? "حفظ التعديلات" : "نشر الفعالية"}
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 100 },
  imagePicker: {
    backgroundColor: SemanticColors.green + "10",
    borderRadius: Dimensions.radiusCard,
    borderWidth: 1.5,
    borderColor: SemanticColors.green + "40",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  imagePickerText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
  },
  label: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.foreground,
    textAlign: "right",
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: Dimensions.radiusButton,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: Colors.foreground,
    marginBottom: Spacing.md,
  },
  inputError: { borderColor: SemanticColors.red },
  textArea: { height: 100, paddingTop: Spacing.sm },
  errorText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: SemanticColors.red,
    textAlign: "right",
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
  typeRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  typeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: Colors.secondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  typeChipActive: {
    backgroundColor: SemanticColors.green,
    borderColor: SemanticColors.green,
  },
  typeChipText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
  },
  typeChipTextActive: { color: "#fff", fontWeight: FontWeight.semibold },
  row: { flexDirection: "row-reverse", gap: Spacing.sm },
  rowItem: { flex: 1 },
  submitButton: {
    backgroundColor: SemanticColors.green,
    borderRadius: Dimensions.radiusButton,
    paddingVertical: Spacing.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    shadowColor: SemanticColors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
});
