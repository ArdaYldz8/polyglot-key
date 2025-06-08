import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpDown, Clipboard, Sparkles } from 'lucide-react-native';
import { LanguageSelector } from '@/components/LanguageSelector';
import { TranslationCard } from '@/components/TranslationCard';
import { translationService } from '@/services/translationService';
import { Language, TranslationResult } from '@/types/translation';
import { LANGUAGES } from '@/constants/languages';
import * as ClipboardModule from 'expo-clipboard';

export default function TranslateScreen() {
  const [inputText, setInputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<Language>(LANGUAGES[0]);
  const [targetLanguage, setTargetLanguage] = useState<Language>(LANGUAGES[1]);
  const [sourceExpanded, setSourceExpanded] = useState(false);
  const [targetExpanded, setTargetExpanded] = useState(false);
  const [translationResults, setTranslationResults] = useState<TranslationResult[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleSwapLanguages = useCallback(() => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
  }, [sourceLanguage, targetLanguage]);

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    const startTime = Date.now();

    try {
      const translatedText = await translationService.translate(
        inputText,
        sourceLanguage,
        targetLanguage
      );

      const processingTime = Date.now() - startTime;
      const confidence = 0.85 + Math.random() * 0.15; // Mock confidence

      const result: TranslationResult = {
        originalText: inputText,
        translatedText,
        sourceLanguage,
        targetLanguage,
        confidence,
        processingTime,
      };

      setTranslationResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
      setInputText('');
    } catch (error) {
      Alert.alert('Translation Error', 'Failed to translate text. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  }, [inputText, sourceLanguage, targetLanguage]);

  const handlePasteAndTranslate = useCallback(async () => {
    try {
      const clipboardText = await ClipboardModule.getStringAsync();
      if (clipboardText && clipboardText.length > 0) {
        setInputText(clipboardText);
        
        // Auto-detect language if different from current source
        const detectedLanguage = await translationService.detectLanguage(clipboardText);
        if (detectedLanguage.code !== sourceLanguage.code) {
          setSourceLanguage(detectedLanguage);
        }
      }
    } catch (error) {
      Alert.alert('Clipboard Error', 'Failed to read clipboard content.');
    }
  }, [sourceLanguage]);

  const handleCopyResult = useCallback(() => {
    Alert.alert('Copied!', 'Translation copied to clipboard.');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Sparkles size={24} color="#3b82f6" />
            <Text style={styles.headerTitle}>Polyglot Key</Text>
          </View>
          <Text style={styles.headerSubtitle}>Privacy-first real-time translation</Text>
        </View>

        {/* Language Selectors */}
        <View style={styles.languageContainer}>
          <LanguageSelector
            title="From"
            selectedLanguage={sourceLanguage}
            languages={LANGUAGES}
            onLanguageSelect={setSourceLanguage}
            expanded={sourceExpanded}
            onToggle={() => {
              setSourceExpanded(!sourceExpanded);
              setTargetExpanded(false);
            }}
          />
          
          <TouchableOpacity style={styles.swapButton} onPress={handleSwapLanguages}>
            <ArrowUpDown size={20} color="#6b7280" />
          </TouchableOpacity>
          
          <LanguageSelector
            title="To"
            selectedLanguage={targetLanguage}
            languages={LANGUAGES}
            onLanguageSelect={setTargetLanguage}
            expanded={targetExpanded}
            onToggle={() => {
              setTargetExpanded(!targetExpanded);
              setSourceExpanded(false);
            }}
          />
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.textInput}
            placeholder="Type text to translate..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            multiline
            textAlignVertical="top"
          />
          
          <View style={styles.inputActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePasteAndTranslate}>
              <Clipboard size={16} color="#6b7280" />
              <Text style={styles.secondaryButtonText}>Paste & Detect</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.primaryButton, (!inputText.trim() || isTranslating) && styles.primaryButtonDisabled]}
              onPress={handleTranslate}
              disabled={!inputText.trim() || isTranslating}
            >
              <Text style={styles.primaryButtonText}>
                {isTranslating ? 'Translating...' : 'Translate'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Indicator */}
        <View style={styles.privacyIndicator}>
          <View style={styles.privacyDot} />
          <Text style={styles.privacyText}>Processing locally • Zero data sent to servers</Text>
        </View>

        {/* Translation Results */}
        <View style={styles.resultsSection}>
          {translationResults.length > 0 && (
            <Text style={styles.resultsTitle}>Recent Translations</Text>
          )}
          {translationResults.map((result, index) => (
            <TranslationCard
              key={`${result.originalText}-${index}`}
              result={result}
              onCopy={handleCopyResult}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  swapButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 28,
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1f2937',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#475569',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  privacyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  privacyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  privacyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#059669',
  },
  resultsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 16,
  },
});