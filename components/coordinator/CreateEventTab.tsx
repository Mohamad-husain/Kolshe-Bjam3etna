import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Fragment, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useCreateEventMutation,
  useUpdateEventMutation,
} from "@/hooks/queries/use-coordinator-queries";
import type { CoordinatorEvent } from "@/services/coordinator-api";
import {
  Dimensions,
  FontFamily,
  FontSize,
  FontWeight,
  SemanticColors,
} from "@/styles/ui-theme";

type CoverImage = {
  uri: string;
  name: string;
  type: string;
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
  coverImage?: CoverImage;
};

type ScheduleItem = {
  id: number;
  title: string;
  time: string;
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

const INITIAL_SCHEDULE: ScheduleItem[] = [
  { id: 1, title: "", time: "" },
  { id: 2, title: "", time: "" },
];

function getEmptySchedule() {
  return INITIAL_SCHEDULE.map((item) => ({ ...item }));
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseAgendaItems(agendaJson?: string | null): ScheduleItem[] {
  if (!agendaJson?.trim()) {
    return getEmptySchedule();
  }

  try {
    const parsed = JSON.parse(agendaJson);

    if (!Array.isArray(parsed)) {
      return getEmptySchedule();
    }

    const items = parsed
      .map((entry, index) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
          return null;
        }

        const record = entry as Record<string, unknown>;
        const title =
          getStringValue(record.title) ||
          getStringValue(record.name) ||
          getStringValue(record.sessionName);
        const time =
          getStringValue(record.time) || getStringValue(record.startTime);

        if (!title && !time) {
          return null;
        }

        return {
          id: index + 1,
          title,
          time,
        };
      })
      .filter((item): item is ScheduleItem => item !== null);

    return items.length > 0 ? items : getEmptySchedule();
  } catch {
    return getEmptySchedule();
  }
}

function getTypeLabel(typeId: string) {
  return EVENT_TYPES.find((type) => type.id === typeId)?.label ?? "ورشة عمل";
}

function normalizeDigits(value: string) {
  const arabicZero = "٠".charCodeAt(0);
  const persianZero = "۰".charCodeAt(0);

  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    const normalized =
      code >= persianZero ? code - persianZero : code - arabicZero;

    return String(normalized);
  });
}

function formatDateInput(value: string) {
  const digits = normalizeDigits(value).replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function getDatePickerValue(value: string) {
  const parsed = new Date(`${value}T00:00:00`);

  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function getTimePickerValue(value: string) {
  const date = new Date();
  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isFinite(hours) && Number.isFinite(minutes)) {
    date.setHours(hours, minutes, 0, 0);
  }

  return date;
}

function formatPickedTime(date: Date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function CreateEventTab({ editingEvent, onDone }: CreateEventTabProps) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const isEditing = !!editingEvent;
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeScheduleTimePickerId, setActiveScheduleTimePickerId] =
    useState<number | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(() =>
    parseAgendaItems(editingEvent?.agendaJson),
  );
  const { mutate: createEvent, isPending: isCreating } =
    useCreateEventMutation();
  const { mutate: updateEvent, isPending: isUpdating } =
    useUpdateEventMutation();
  const isPending = isCreating || isUpdating;
  const shouldUsePickerSheet = Platform.OS !== "web";
  const keyboardOffset = Platform.OS === "ios" ? Math.max(insets.top, 12) : 0;
  const formBottomPadding = Math.max(insets.bottom + 144, 168);

  const openMainTimePicker = () => {
    Keyboard.dismiss();
    setShowTimePicker(true);
  };

  const openScheduleTimePicker = (id: number) => {
    Keyboard.dismiss();
    setActiveScheduleTimePickerId(id);
  };

  const scrollFocusedInputIntoView = (target: number) => {
    if (Platform.OS === "web") {
      return;
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard(
        target,
        104,
        true,
      );
    }, 120);
  };

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
      content: editingEvent?.content ?? "",
      coverImage: undefined,
    },
  });

  const pickImage = async (onChange: (value: CoverImage) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("إذن مطلوب", "اسمح للتطبيق بالوصول للصور");
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

  const updateScheduleItem = (
    id: number,
    field: keyof Pick<ScheduleItem, "title" | "time">,
    value: string,
  ) => {
    setScheduleItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const addScheduleItem = () => {
    setScheduleItems((items) => {
      const nextId = Math.max(0, ...items.map((item) => item.id)) + 1;
      return [...items, { id: nextId, title: "", time: "" }];
    });
  };

  const removeScheduleItem = (id: number) => {
    setScheduleItems((items) => {
      if (items.length <= 1) {
        return [{ ...items[0], title: "", time: "" }];
      }

      return items.filter((item) => item.id !== id);
    });
  };

  const onSubmit = handleSubmit((values) => {
    if (!values.date || !values.time) {
      Alert.alert("خطأ", "التاريخ والوقت مطلوبان");
      return;
    }

    const dateTime = new Date(`${values.date}T${values.time}:00Z`);
    if (Number.isNaN(dateTime.getTime())) {
      Alert.alert("خطأ", "التاريخ أو الوقت غير صالح");
      return;
    }

    const agendaItems = scheduleItems
      .map((item, index) => ({
        order: index + 1,
        title: item.title.trim(),
        time: item.time.trim(),
      }))
      .filter((item) => item.title || item.time);

    const eventData = {
      title: values.title,
      type: values.type,
      location: values.location,
      dateTimeUtc: dateTime.toISOString(),
      capacity: Number(values.capacity),
      description: values.description,
      content: values.content || values.description,
      agendaJson: JSON.stringify(agendaItems),
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
      return;
    }

    createEvent(eventData, {
      onSuccess: () => {
        Alert.alert("تم", "تم نشر الفعالية بنجاح");
        reset();
        setScheduleItems(getEmptySchedule());
        onDone?.();
      },
      onError: (error) => {
        Alert.alert(
          "خطأ",
          error instanceof Error ? error.message : "تعذر إنشاء الفعالية",
        );
      },
    });
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardOffset}
      style={styles.keyboardContainer}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: formBottomPadding },
        ]}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ bottom: formBottomPadding - 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <Controller
          control={control}
          name="coverImage"
          render={({ field: { onChange, value } }) => (
            <Pressable
              style={({ pressed }) => [
                styles.uploadCard,
                pressed && styles.pressedSubtle,
              ]}
              onPress={() => pickImage(onChange)}
            >
              <View style={styles.uploadIconCircle}>
                <Ionicons
                  name={value ? "checkmark-outline" : "cloud-upload-outline"}
                  size={23}
                  color="#34C759"
                />
              </View>
              <Text style={styles.uploadText}>
                {value ? "تم اختيار صورة الفعالية" : "أضف صورة أو بوستر الفعالية"}
              </Text>
            </Pressable>
          )}
        />

        <Text style={styles.label}>عنوان الفعالية</Text>
        <Controller
          control={control}
          name="title"
          rules={{ required: "عنوان الفعالية مطلوب" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="مثال: ورشة عمل البرمجة بالبايثون"
              placeholderTextColor="#A7A7AE"
              value={value}
              onChangeText={onChange}
              onFocus={(event) =>
                scrollFocusedInputIntoView(event.nativeEvent.target)
              }
              textAlign="right"
            />
          )}
        />
        {errors.title ? (
          <Text style={styles.errorText}>{errors.title.message}</Text>
        ) : null}

        <Text style={styles.label}>نوع الفعالية</Text>
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <>
              <Pressable
                style={({ pressed }) => [
                  styles.selectField,
                  pressed && styles.pressedSubtle,
                ]}
                onPress={() => setIsTypePickerOpen(true)}
              >
                <Ionicons
                  name="chevron-down-outline"
                  size={17}
                  color="#C9CAD1"
                />
                <Text style={styles.selectText}>{getTypeLabel(value)}</Text>
              </Pressable>

              <Modal
                visible={isTypePickerOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsTypePickerOpen(false)}
              >
                <Pressable
                  style={styles.modalOverlay}
                  onPress={() => setIsTypePickerOpen(false)}
                >
                  <Pressable style={styles.typeSheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.typeSheetTitle}>اختاري نوع الفعالية</Text>
                    {EVENT_TYPES.map((type) => {
                      const isActive = type.id === value;

                      return (
                        <Pressable
                          key={type.id}
                          style={[
                            styles.typeOption,
                            isActive && styles.typeOptionActive,
                          ]}
                          onPress={() => {
                            onChange(type.id);
                            setIsTypePickerOpen(false);
                          }}
                        >
                          <Ionicons
                            name={
                              isActive
                                ? "checkmark-circle"
                                : "ellipse-outline"
                            }
                            size={20}
                            color={isActive ? "#34C759" : "#C9CAD1"}
                          />
                          <Text
                            style={[
                              styles.typeOptionText,
                              isActive && styles.typeOptionTextActive,
                            ]}
                          >
                            {type.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </Pressable>
                </Pressable>
              </Modal>
            </>
          )}
        />

        <View style={styles.twoColumnRow}>
          <View style={styles.fieldColumn}>
            <Text style={styles.label}>التاريخ</Text>
            <Controller
              control={control}
              name="date"
              rules={{ required: "التاريخ مطلوب" }}
              render={({ field: { onChange, value } }) => (
                <>
                  <View
                    style={[styles.inputShell, errors.date && styles.inputError]}
                  >
                    <Pressable
                      hitSlop={10}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="#1F2937"
                      />
                    </Pressable>
                    <TextInput
                      style={styles.shellInput}
                      placeholder="yyyy-mm-dd"
                      placeholderTextColor="#A7A7AE"
                      value={value}
                      onChangeText={(text) => onChange(formatDateInput(text))}
                      onFocus={(event) =>
                        scrollFocusedInputIntoView(event.nativeEvent.target)
                      }
                      textAlign="right"
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>

                  {showDatePicker ? (
                    shouldUsePickerSheet ? (
                      <Modal
                        visible
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowDatePicker(false)}
                      >
                        <Pressable
                          style={styles.pickerOverlay}
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Pressable style={styles.pickerSheet}>
                            <View style={styles.pickerHeader}>
                              <Pressable
                                onPress={() => setShowDatePicker(false)}
                              >
                                <Text style={styles.pickerDoneText}>تم</Text>
                              </Pressable>
                              <Text style={styles.pickerTitle}>
                                اختاري التاريخ
                              </Text>
                            </View>
                            <DateTimePicker
                              value={getDatePickerValue(value)}
                              mode="date"
                              display="spinner"
                              onChange={(event, selectedDate) => {
                                if (selectedDate) {
                                  onChange(
                                    selectedDate.toISOString().split("T")[0],
                                  );
                                }
                              }}
                            />
                          </Pressable>
                        </Pressable>
                      </Modal>
                    ) : (
                      <DateTimePicker
                        value={getDatePickerValue(value)}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            onChange(selectedDate.toISOString().split("T")[0]);
                          }
                        }}
                      />
                    )
                  ) : null}
                </>
              )}
            />
          </View>

          <View style={styles.fieldColumn}>
            <Text style={styles.label}>الوقت</Text>
            <Controller
              control={control}
              name="time"
              rules={{ required: "الوقت مطلوب" }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Pressable
                    hitSlop={8}
                    onPressIn={openMainTimePicker}
                    style={({ pressed }) => [
                      styles.inputShell,
                      errors.time && styles.inputError,
                      pressed && styles.pressedSubtle,
                    ]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color="#1F2937"
                    />
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.shellText,
                        !value && styles.placeholderText,
                      ]}
                    >
                      {value || "--:--"}
                    </Text>
                  </Pressable>

                  {showTimePicker ? (
                    shouldUsePickerSheet ? (
                      <Modal
                        visible
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowTimePicker(false)}
                      >
                        <Pressable
                          style={styles.pickerOverlay}
                          onPress={() => setShowTimePicker(false)}
                        >
                          <Pressable style={styles.pickerSheet}>
                            <View style={styles.pickerHeader}>
                              <Pressable
                                onPress={() => setShowTimePicker(false)}
                              >
                                <Text style={styles.pickerDoneText}>تم</Text>
                              </Pressable>
                              <Text style={styles.pickerTitle}>
                                اختاري الوقت
                              </Text>
                            </View>
                            <DateTimePicker
                              value={getTimePickerValue(value)}
                              mode="time"
                              is24Hour
                              display="spinner"
                              onChange={(event, selectedTime) => {
                                if (selectedTime) {
                                  onChange(formatPickedTime(selectedTime));
                                }
                              }}
                            />
                          </Pressable>
                        </Pressable>
                      </Modal>
                    ) : (
                      <DateTimePicker
                        value={getTimePickerValue(value)}
                        mode="time"
                        is24Hour
                        display="clock"
                        onChange={(event, selectedTime) => {
                          setShowTimePicker(false);
                          if (selectedTime) {
                            onChange(formatPickedTime(selectedTime));
                          }
                        }}
                      />
                    )
                  ) : null}
                </>
              )}
            />
          </View>
        </View>

        <View style={styles.twoColumnRow}>
          <View style={styles.fieldColumn}>
            <Text style={styles.label}>المكان</Text>
            <Controller
              control={control}
              name="location"
              rules={{ required: "المكان مطلوب" }}
              render={({ field: { onChange, value } }) => (
                <View
                  style={[
                    styles.iconInputWrapper,
                    errors.location && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color="#C6C7CE"
                  />
                  <TextInput
                    style={styles.iconInput}
                    placeholder="مثال: قاعة الحاسوب"
                    placeholderTextColor="#A7A7AE"
                    value={value}
                    onChangeText={onChange}
                    onFocus={(event) =>
                      scrollFocusedInputIntoView(event.nativeEvent.target)
                    }
                    textAlign="right"
                  />
                </View>
              )}
            />
          </View>

          <View style={styles.fieldColumn}>
            <Text style={styles.label}>الحد الأقصى</Text>
            <Controller
              control={control}
              name="capacity"
              rules={{ required: "الحد الأقصى مطلوب" }}
              render={({ field: { onChange, value } }) => (
                <View
                  style={[
                    styles.iconInputWrapper,
                    errors.capacity && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="people-outline"
                    size={16}
                    color="#C6C7CE"
                  />
                  <TextInput
                    style={styles.iconInput}
                    placeholder="مثال: 50"
                    placeholderTextColor="#A7A7AE"
                    value={value}
                    onChangeText={onChange}
                    onFocus={(event) =>
                      scrollFocusedInputIntoView(event.nativeEvent.target)
                    }
                    textAlign="right"
                    keyboardType="numeric"
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
                styles.detailsArea,
                errors.description && styles.inputError,
              ]}
              placeholder="اشرح هدف الفعالية، ماذا سيستفيد المشاركون، والمحاور الرئيسية..."
              placeholderTextColor="#A7A7AE"
              value={value}
              onChangeText={onChange}
              onFocus={(event) =>
                scrollFocusedInputIntoView(event.nativeEvent.target)
              }
              textAlign="right"
              multiline
              textAlignVertical="top"
            />
          )}
        />
        {errors.description ? (
          <Text style={styles.errorText}>{errors.description.message}</Text>
        ) : null}

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionOptional}>اختياري</Text>
          <Text style={styles.sectionTitle}>المتحدثون</Text>
        </View>
        <Controller
          control={control}
          name="content"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.speakersArea]}
              placeholder={
                "مثال:\nأ. محمد الأحمد — مهندس برمجيات في Google\nد. سارة نبيل — أستاذة في الجامعة الأردنية"
              }
              placeholderTextColor="#A7A7AE"
              value={value}
              onChangeText={onChange}
              onFocus={(event) =>
                scrollFocusedInputIntoView(event.nativeEvent.target)
              }
              textAlign="right"
              multiline
              textAlignVertical="top"
            />
          )}
        />

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionOptional}>اختياري</Text>
          <Text style={styles.sectionTitle}>الجدول الزمني</Text>
        </View>

        <View style={styles.scheduleList}>
          {scheduleItems.map((item, index) => (
            <Fragment key={item.id}>
              <View style={styles.scheduleRow}>
                <Pressable
                  onPress={() => removeScheduleItem(item.id)}
                  style={styles.deleteSessionButton}
                >
                  <Ionicons name="close-outline" size={18} color="#FF3B30" />
                </Pressable>

                <View style={styles.sessionNameInput}>
                  <TextInput
                    style={styles.sessionInputText}
                    placeholder="اسم الجلسة أو النشاط"
                    placeholderTextColor="#B7B8C0"
                    value={item.title}
                    onChangeText={(value) =>
                      updateScheduleItem(item.id, "title", value)
                    }
                    onFocus={(event) =>
                      scrollFocusedInputIntoView(event.nativeEvent.target)
                    }
                    textAlign="right"
                  />
                </View>

                <Pressable
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.sessionTimeInput,
                    pressed && styles.pressedSubtle,
                  ]}
                  onPressIn={() => openScheduleTimePicker(item.id)}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.sessionTimeText,
                      !item.time && styles.placeholderText,
                    ]}
                  >
                    {item.time || "--:--"}
                  </Text>
                  <Ionicons name="time-outline" size={12} color="#111827" />
                </Pressable>

                <View style={styles.sessionNumber}>
                  <Text style={styles.sessionNumberText}>{index + 1}</Text>
                </View>
              </View>

              {activeScheduleTimePickerId === item.id ? (
                shouldUsePickerSheet ? (
                  <Modal
                    visible
                    transparent
                    animationType="fade"
                    onRequestClose={() => setActiveScheduleTimePickerId(null)}
                  >
                    <Pressable
                      style={styles.pickerOverlay}
                      onPress={() => setActiveScheduleTimePickerId(null)}
                    >
                      <Pressable style={styles.pickerSheet}>
                        <View style={styles.pickerHeader}>
                          <Pressable
                            onPress={() => setActiveScheduleTimePickerId(null)}
                          >
                            <Text style={styles.pickerDoneText}>تم</Text>
                          </Pressable>
                          <Text style={styles.pickerTitle}>اختاري الوقت</Text>
                        </View>
                        <DateTimePicker
                          value={getTimePickerValue(item.time)}
                          mode="time"
                          is24Hour
                          display="spinner"
                          onChange={(event, selectedTime) => {
                            if (selectedTime) {
                              updateScheduleItem(
                                item.id,
                                "time",
                                formatPickedTime(selectedTime),
                              );
                            }
                          }}
                        />
                      </Pressable>
                    </Pressable>
                  </Modal>
                ) : (
                  <DateTimePicker
                    value={getTimePickerValue(item.time)}
                    mode="time"
                    is24Hour
                    display="clock"
                    onChange={(event, selectedTime) => {
                      setActiveScheduleTimePickerId(null);
                      if (selectedTime) {
                        updateScheduleItem(
                          item.id,
                          "time",
                          formatPickedTime(selectedTime),
                        );
                      }
                    }}
                  />
                )
              ) : null}
            </Fragment>
          ))}
        </View>

        <Pressable
          onPress={addScheduleItem}
          style={({ pressed }) => [
            styles.addSessionButton,
            pressed && styles.pressedSubtle,
          ]}
        >
          <Text style={styles.addSessionText}>إضافة جلسة</Text>
          <Ionicons name="add-outline" size={18} color="#34C759" />
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
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>
                {isEditing ? "حفظ التعديلات" : "نشر الفعالية"}
              </Text>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#FFFFFF"
              />
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 0,
    paddingBottom: 168,
    gap: 8,
  },
  uploadCard: {
    minHeight: 155,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(60,60,67,0.08)",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 2,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: "rgba(52,199,89,0.13)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: "#A7A7AE",
    textAlign: "center",
    writingDirection: "rtl",
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: "#27272A",
    textAlign: "right",
    writingDirection: "rtl",
  },
  input: {
    minHeight: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(60,60,67,0.09)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: "#27272A",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    writingDirection: "rtl",
  },
  inputError: {
    borderColor: SemanticColors.red,
  },
  selectField: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(60,60,67,0.09)",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  selectText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: "#3F3F46",
    textAlign: "right",
    writingDirection: "rtl",
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  fieldColumn: {
    flex: 1,
    gap: 6,
  },
  inputShell: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(60,60,67,0.09)",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  shellText: {
    flex: 1,
    marginHorizontal: 6,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: "#27272A",
    textAlign: "right",
  },
  placeholderText: {
    color: "#A7A7AE",
  },
  shellInput: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    marginHorizontal: 6,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: "#27272A",
    writingDirection: "ltr",
  },
  iconInputWrapper: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(60,60,67,0.09)",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  iconInput: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    color: "#27272A",
    writingDirection: "rtl",
  },
  detailsArea: {
    minHeight: 109,
    paddingTop: 15,
    lineHeight: 22,
  },
  speakersArea: {
    minHeight: 96,
    paddingTop: 16,
    lineHeight: 24,
  },
  sectionTitleRow: {
    marginTop: 13,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: "#27272A",
    textAlign: "right",
    writingDirection: "rtl",
  },
  sectionOptional: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: "#A7A7AE",
    textAlign: "left",
    writingDirection: "rtl",
  },
  scheduleList: {
    gap: 7,
    marginTop: 2,
  },
  scheduleRow: {
    height: 39,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteSessionButton: {
    width: 32,
    height: 32,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: "rgba(255,59,48,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  sessionNameInput: {
    flex: 1,
    height: 39,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(60,60,67,0.09)",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  sessionTimeInput: {
    width: 80,
    height: 39,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(60,60,67,0.09)",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessionInputText: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: "#27272A",
    writingDirection: "rtl",
  },
  sessionTimeText: {
    flex: 1,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    color: "#27272A",
    textAlign: "center",
  },
  sessionNumber: {
    width: 34,
    height: 34,
    borderRadius: Dimensions.radiusFull,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
  },
  sessionNumberText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: "#FFFFFF",
  },
  addSessionButton: {
    height: 44,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(52,199,89,0.38)",
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addSessionText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: "#34C759",
    writingDirection: "rtl",
  },
  submitButton: {
    height: 56,
    marginTop: 18,
    borderRadius: 15,
    backgroundColor: "#34C759",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.extrabold,
    color: "#FFFFFF",
    writingDirection: "rtl",
  },
  pressedSubtle: {
    opacity: 0.78,
  },
  errorText: {
    marginTop: -6,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.xs,
    color: SemanticColors.red,
    textAlign: "right",
    writingDirection: "rtl",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.34)",
    justifyContent: "flex-end",
    padding: 18,
  },
  typeSheet: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#E4E4E7",
    marginBottom: 12,
  },
  typeSheetTitle: {
    marginBottom: 10,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: "#27272A",
    textAlign: "right",
    writingDirection: "rtl",
  },
  typeOption: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeOptionActive: {
    backgroundColor: "rgba(52,199,89,0.1)",
  },
  typeOptionText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: "#52525B",
    textAlign: "right",
    writingDirection: "rtl",
  },
  typeOptionTextActive: {
    color: "#249E47",
    fontWeight: FontWeight.bold,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.34)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  pickerTitle: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: "#27272A",
    textAlign: "right",
    writingDirection: "rtl",
  },
  pickerDoneText: {
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: "#34C759",
    writingDirection: "rtl",
  },
});
