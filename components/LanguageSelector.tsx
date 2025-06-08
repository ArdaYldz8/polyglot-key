import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Language } from '@/types/translation';
import { ChevronDown } from 'lucide-react-native';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  languages: Language[];
  onLanguageSelect: (language: Language) => void;
  expanded: boolean;
  onToggle: () => void;
  title: string;
}

export function LanguageSelector({
  selectedLanguage,
  languages,
  onLanguageSelect,
  expanded,
  onToggle,
  title
}: LanguageSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity style={styles.selector} onPress={onToggle}>
        <Text style={styles.flag}>{selectedLanguage.flag}</Text>
        <Text style={styles.languageName}>{selectedLanguage.name}</Text>
        <ChevronDown 
          size={20} 
          color="#6b7280" 
          style={[styles.chevron, expanded && styles.chevronRotated]} 
        />
      </TouchableOpacity>
      
      {expanded && (
        <ScrollView style={styles.dropdown} showsVerticalScrollIndicator={false}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageOption,
                selectedLanguage.code === language.code && styles.selectedOption
              ]}
              onPress={() => {
                onLanguageSelect(language);
                onToggle();
              }}
            >
              <Text style={styles.optionFlag}>{language.flag}</Text>
              <View style={styles.languageInfo}>
                <Text style={styles.optionName}>{language.name}</Text>
                <Text style={styles.optionNativeName}>{language.nativeName}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  flag: {
    fontSize: 20,
    marginRight: 12,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1f2937',
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    maxHeight: 200,
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
  },
  optionFlag: {
    fontSize: 18,
    marginRight: 12,
  },
  languageInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1f2937',
  },
  optionNativeName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
});