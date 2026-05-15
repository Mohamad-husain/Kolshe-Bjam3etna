import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
} from '@/styles/ui-theme';

import { startOfDay } from './shared';

type Props = {
  visible: boolean;
  value: Date;
  minimumDate: Date;
  onChange: (date: Date) => void;
  onConfirm: (date?: Date) => void;
  onCancel: () => void;
};

export function ServiceRequestDatePicker({
  visible,
  value,
  minimumDate,
  onChange,
  onConfirm,
  onCancel,
}: Props) {
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type !== 'set' || !selectedDate) {
      if (Platform.OS === 'android') {
        onCancel();
      }

      return;
    }

    const normalizedDate = startOfDay(selectedDate);

    if (normalizedDate.getTime() < minimumDate.getTime()) {
      if (Platform.OS === 'android') {
        onCancel();
      }

      return;
    }

    onChange(normalizedDate);

    if (Platform.OS === 'android') {
      onConfirm(normalizedDate);
    }
  };

  if (visible && Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={value}
        mode="date"
        minimumDate={minimumDate}
        onChange={handleDateChange}
        positiveButton={{ label: 'تم' }}
        negativeButton={{ label: 'إلغاء' }}
      />
    );
  }

  return (
    <Modal
      visible={visible && Platform.OS === 'ios'}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onCancel} />

        <View style={styles.pickerSheet}>
          <View style={styles.calendarHandle} />
          <Text style={styles.pickerSheetTitle}>اختر الموعد النهائي</Text>

          <DateTimePicker
            value={value}
            mode="date"
            display="spinner"
            minimumDate={minimumDate}
            onChange={handleDateChange}
            locale="ar"
            textColor="#111827"
            themeVariant="light"
            style={styles.iosDatePicker}
          />

          <View style={styles.pickerActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.pickerActionButton,
                styles.pickerSecondaryAction,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.pickerSecondaryActionText}>إلغاء</Text>
            </Pressable>

            <Pressable
              onPress={() => onConfirm()}
              style={({ pressed }) => [
                styles.pickerActionButton,
                styles.pickerPrimaryAction,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.pickerPrimaryActionText}>تم</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.16)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  pickerSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 10,
  },
  calendarHandle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(142,142,147,0.25)',
    marginBottom: 14,
  },
  pickerSheetTitle: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.base,
    fontWeight: FontWeight.extrabold,
    textAlign: 'center',
    marginBottom: 10,
  },
  iosDatePicker: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  pickerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerActionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerPrimaryAction: {
    backgroundColor: Colors.primary,
  },
  pickerSecondaryAction: {
    backgroundColor: '#f3f4f8',
  },
  pickerPrimaryActionText: {
    color: '#ffffff',
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  pickerSecondaryActionText: {
    color: Colors.foreground,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  pressed: { transform: [{ scale: 0.98 }] },
});
