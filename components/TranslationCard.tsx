import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Copy, Volume2 } from 'lucide-react-native';
import { TranslationResult } from '@/types/translation';
import * as Clipboard from 'expo-clipboard';

interface TranslationCardProps {
  result: TranslationResult;
  onCopy?: () => void;
}

export function TranslationCard({ result, onCopy }: TranslationCardProps) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(result.translatedText);
    onCopy?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.languageIndicator}>
          <Text style={styles.languageFlag}>{result.sourceLanguage.flag}</Text>
          <Text style={styles.languageCode}>{result.sourceLanguage.code.toUpperCase()}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={styles.languageIndicator}>
          <Text style={styles.languageFlag}>{result.targetLanguage.flag}</Text>
          <Text style={styles.languageCode}>{result.targetLanguage.code.toUpperCase()}</Text>
        </View>
        <View style={styles.processingInfo}>
          <Text style={styles.processingTime}>{result.processingTime}ms</Text>
          <View style={[styles.confidenceDot, { backgroundColor: result.confidence > 0.8 ? '#10b981' : '#f59e0b' }]} />
        </View>
      </View>
      
      <View style={styles.textContainer}>
        <View style={styles.textSection}>
          <Text style={styles.textLabel}>Original</Text>
          <Text style={styles.originalText}>{result.originalText}</Text>
        </View>
        
        <View style={styles.textSection}>
          <Text style={styles.textLabel}>Translation</Text>
          <Text style={styles.translatedText}>{result.translatedText}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
          <Copy size={16} color="#6b7280" />
          <Text style={styles.actionText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Volume2 size={16} color="#6b7280" />
          <Text style={styles.actionText}>Speak</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  languageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  languageFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  languageCode: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#475569',
  },
  arrow: {
    fontSize: 16,
    color: '#6b7280',
    marginHorizontal: 12,
  },
  processingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  processingTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    marginRight: 6,
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  textContainer: {
    marginBottom: 16,
  },
  textSection: {
    marginBottom: 12,
  },
  textLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  originalText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 24,
  },
  translatedText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    lineHeight: 26,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
});