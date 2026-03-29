import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, FontSize, FontWeight } from '@/styles/ui-theme';

export function ProfileLoadingBanner() {
  return (
    <View style={styles.loadingBanner}>
      <Text style={styles.loadingBannerText}>يتم تحميل بيانات الملف الشخصي...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBanner: {
    marginHorizontal: 18,
    marginTop: 14,
    borderRadius: 16,
    paddingVertical: 11,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  loadingBannerText: {
    color: Colors.primary,
    fontFamily: FontFamily.cairo,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
});
