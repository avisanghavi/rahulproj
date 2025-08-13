import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { supabase, upsertProfile } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

const dietOptions = ['vegetarian','vegan','gluten-free','dairy-free','keto','paleo','kosher','halal','nut-free','soy-free','pescatarian'];
const allergenOptions = ['nuts','dairy','eggs','soy','wheat','fish','shellfish','sesame'];

export default function AllergiesScreen() {
  const { markOnboardingComplete } = useAuth();
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customAllergen, setCustomAllergen] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const handleFinish = async () => {
    setSaving(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      const diets = [...selectedDiets];
      const allergens = [...selectedAllergens];
      if (customAllergen.trim()) allergens.push(customAllergen.trim());
      await upsertProfile({ id: user.id, dietaryRestrictions: diets, onboardingComplete: true });
      markOnboardingComplete();
    }
    setSaving(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dietary Preferences</Text>

      <Text style={styles.section}>Dietary Restrictions</Text>
      <View style={styles.rowWrap}>
        {dietOptions.map(opt => (
          <TouchableOpacity key={opt} style={[styles.chip, selectedDiets.includes(opt) && styles.chipSelected]} onPress={() => toggle(selectedDiets, setSelectedDiets, opt)}>
            <Text style={[styles.chipText, selectedDiets.includes(opt) && styles.chipTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.section, { marginTop: SPACING.lg }]}>Allergens to Avoid</Text>
      <View style={styles.rowWrap}>
        {allergenOptions.map(opt => (
          <TouchableOpacity key={opt} style={[styles.allergen, selectedAllergens.includes(opt) && styles.allergenSelected]} onPress={() => toggle(selectedAllergens, setSelectedAllergens, opt)}>
            <Text style={[styles.allergenText, selectedAllergens.includes(opt) && styles.allergenTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.section, { marginTop: SPACING.lg }]}>Add Custom Allergen</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="e.g., coconut" value={customAllergen} onChangeText={setCustomAllergen} />
      </View>

      <TouchableOpacity style={[styles.next, saving && { opacity: 0.6 }]} onPress={handleFinish} disabled={saving}>
        <Text style={styles.nextText}>Finish</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.lg, backgroundColor: COLORS.background },
  title: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.lg },
  section: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.backgroundLight, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, marginBottom: 8 },
  chipSelected: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.text },
  chipTextSelected: { color: COLORS.white, fontWeight: '600' },
  allergen: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.warning, marginRight: 8, marginBottom: 8 },
  allergenSelected: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  allergenText: { color: COLORS.warning },
  allergenTextSelected: { color: COLORS.primaryDark, fontWeight: '600' },
  input: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  next: { marginTop: SPACING.lg, backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  nextText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '600' },
}); 