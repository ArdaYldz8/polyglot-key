// Language detection service using pure JavaScript libraries
import { Language } from '@/types/translation';
import { LANGUAGES } from '@/constants/languages';
import { franc } from 'franc';
import { detect as langdetectDetect } from 'langdetect';

// Result of language detection with confidence scores
export interface DetectionResult {
  detectedLanguage: Language;
  confidence: number;
  alternativeLanguages: Array<{language: Language, confidence: number}>;
}

// Language code mapping between franc's ISO 639-3 codes and our app's ISO 639-1 codes
const languageCodeMapping: Record<string, string> = {
  'eng': 'en', // English
  'tur': 'tr', // Turkish
  'spa': 'es', // Spanish
  'fra': 'fr', // French
  'deu': 'de', // German
  'rus': 'ru', // Russian
  'ara': 'ar', // Arabic
  'zho': 'zh', // Chinese
  'jpn': 'ja', // Japanese
  'kor': 'ko', // Korean
  'ita': 'it', // Italian
  'por': 'pt'  // Portuguese
};

class LanguageDetectionService {
  // Minimum confidence threshold for reliable detection
  private readonly minConfidence = 0.3;
  
  // Minimum text length for more accurate detection
  private readonly minTextLength = 10;
  
  /**
   * Detect language of input text
   * @param text Text to detect language for
   * @param options Detection options
   * @returns Detection result with confidence scoring
   */
  async detectLanguage(text: string, options?: {
    onlySupported?: boolean; // Only return languages supported by our app
    minConfidence?: number; // Override default minimum confidence
  }): Promise<DetectionResult> {
    const minConfidence = options?.minConfidence || this.minConfidence;
    
    if (!text || text.trim().length < this.minTextLength) {
      // For very short text, return default with low confidence
      return this.createDefaultResult();
    }
    
    try {
      // Use franc for primary language detection
      // It returns ISO 639-3 code and confidence
      const francResult = franc(text, {
        minLength: 5,
        only: Object.keys(languageCodeMapping)
      });
      
      // Use langdetect as a secondary detector for alternatives and verification
      const langdetectResults = langdetectDetect(text);
      
      // Get the ISO 639-1 code from franc's ISO 639-3 code
      const iso6391Code = languageCodeMapping[francResult] || 'en';
      
      // Find the language object in our app's supported languages
      const detectedLanguage = LANGUAGES.find(lang => lang.code === iso6391Code) 
        || LANGUAGES.find(lang => lang.code === 'en')
        || LANGUAGES[0];
        
      // Calculate confidence based on both libraries
      let confidence = 0.6; // Default moderate confidence
      
      // Improve confidence if both libraries agree on the top language
      if (langdetectResults && langdetectResults.length > 0) {
        const topLangdetectCode = this.getLangdetectCode(langdetectResults[0].lang);
        if (topLangdetectCode === iso6391Code) {
          confidence = Math.min(0.95, 0.7 + langdetectResults[0].prob);
        } else {
          confidence = 0.5; // Lower confidence when libraries disagree
        }
      }
      
      // Get alternative languages from langdetect results
      const alternatives = this.getAlternativeLanguages(langdetectResults, detectedLanguage.code);
      
      return {
        detectedLanguage,
        confidence,
        alternativeLanguages: alternatives
      };
    } catch (error) {
      console.error('Error detecting language:', error);
      return this.createDefaultResult();
    }
  }
  
  /**
   * Get alternative languages from langdetect results
   */
  private getAlternativeLanguages(
    langdetectResults: Array<{lang: string, prob: number}> | null,
    primaryCode: string
  ): Array<{language: Language, confidence: number}> {
    if (!langdetectResults || langdetectResults.length <= 1) {
      return [];
    }
    
    const alternatives: Array<{language: Language, confidence: number}> = [];
    
    // Take the top 3 alternatives
    for (let i = 0; i < Math.min(4, langdetectResults.length); i++) {
      const result = langdetectResults[i];
      const code = this.getLangdetectCode(result.lang);
      
      // Skip the primary language
      if (code === primaryCode) continue;
      
      const language = LANGUAGES.find(lang => lang.code === code);
      if (language) {
        alternatives.push({
          language,
          confidence: Math.min(0.9, result.prob)
        });
      }
      
      // Only include 3 alternatives max
      if (alternatives.length >= 3) break;
    }
    
    return alternatives;
  }
  
  /**
   * Convert langdetect's language code to ISO 639-1
   */
  private getLangdetectCode(langdetectCode: string): string {
    // Langdetect uses codes like 'en', 'tr', etc. directly
    // But sometimes they're suffixed with regional codes like 'en-GB'
    const baseLang = langdetectCode.split('-')[0].toLowerCase();
    
    // Return the base language code if it's one of our supported languages
    return LANGUAGES.some(lang => lang.code === baseLang) ? baseLang : 'en';
  }
  
  /**
   * Create a default result when detection fails
   */
  private createDefaultResult(): DetectionResult {
    const english = LANGUAGES.find(lang => lang.code === 'en') || LANGUAGES[0];
    
    return {
      detectedLanguage: english,
      confidence: 0.3,
      alternativeLanguages: []
    };
  }
  
  /**
   * Manual override for language detection
   * @param text Text to analyze
   * @param manualLanguageCode User-specified language code
   * @returns Detection result with high confidence for manual selection
   */
  manualLanguageOverride(text: string, manualLanguageCode: string): DetectionResult {
    const language = LANGUAGES.find(lang => lang.code === manualLanguageCode);
    
    if (!language) {
      return this.createDefaultResult();
    }
    
    return {
      detectedLanguage: language,
      confidence: 0.98, // Manual selection has very high confidence
      alternativeLanguages: [] // No alternatives for manual selection
    };
  }
}

export const languageDetectionService = new LanguageDetectionService();
