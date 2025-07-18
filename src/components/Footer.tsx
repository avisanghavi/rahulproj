import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export default function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        <View style={styles.brandSection}>
          <Text style={styles.brandText}>BuckeyeGrub</Text>
          <Text style={styles.brandSubtext}>Powered by OSU Dining Services</Text>
        </View>
        
        <View style={styles.linksSection}>
          <TouchableOpacity style={styles.footerLink}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.footerLinkText}>About</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.footerLink}>
            <Ionicons name="help-circle-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.footerLinkText}>Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.footerLink}>
            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.footerLinkText}>Privacy</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.bottomLine}>
        <Text style={styles.copyrightText}>
          © 2025 The Ohio State University
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  footerContent: {
    marginBottom: SPACING.md,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  brandText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  brandSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  linksSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  footerLinkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  bottomLine: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    textAlign: 'center',
  },
}); 