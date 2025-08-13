import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { requestPasswordReset } from '../../services/supabase';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSignIn = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please enter email and password');
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (!res.success) Alert.alert('Error', res.error || 'Sign-in failed');
  };

  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please enter email and password');
    setLoading(true);
    const res = await signUp(email, password);
    setLoading(false);
    if (!res.success) Alert.alert('Error', res.error || 'Sign-up failed');
  };

  const handleForgot = async () => {
    if (!email) return Alert.alert('Forgot Password', 'Enter your email above first.');
    const { error } = await requestPasswordReset(email);
    if (error) return Alert.alert('Error', error.message || 'Could not send reset email');
    Alert.alert('Check your email', 'We sent a password reset link.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BuckeyeGrub</Text>
      <Text style={styles.subtitle}>Sign in or create an account</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity style={[styles.submitButton, loading && { opacity: 0.7 }]} onPress={handleSignIn} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.secondaryText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={handleForgot} disabled={loading}>
          <Text style={styles.linkText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
  form: {
    width: '100%',
    maxWidth: 300,
  },
  input: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  submitText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  secondaryText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
  },
  link: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  linkText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    textDecorationLine: 'underline',
  },
}); 