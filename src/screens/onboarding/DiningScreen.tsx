import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { supabase, upsertProfile } from '../../services/supabase';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type Nav = NavigationProp<{ Health: undefined }>;

type Plan = { id: string; name: string; price: string; desc: string; details: string };

const plans: Plan[] = [
  { id: 'scarlet14', name: 'Scarlet 14', price: '$2,750/semester', desc: '14 meals per week with maximum flexibility', details: 'Swipes: 14 per week   BuckID: $250' },
  { id: 'gray10', name: 'Gray 10', price: '$2,350/semester', desc: '10 meals per week for lighter eaters', details: 'Swipes: 10 per week   BuckID: $300' },
  { id: 'traditions_all', name: 'Traditions', price: '$2,890/semester', desc: 'All-access dining hall plan', details: 'Swipes: Unlimited   BuckID: $200' },
  { id: 'carmen1', name: 'Carmen 1', price: '$1,995/semester', desc: 'High-value block plan for upperclassmen', details: 'Swipes: 165 per semester   BuckID: $400' },
  { id: 'carmen2', name: 'Carmen 2', price: '$1,495/semester', desc: 'Flexible block plan for light eaters', details: 'Swipes: 110 per semester   BuckID: $350' },
];

export default function DiningScreen() {
  const navigation = useNavigation<Nav>();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    setSaving(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      await upsertProfile({ id: user.id, diningPlan: selected || null });
    }
    setSaving(false);
    navigation.navigate('Health');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>OSU Dining Plan</Text>
      {plans.map(p => (
        <TouchableOpacity key={p.id} style={[styles.card, selected === p.id && styles.cardSelected]} onPress={() => setSelected(p.id)}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{p.name}</Text>
            <Text style={styles.cardPrice}>{p.price}</Text>
          </View>
          <Text style={styles.cardDesc}>{p.desc}</Text>
          <Text style={styles.cardDetails}>{p.details}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[styles.next, (!selected || saving) && { opacity: 0.6 }]} disabled={!selected || saving} onPress={handleNext}>
        <Text style={styles.nextText}>Save & Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.lg, backgroundColor: COLORS.background },
  title: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.lg },
  card: { borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, padding: SPACING.md, marginBottom: SPACING.md },
  cardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  cardTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  cardPrice: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.primary },
  cardDesc: { color: COLORS.text, marginBottom: SPACING.xs },
  cardDetails: { color: COLORS.textLight },
  next: { marginTop: SPACING.lg, backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  nextText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '600' },
}); 