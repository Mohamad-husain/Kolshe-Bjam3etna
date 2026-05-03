import { Text, View } from 'react-native';

import { serviceRequestStyles as styles } from './shared';

type Props = {
  step: 1 | 2 | 3;
  title: string;
  subtitle: string;
};

export function ServiceRequestSectionHeader({ step, title, subtitle }: Props) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.sectionNumber}>
        <Text style={styles.sectionNumberText}>{step}</Text>
      </View>
    </View>
  );
}
