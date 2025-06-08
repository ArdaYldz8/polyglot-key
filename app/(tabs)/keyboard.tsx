import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  TextInput,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Keyboard as KeyboardIcon, Languages, Space, Delete, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const KEYBOARD_KEYS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

export default function KeyboardScreen() {
  const [inputMode, setInputMode] = useState<'original' | 'translated'>('original');
  const [currentText, setCurrentText] = useState('');
  const [translationSuggestion, setTranslationSuggestion] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ES');

  const keyWidth = (width - 60) / 10 - 4; // Account for padding and gaps

  const handleKeyPress = (key: string) => {
    setCurrentText(prev => prev + key);
    
    // Simulate real-time translation suggestion
    const mockTranslations: Record<string, string> = {
      'h': 'h',
      'he': 'él',
      'hel': 'ayud',
      'hell': 'infiern',
      'hello': 'hola',
      'hello ': 'hola ',
      'hello w': 'hola m',
      'hello wo': 'hola mu',
      'hello wor': 'hola mund',
      'hello worl': 'hola mund',
      'hello world': 'hola mundo'
    };
    
    setTranslationSuggestion(mockTranslations[currentText + key] || '');
  };

  const handleBackspace = () => {
    setCurrentText(prev => prev.slice(0, -1));
  };

  const handleSpace = () => {
    setCurrentText(prev => prev + ' ');
  };

  const handleModeSwitch = () => {
    setInputMode(prev => prev === 'original' ? 'translated' : 'original');
  };

  const handleLanguageSwitch = () => {
    const languages = ['ES', 'FR', 'DE', 'IT', 'PT'];
    const currentIndex = languages.indexOf(selectedLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    setSelectedLanguage(languages[nextIndex]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <KeyboardIcon size={24} color="#3b82f6" />
            <Text style={styles.headerTitle}>Keyboard Demo</Text>
          </View>
          <Text style={styles.headerSubtitle}>Real-time translation as you type</Text>
        </View>

        {/* Input Display */}
        <View style={styles.inputDisplay}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>
              {inputMode === 'original' ? 'English Input' : `${selectedLanguage} Translation`}
            </Text>
            <TouchableOpacity style={styles.modeButton} onPress={handleModeSwitch}>
              <Text style={styles.modeButtonText}>
                {inputMode === 'original' ? 'Switch to Translation' : 'Switch to Original'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.textDisplay}
            value={inputMode === 'original' ? currentText : translationSuggestion}
            editable={false}
            multiline
            placeholder={inputMode === 'original' ? 'Start typing...' : 'Translation will appear here...'}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Suggestion Strip */}
        <View style={styles.suggestionStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.suggestionItem}>
              <Text style={styles.suggestionText}>hello</Text>
              <ArrowRight size={12} color="#6b7280" />
              <Text style={styles.suggestionTranslation}>hola</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.suggestionItem}>
              <Text style={styles.suggestionText}>world</Text>
              <ArrowRight size={12} color="#6b7280" />
              <Text style={styles.suggestionTranslation}>mundo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.suggestionItem}>
              <Text style={styles.suggestionText}>how are you</Text>
              <ArrowRight size={12} color="#6b7280" />
              <Text style={styles.suggestionTranslation}>¿cómo estás?</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Virtual Keyboard */}
        <View style={styles.keyboard}>
          {/* Top Row */}
          <View style={styles.keyboardRow}>
            {KEYBOARD_KEYS[0].map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.key, { width: keyWidth }]}
                onPress={() => handleKeyPress(key)}
              >
                <Text style={styles.keyText}>{key.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Middle Row */}
          <View style={styles.keyboardRow}>
            <View style={{ width: keyWidth / 2 }} />
            {KEYBOARD_KEYS[1].map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.key, { width: keyWidth }]}
                onPress={() => handleKeyPress(key)}
              >
                <Text style={styles.keyText}>{key.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ width: keyWidth / 2 }} />
          </View>

          {/* Bottom Row */}
          <View style={styles.keyboardRow}>
            <TouchableOpacity style={styles.actionKey} onPress={handleLanguageSwitch}>
              <Languages size={16} color="#ffffff" />
              <Text style={styles.actionKeyText}>{selectedLanguage}</Text>
            </TouchableOpacity>
            
            {KEYBOARD_KEYS[2].map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.key, { width: keyWidth }]}
                onPress={() => handleKeyPress(key)}
              >
                <Text style={styles.keyText}>{key.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.actionKey} onPress={handleBackspace}>
              <Delete size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Space Row */}
          <View style={styles.keyboardRow}>
            <TouchableOpacity style={styles.spaceBar} onPress={handleSpace}>
              <Space size={16} color="#6b7280" />
              <Text style={styles.spaceBarText}>Space</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Info */}
        <View style={styles.featuresInfo}>
          <Text style={styles.featuresTitle}>Keyboard Features</Text>
          <View style={styles.featureItem}>
            <View style={styles.featureBullet} />
            <Text style={styles.featureText}>Real-time translation suggestions as you type</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureBullet} />
            <Text style={styles.featureText}>Long-press Space to switch translation direction</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureBullet} />
            <Text style={styles.featureText}>Smart clipboard translation detection</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureBullet} />
            <Text style={styles.featureText}>Offline processing for complete privacy</Text>
          </View>
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
  inputDisplay: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  textDisplay: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    textAlignVertical: 'top',
  },
  suggestionStrip: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    marginRight: 6,
  },
  suggestionTranslation: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#3b82f6',
    marginLeft: 6,
  },
  keyboard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  key: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  keyText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
  },
  actionKey: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  actionKeyText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  spaceBar: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  spaceBarText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  featuresInfo: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  featuresTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginTop: 6,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    lineHeight: 20,
  },
});