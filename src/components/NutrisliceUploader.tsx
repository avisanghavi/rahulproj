import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadRestaurantData, parseNutrisliceData } from '../services/dataService';
import { NutrisliceRawData } from '../types';

interface NutrisliceUploaderProps {
  onUploadComplete?: () => void;
}

const NutrisliceUploader: React.FC<NutrisliceUploaderProps> = ({ onUploadComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentResult | null>(null);
  const [previewData, setPreviewData] = useState<NutrisliceRawData[]>([]);
  const [restaurantId, setRestaurantId] = useState('');

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setSelectedFile(result);
        await processFile(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const processFile = async (file: DocumentPicker.DocumentResult) => {
    if (file.type !== 'success') return;

    try {
      setIsLoading(true);
      
      // Read the file content
      const response = await fetch(file.uri);
      const csvData = await response.text();
      
      // Parse the data
      const parsedData = parseNutrisliceData(csvData);
      setPreviewData(parsedData.slice(0, 10)); // Show first 10 items as preview
      
      // Extract restaurant ID from the first row
      if (parsedData.length > 0) {
        const firstItem = parsedData[0];
        setRestaurantId(firstItem.nutrisliceId || 'unknown-restaurant');
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadData = async () => {
    if (!selectedFile || selectedFile.type !== 'success') {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    if (!restaurantId) {
      Alert.alert('Error', 'Please enter a restaurant ID');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(selectedFile.uri);
      const csvData = await response.text();
      
      const result = await uploadRestaurantData(restaurantId, csvData);
      
      if (result.success) {
        Alert.alert('Success', 'Restaurant data uploaded successfully!');
        setSelectedFile(null);
        setPreviewData([]);
        setRestaurantId('');
        onUploadComplete?.();
      } else {
        Alert.alert('Error', result.error || 'Failed to upload data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Upload Nutrislice Data</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Select CSV File</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={pickDocument}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {selectedFile ? 'File Selected' : 'Choose CSV File'}
          </Text>
        </TouchableOpacity>
        
        {selectedFile && selectedFile.type === 'success' && (
          <Text style={styles.fileInfo}>
            File: {selectedFile.name}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Restaurant ID</Text>
        <Text style={styles.input}>
          {restaurantId || 'Auto-detected from data'}
        </Text>
      </View>

      {previewData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Data Preview</Text>
          <Text style={styles.previewText}>
            Found {previewData.length} menu items (showing first 10)
          </Text>
          
          {previewData.map((item, index) => (
            <View key={index} style={styles.previewItem}>
              <Text style={styles.itemName}>{item.nutrisliceFoodName}</Text>
              <Text style={styles.itemDetails}>
                Location: {item.locations} | Category: {item.category}
              </Text>
              <Text style={styles.itemDetails}>
                Price: ${item.price} | Station: {item.station}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Upload Data</Text>
        <TouchableOpacity 
          style={[styles.button, styles.uploadButton]} 
          onPress={uploadData}
          disabled={isLoading || !selectedFile}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Upload to Firebase</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionText}>
          • Export your Nutrislice data as a CSV file
        </Text>
        <Text style={styles.instructionText}>
          • The file should contain all the required columns
        </Text>
        <Text style={styles.instructionText}>
          • Data will be processed and stored in Firebase
        </Text>
        <Text style={styles.instructionText}>
          • Menu items will be available in the app immediately
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fileInfo: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  input: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  previewText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  previewItem: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  instructions: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default NutrisliceUploader; 