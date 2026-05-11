import { Ionicons } from "@expo/vector-icons";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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
  Platform,
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

type AgendaItem = {
  startTime: string;
  endTime: string;
  title: string;
};

type FormValues = {
  title: string;
  type: string;
  location: string;
  date: string;
  time: string;
  capacity: string;
  description: string;
  content: string;
  speakers: string;
  agenda: AgendaItem[];
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
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [agendaStartTimePickers, setAgendaStartTimePickers] = useState<
    Record<number, boolean>
  >({});
  const [agendaEndTimePickers, setAgendaEndTimePickers] = useState<
    Record<number, boolean>
  >({});

  const { mutate: createEvent, isPending: isCreating } =
    useCreateEventMutation();
  const { mutate: updateEvent, isPending: isUpdating } =
    useUpdateEventMutation();
  const isPending = isCreating || isUpdating;

  let defaultAgenda: AgendaItem[] = [];
  if (editingEvent?.agendaJson) {
    try {
      defaultAgenda = JSON.parse(editingEvent.agendaJson);
    } catch {
      defaultAgenda = [];
    }
  }

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
      speakers: "",
      agenda: defaultAgenda.length > 0 ? defaultAgenda : [],
      coverImage: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "agenda",
  });

  const pickImage = async (onChange: (value: any) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("اعطي إذن للوصول للصور");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      onChange({ uri: asset.uri, name: "cover.jpg", type: "image/jpeg" });
    }
  };

  const onSubmit = handleSubmit((values) => {
    if (!values.date || !values.time) {
      Alert.alert("خطأ", "التاريخ والوقت مطلوب");
      return;
    }
    const dateTime = new Date(`${values.date}T${values.time}:00Z`);
    if (isNaN(dateTime.getTime())) {
      Alert.alert("خطأ", "التاريخ أو الوقت غير صالح");
      return;
    }
    const dateTimeUtc = dateTime.toISOString();
    const agendaJson = JSON.stringify(values.agenda ?? []);

    const eventData = {
      title: values.title,
      type: values.type,
      location: values.location,
      dateTimeUtc,
      capacity: Number(values.capacity),
      description: values.description,
      content: values.content || values.description,
      agendaJson,
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
                {value ? "تم اختيار صورة ✓" : "أضف صورة أو بوستر للفعالية"}
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
            <View style={styles.dropdownWrapper}>
              <Pressable
                style={[styles.input, styles.dropdownTrigger]}
                onPress={() => setTypeDropdownOpen((prev) => !prev)}
              >
                <Ionicons
                  name={typeDropdownOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={Colors.mutedForeground}
                />
                <Text style={styles.dropdownValue}>
                  {EVENT_TYPES.find((t) => t.id === value)?.label ??
                    "اختر نوع الفعالية"}
                </Text>
              </Pressable>

              {typeDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {EVENT_TYPES.map((type, index) => (
                    <Pressable
                      key={type.id}
                      style={[
                        styles.dropdownItem,
                        index < EVENT_TYPES.length - 1 &&
                          styles.dropdownItemBorder,
                        value === type.id && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        onChange(type.id);
                        setTypeDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          value === type.id && styles.dropdownItemTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                      {value === type.id && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={SemanticColors.green}
                        />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
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
                    style={[styles.input, styles.pickerTrigger]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={Colors.mutedForeground}
                    />
                    <Text
                      style={
                        value
                          ? styles.pickerValueFilled
                          : styles.pickerValueEmpty
                      }
                    >
                      {value || "--:--"}
                    </Text>
                  </Pressable>
                  {showTimePicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="time"
                      is24Hour
                      display="default"
                      onChange={(_, selectedTime) => {
                        setShowTimePicker(false);
                        if (selectedTime) {
                          const h = selectedTime
                            .getHours()
                            .toString()
                            .padStart(2, "0");
                          const m = selectedTime
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");
                          onChange(`${h}:${m}`);
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
                    style={[styles.input, styles.pickerTrigger]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={Colors.mutedForeground}
                    />
                    <Text
                      style={
                        value
                          ? styles.pickerValueFilled
                          : styles.pickerValueEmpty
                      }
                    >
                      {value || "mm/dd/yyyy"}
                    </Text>
                  </Pressable>
                  {showDatePicker && (
                    <DateTimePicker
                      value={value ? new Date(value) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(_, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          onChange(selectedDate.toISOString().split("T")[0]);
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
                <View
                  style={[
                    styles.inputWithIcon,
                    errors.capacity && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="people-outline"
                    size={16}
                    color={Colors.mutedForeground}
                  />
                  <TextInput
                    style={styles.inputInner}
                    placeholder="50"
                    placeholderTextColor={Colors.mutedForeground}
                    value={value}
                    onChangeText={onChange}
                    textAlign="right"
                    keyboardType="numeric"
                  />
                </View>
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
                <View
                  style={[
                    styles.inputWithIcon,
                    errors.location && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={Colors.mutedForeground}
                  />
                  <TextInput
                    style={styles.inputInner}
                    placeholder="قاعة الحاسوب"
                    placeholderTextColor={Colors.mutedForeground}
                    value={value}
                    onChangeText={onChange}
                    textAlign="right"
                  />
                </View>
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

        <View style={styles.optionalHeader}>
          <Text style={styles.optionalBadge}>اختياري</Text>
          <Text style={styles.label}>المتحدثون</Text>
        </View>
        <Controller
          control={control}
          name="speakers"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={`مثال:\nأ. محمد الأحمد — مهندس برمجيات في Google\nد. سارة نبيل — أستاذة في الجامعة الأردنية`}
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

        <View style={styles.optionalHeader}>
          <Text style={styles.optionalBadge}>اختياري</Text>
          <Text style={styles.label}>الجدول الزمني</Text>
        </View>

        {fields.map((field, index) => (
          <View key={field.id} style={styles.agendaItem}>
            <View style={styles.agendaTimeRow}>
              <Controller
                control={control}
                name={`agenda.${index}.endTime`}
                render={({ field: { onChange, value } }) => (
                  <>
                    <Pressable
                      style={styles.agendaTimePicker}
                      onPress={() =>
                        setAgendaEndTimePickers((prev) => ({
                          ...prev,
                          [index]: true,
                        }))
                      }
                    >
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={Colors.mutedForeground}
                      />
                      <Text
                        style={
                          value
                            ? styles.pickerValueFilled
                            : styles.pickerValueEmpty
                        }
                      >
                        {value || "--:--"}
                      </Text>
                    </Pressable>
                    {agendaEndTimePickers[index] && (
                      <DateTimePicker
                        value={new Date()}
                        mode="time"
                        is24Hour
                        display="default"
                        onChange={(_, t) => {
                          setAgendaEndTimePickers((prev) => ({
                            ...prev,
                            [index]: false,
                          }));
                          if (t) {
                            const h = t.getHours().toString().padStart(2, "0");
                            const m = t
                              .getMinutes()
                              .toString()
                              .padStart(2, "0");
                            onChange(`${h}:${m}`);
                          }
                        }}
                      />
                    )}
                  </>
                )}
              />

              <Ionicons
                name="arrow-back-outline"
                size={14}
                color={Colors.mutedForeground}
              />

              <Controller
                control={control}
                name={`agenda.${index}.startTime`}
                render={({ field: { onChange, value } }) => (
                  <>
                    <Pressable
                      style={styles.agendaTimePicker}
                      onPress={() =>
                        setAgendaStartTimePickers((prev) => ({
                          ...prev,
                          [index]: true,
                        }))
                      }
                    >
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={Colors.mutedForeground}
                      />
                      <Text
                        style={
                          value
                            ? styles.pickerValueFilled
                            : styles.pickerValueEmpty
                        }
                      >
                        {value || "--:--"}
                      </Text>
                    </Pressable>
                    {agendaStartTimePickers[index] && (
                      <DateTimePicker
                        value={new Date()}
                        mode="time"
                        is24Hour
                        display="default"
                        onChange={(_, t) => {
                          setAgendaStartTimePickers((prev) => ({
                            ...prev,
                            [index]: false,
                          }));
                          if (t) {
                            const h = t.getHours().toString().padStart(2, "0");
                            const m = t
                              .getMinutes()
                              .toString()
                              .padStart(2, "0");
                            onChange(`${h}:${m}`);
                          }
                        }}
                      />
                    )}
                  </>
                )}
              />

              <Pressable
                style={styles.agendaDeleteBtn}
                onPress={() => remove(index)}
              >
                <Text style={styles.agendaDeleteText}>{index + 1}</Text>
              </Pressable>
            </View>

            {/* اسم الجلسة */}
            <Controller
              control={control}
              name={`agenda.${index}.title`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.agendaTitleInput}
                  placeholder="اسم الجلسة أو النشاط"
                  placeholderTextColor={Colors.mutedForeground}
                  value={value}
                  onChangeText={onChange}
                  textAlign="right"
                />
              )}
            />
          </View>
        ))}

        <Pressable
          style={styles.addSessionBtn}
          onPress={() => append({ startTime: "", endTime: "", title: "" })}
        >
          <Ionicons name="add" size={18} color={SemanticColors.green} />
          <Text style={styles.addSessionText}>إضافة جلسة</Text>
        </Pressable>

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

  optionalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  optionalBadge: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: Colors.mutedForeground,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Dimensions.radiusFull,
    overflow: "hidden",
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

  inputWithIcon: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: Dimensions.radiusButton,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  inputInner: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: Colors.foreground,
  },

  pickerTrigger: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
  },
  pickerValueFilled: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: Colors.foreground,
    textAlign: "right",
  },
  pickerValueEmpty: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: Colors.mutedForeground,
    textAlign: "right",
  },

  dropdownWrapper: { marginBottom: Spacing.md },
  dropdownTrigger: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  dropdownValue: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: Colors.foreground,
    textAlign: "right",
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: Dimensions.radiusButton,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: "hidden",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  dropdownItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  dropdownItemActive: { backgroundColor: SemanticColors.green + "08" },
  dropdownItemText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: Colors.foreground,
    textAlign: "right",
  },
  dropdownItemTextActive: {
    color: SemanticColors.green,
    fontWeight: FontWeight.semibold,
  },

  row: { flexDirection: "row-reverse", gap: Spacing.sm },
  rowItem: { flex: 1 },

  agendaItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: Dimensions.radiusButton,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  agendaTimeRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
  },
  agendaTimePicker: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.secondary,
    borderRadius: Dimensions.radiusButton,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  agendaTitleInput: {
    backgroundColor: Colors.secondary,
    borderRadius: Dimensions.radiusButton,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: Colors.foreground,
  },
  agendaDeleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SemanticColors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  agendaDeleteText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: "#fff",
    fontWeight: FontWeight.bold,
  },

  addSessionBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    borderRadius: Dimensions.radiusButton,
    borderWidth: 1.5,
    borderColor: SemanticColors.green + "50",
    borderStyle: "dashed",
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  addSessionText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: SemanticColors.green,
    fontWeight: FontWeight.semibold,
  },

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
