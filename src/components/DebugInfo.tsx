import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { getDiningLocations, getMenuItemsByLocation } from '../services/dataService';

const DebugInfo = () => {
  const [info, setInfo] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    setInfo(['Starting diagnostics...']);
    
    try {
      // Check Firebase connection
      setInfo(prev => [...prev, 'Checking Firebase connection...']);
      
      // Check dining locations
      setInfo(prev => [...prev, 'Fetching dining locations...']);
      const locations = await getDiningLocations();
      setInfo(prev => [...prev, `Found ${locations.length} dining locations`]);
      
      if (locations.length > 0) {
        // Show first location
        const firstLocation = locations[0];
        setInfo(prev => [...prev, `First location: ${firstLocation.name || firstLocation.id}`]);
        
        // Check menu items for first location
        setInfo(prev => [...prev, `Fetching menu items for ${firstLocation.name || firstLocation.id}...`]);
        const menuItems = await getMenuItemsByLocation(firstLocation.name || firstLocation.id);
        setInfo(prev => [...prev, `Found ${menuItems.length} menu items`]);
        
        if (menuItems.length > 0) {
          const firstItem = menuItems[0];
          setInfo(prev => [...prev, `First menu item: ${firstItem.foodName || firstItem.name || 'Unknown'}`]);
          setInfo(prev => [...prev, `Item properties: ${Object.keys(firstItem).join(', ')}`]);
          
          // Show more detailed information about the first item
          setInfo(prev => [...prev, '--- First Item Details ---']);
          setInfo(prev => [...prev, `ID: ${firstItem.id || 'N/A'}`]);
          setInfo(prev => [...prev, `Name: ${firstItem.name || firstItem.foodName || 'N/A'}`]);
          setInfo(prev => [...prev, `Location: ${firstItem.location || firstItem.locations || 'N/A'}`]);
          setInfo(prev => [...prev, `Category: ${firstItem.category || 'N/A'}`]);
          setInfo(prev => [...prev, `Station: ${firstItem.station || 'N/A'}`]);
          setInfo(prev => [...prev, `Meal Type: ${firstItem.mealType || firstItem.menuTypes || 'N/A'}`]);
          setInfo(prev => [...prev, `Price: ${firstItem.price || 'N/A'}`]);
          setInfo(prev => [...prev, `Date: ${firstItem.date || firstItem.menuItemDate || 'N/A'}`]);
          setInfo(prev => [...prev, `Description: ${(firstItem.description || firstItem.text || 'N/A').substring(0, 50)}...`]);
          
          // Show raw data for debugging
          setInfo(prev => [...prev, '--- Raw Data ---']);
          setInfo(prev => [...prev, JSON.stringify(firstItem).substring(0, 200) + '...']);
        } else {
          setInfo(prev => [...prev, 'No menu items found for this location']);
        }
      }
      
      setInfo(prev => [...prev, 'Diagnostics completed']);
    } catch (error: any) {
      setInfo(prev => [...prev, `Error: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.headerText}>Debug Info {expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={runDiagnostics}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Run Diagnostics</Text>
          </TouchableOpacity>
          
          <ScrollView style={styles.logContainer}>
            {info.map((line, index) => (
              <Text key={index} style={styles.logLine}>{line}</Text>
            ))}
            {loading && <Text style={styles.loadingText}>Running...</Text>}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
  },
  headerText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  content: {
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
  },
  button: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.sm,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  logContainer: {
    maxHeight: 200,
    padding: SPACING.sm,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  logLine: {
    fontSize: FONT_SIZES.sm,
    marginBottom: 2,
  },
  loadingText: {
    fontStyle: 'italic',
    color: COLORS.textLight,
  },
});

export default DebugInfo;