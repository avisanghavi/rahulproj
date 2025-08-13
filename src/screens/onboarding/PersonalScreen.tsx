import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { supabase, upsertProfile } from '../../services/supabase';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type Nav = NavigationProp<{ Dining: undefined }>;

export default function PersonalScreen() {
  const navigation = useNavigation<Nav>();
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [yearAtOSU, setYearAtOSU] = useState<'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate' | null>(null);
  const [major, setMajor] = useState('');
  const [saving, setSaving] = useState(false);

  const years: Array<'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate'> = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

  const handleNext = async () => {
    setSaving(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      await upsertProfile({
        id: user.id,
        name: fullName || null,
        age: age ? Number(age) : null,
        weight: weight ? Number(weight) : null,
        height: height || null,
        yearAtOSU: yearAtOSU || null,
        major: major || null,
      });
    }
    setSaving(false);
    navigation.navigate('Dining');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Personal Information</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="John Buckeye" value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Age</Text>
        <TextInput style={styles.input} placeholder="20" keyboardType="number-pad" value={age} onChangeText={setAge} />

        <Text style={styles.label}>Weight (lbs)</Text>
        <TextInput style={styles.input} placeholder="165" keyboardType="number-pad" value={weight} onChangeText={setWeight} />

        <Text style={styles.label}>Height</Text>
        <TextInput style={styles.input} placeholder={'5\'10"'} value={height} onChangeText={setHeight} />

        <Text style={styles.label}>Year at OSU</Text>
        <View style={styles.rowWrap}>
          {years.map(y => (
            <TouchableOpacity key={y} style={[styles.chip, yearAtOSU === y && styles.chipSelected]} onPress={() => setYearAtOSU(y)}>
              <Text style={[styles.chipText, yearAtOSU === y && styles.chipTextSelected]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Major</Text>
        <TextInput style={styles.input} placeholder="Computer Science" value={major} onChangeText={setMajor} />

        <TouchableOpacity style={[styles.next, saving && { opacity: 0.7 }]} onPress={handleNext} disabled={saving}>
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  title: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.lg, textAlign: 'center' },
  label: { fontSize: FONT_SIZES.md, color: COLORS.text, marginTop: SPACING.md, marginBottom: SPACING.xs },
  input: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.backgroundLight, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, marginBottom: 8 },
  chipSelected: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.text },
  chipTextSelected: { color: COLORS.white, fontWeight: '600' },
  next: { marginTop: SPACING.xl, backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  nextText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '600' },
}); 