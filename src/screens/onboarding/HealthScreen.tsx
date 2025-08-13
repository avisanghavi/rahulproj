import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { supabase, upsertProfile } from '../../services/supabase';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type Nav = NavigationProp<{ Allergies: undefined }>;

type Fitness = 'lose_weight' | 'maintain' | 'gain_weight' | 'build_muscle';
const fitnessOptions: { id: Fitness; title: string; desc: string }[] = [
  { id: 'lose_weight', title: 'Lose Weight', desc: 'Reduce body weight gradually' },
  { id: 'maintain', title: 'Maintain Weight', desc: 'Keep current weight stable' },
  { id: 'gain_weight', title: 'Gain Weight', desc: 'Increase body weight healthily' },
  { id: 'build_muscle', title: 'Build Muscle', desc: 'Increase muscle mass and strength' },
];

const activityOptions = [
  { id: 'sedentary', title: 'Sedentary', desc: 'Little to no exercise' },
  { id: 'light', title: 'Light', desc: 'Light exercise 1–3 days/week' },
  { id: 'moderate', title: 'Moderate', desc: 'Moderate exercise 3–5 days/week' },
  { id: 'very_active', title: 'Very Active', desc: 'Hard exercise 6–7 days/week' },
  { id: 'extremely_active', title: 'Extremely Active', desc: 'Training 2x/day' },
] as const;

export default function HealthScreen() {
  const navigation = useNavigation<Nav>();
  const [fitness, setFitness] = useState<Fitness>('maintain');
  const [activity, setActivity] = useState<typeof activityOptions[number]['id']>('moderate');
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    setSaving(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      await upsertProfile({ id: user.id, fitnessGoals: fitness, activityLevel: activity });
    }
    setSaving(false);
    navigation.navigate('Allergies');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Health & Fitness Goals</Text>

      <Text style={styles.section}>Fitness Goal</Text>
      {fitnessOptions.map(opt => (
        <TouchableOpacity key={opt.id} style={[styles.card, fitness === opt.id && styles.cardSelected]} onPress={() => setFitness(opt.id)}>
          <Text style={styles.cardTitle}>{opt.title}</Text>
          <Text style={styles.cardDesc}>{opt.desc}</Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.section, { marginTop: SPACING.lg }]}>Activity Level</Text>
      {activityOptions.map(opt => (
        <TouchableOpacity key={opt.id} style={[styles.card, activity === opt.id && styles.cardSelected]} onPress={() => setActivity(opt.id)}>
          <Text style={styles.cardTitle}>{opt.title}</Text>
          <Text style={styles.cardDesc}>{opt.desc}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[styles.next, saving && { opacity: 0.6 }]} onPress={handleNext} disabled={saving}>
        <Text style={styles.nextText}>Save & Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.lg, backgroundColor: COLORS.background },
  title: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.lg },
  section: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  card: { borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, padding: SPACING.md, marginBottom: SPACING.sm },
  cardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  cardDesc: { color: COLORS.textLight, marginTop: 2 },
  next: { marginTop: SPACING.lg, backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  nextText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '600' },
}); 