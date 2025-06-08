export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// This TranslationResult is used by the UI and components like TranslationCard.
// It might be superseded or merged with AppTranslationResult.
export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  confidence: number;
  processingTime: number;
  // The fields below are from MlService's TranslationResult and TranslationHistoryItem
  // and should be part of a more comprehensive result type if this one is kept.
  modelId?: string; 
  translationConfidence?: number; // Renaming 'confidence' to 'translationConfidence' for clarity
  detectionConfidence?: number;
  alternatives?: AlternativeTranslation[];
  id?: string; // Optional: if generated for UI list keys before history save
}

export interface AlternativeTranslation {
  text: string;
  confidence?: number;
}

/**
 * AppTranslationResult is the comprehensive type intended for use in the UI state 
 * and as the object passed around after a translation operation, containing all relevant details.
 */
export interface AppTranslationResult {
  id?: string; // Optional: client-generated for list keys, or from history item
  originalText: string;
  translatedText: string;
  sourceLanguage: Language; // Actual source language used (detected or manually selected)
  targetLanguage: Language;
  detectionResult?: {
    detectedLanguage: Language;
    confidence: number;
    // alternatives?: { language: Language; confidence: number }[]; // From languageDetectionService if needed
  } | null; // Information about language detection if performed
  translationAPIResult?: {
    modelId: string;
    confidence?: number; // Confidence from the translation model
    alternatives?: AlternativeTranslation[]; // N-best suggestions from model
    timeTaken?: number; // Processing time from ML service
  }; // Result from the core translation (e.g., mlService)
  // Redundant fields for easier access, derived from above or set directly
  modelId?: string; 
  translationConfidence?: number;
  detectionConfidence?: number;
  processingTime?: number; // Could be from translationAPIResult.timeTaken or UI calculated
  // For UI state, potentially linking to history item
  historyItemId?: string;
}

export interface ModelInfo {
  languagePair: string;
  size: string;
  downloaded: boolean;
  accuracy: string;
}