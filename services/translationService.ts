import { Language } from '@/types/translation';
import { LANGUAGES } from '@/constants/languages';
import { mlService, TranslationResult as MlServiceTranslationResult } from './mlService';
import { languageDetectionService, DetectionResult } from './languageDetectionService';
import { modelManager, ModelInfo } from './modelManager';
import { MODEL_CONFIGS } from '../constants/modelConfigs';
import { translationHistoryService } from './translationHistoryService';

export interface TranslationOptions {
  useOfflineOnly?: boolean;
  preferredModel?: string;
  maxTimeout?: number;
}

interface ModelStatus {
  isDownloaded: boolean;
  isDownloading: boolean;
  downloadProgress?: number;
}

class TranslationService {
  private modelStatus: Map<string, ModelStatus> = new Map();
  private fallbackToMock: boolean = true; // Use mocks as fallback when ML model fails
  private initialized: boolean = false;

  constructor() {
    // Initialize the service
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Check which models are available/downloaded
      const availableModels = modelManager.getAvailableModels();
      
      // Map model status
      availableModels.forEach(model => {
        const modelId = model.id;
        this.modelStatus.set(modelId, {
          isDownloaded: model.isDownloaded,
          isDownloading: false,
          downloadProgress: model.downloadProgress
        });
      });
      
      this.initialized = true;
      console.log('Translation service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize translation service:', error);
      // Still mark as initialized to prevent further init attempts
      this.initialized = true;
    }
  }

  /**
   * Translate text using ML models with offline-first approach
   */
  async translate(
    text: string, 
    sourceLanguageInput: Language | null, // null for auto-detect
    targetLanguage: Language, 
    options: TranslationOptions = {}
  ): Promise<MlServiceTranslationResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    let sourceLanguage: Language;
    let detectionConfidence: number | undefined;

    if (sourceLanguageInput === null) {
      console.log('Auto-detecting source language...');
      const detectionResult = await languageDetectionService.detectLanguage(text);
      sourceLanguage = detectionResult.detectedLanguage;
      detectionConfidence = detectionResult.confidence;
      console.log(`Detected source language: ${sourceLanguage.name} (Confidence: ${detectionConfidence.toFixed(2)})`);
      if (detectionResult.confidence < 0.6) {
        console.warn(`Low confidence in language detection (${detectionResult.confidence.toFixed(2)}). Proceeding with ${sourceLanguage.name}, but result might be inaccurate.`);
      }
    } else {
      sourceLanguage = sourceLanguageInput;
    }
    
    try {
      // Try to get model ID for this language pair
      const modelId = this.getModelIdForLanguagePair(sourceLanguage.code, targetLanguage.code);
      
      if (!modelId) {
        console.log(`No model available for ${sourceLanguage.code} to ${targetLanguage.code}, using fallback`);
        const mockResult = this.mockTranslate(text, sourceLanguage, targetLanguage);
        // Add to history
        translationHistoryService.addTranslation({
          originalText: text,
          translatedText: mockResult.translatedText,
          sourceLanguage,
          targetLanguage,
          modelId: 'mock_no_model_config',
          translationConfidence: mockResult.confidence,
          detectionConfidence
        }).catch(err => console.error('Failed to add no model config mock translation to history:', err));
        return mockResult;
      }
      
      // Check if model is downloaded
      const modelStatus = this.modelStatus.get(modelId);
      if (!modelStatus?.isDownloaded) {
        // Start download if not downloading already
        if (!modelStatus?.isDownloading && !options.useOfflineOnly) {
          this.downloadModel(sourceLanguage.code, targetLanguage.code);
        }
        const mockResult = this.mockTranslate(text, sourceLanguage, targetLanguage);
        // Add to history
        translationHistoryService.addTranslation({
          originalText: text,
          translatedText: mockResult.translatedText,
          sourceLanguage,
          targetLanguage,
          modelId: 'mock_model_unavailable',
          translationConfidence: mockResult.confidence,
          detectionConfidence
        }).catch(err => console.error('Failed to add unavailable model mock translation to history:', err));
        return mockResult;
      }
      
      // Translate using ML service
      const mlResult = await mlService.translateText(text, sourceLanguage.code, targetLanguage.code, modelId);
      // Add to history
      translationHistoryService.addTranslation({
        originalText: text,
        translatedText: mlResult.translatedText,
        sourceLanguage,
        targetLanguage,
        modelId: mlResult.modelId,
        translationConfidence: mlResult.confidence,
        detectionConfidence
      }).catch(err => console.error('Failed to add ML translation to history:', err));
      return mlResult;
    } catch (error) {
      console.error('Translation error:', error);
      
      if (this.fallbackToMock) {
        console.log('Falling back to mock translation');
        const mockResult = this.mockTranslate(text, sourceLanguage, targetLanguage);
        // Add to history
        translationHistoryService.addTranslation({
          originalText: text,
          translatedText: mockResult.translatedText,
          sourceLanguage,
          targetLanguage,
          modelId: mockResult.modelId,
          translationConfidence: mockResult.confidence,
          detectionConfidence
        }).catch(err => console.error('Failed to add mock translation to history:', err));
        return mockResult;
      }
      
      throw error;
    }
  }

  /**
   * Mock translation for cases where ML models are unavailable
   */
  private mockTranslate(text: string, sourceLanguage: Language, targetLanguage: Language): MlServiceTranslationResult {
    // Mock translations for common phrases
    const mockTranslations: Record<string, Record<string, string>> = {
      'hello': {
        'tr': 'merhaba',
        'es': 'hola',
        'fr': 'bonjour',
      },
      'thank you': {
        'tr': 'teşekkür ederim',
        'es': 'gracias',
        'fr': 'merci',
      },
      'goodbye': {
        'tr': 'hoşça kal',
        'es': 'adiós',
        'fr': 'au revoir',
      }
    };

    // Try to find a mock translation
    const lowerText = text.toLowerCase().trim();
    let translatedText = `[${targetLanguage.name}] ${text}`;
    if (mockTranslations[lowerText] && mockTranslations[lowerText][targetLanguage.code]) {
      translatedText = mockTranslations[lowerText][targetLanguage.code];
    }

    return {
      translatedText,
      modelId: 'mock',
      confidence: 0.1, // Low confidence for mocks
      timeTaken: 10, // Small arbitrary time
      alternatives: []
    };
  }

  /**
   * Get the appropriate model ID for a language pair
   */
  private getModelIdForLanguagePair(sourceCode: string, targetCode: string): string | undefined {
    // Look for an exact match
    const exactMatch = MODEL_CONFIGS.find(
      config => config.srcLang === sourceCode && config.targetLang === targetCode
    );
    
    if (exactMatch) {
      return exactMatch.id;
    }
    
    return undefined;
  }

  /**
   * Check if a model for the given language pair is downloaded
   */
  isModelDownloaded(sourceCode: string, targetCode: string): boolean {
    const modelId = this.getModelIdForLanguagePair(sourceCode, targetCode);
    if (!modelId) return false;
    
    const status = this.modelStatus.get(modelId);
    return status?.isDownloaded || false;
  }

  /**
   * Get download status for a specific language pair
   */
  getModelStatus(sourceCode: string, targetCode: string): ModelStatus | undefined {
    const modelId = this.getModelIdForLanguagePair(sourceCode, targetCode);
    if (!modelId) return undefined;
    
    return this.modelStatus.get(modelId);
  }

  /**
   * Download model for a specific language pair
   */
  async downloadModel(sourceCode: string, targetCode: string): Promise<void> {
    const modelId = this.getModelIdForLanguagePair(sourceCode, targetCode);
    if (!modelId) {
      console.error(`No model available for ${sourceCode} to ${targetCode}`);
      throw new Error(`No model available for ${sourceCode} to ${targetCode}`);
    }
    
    // Update status to downloading
    this.modelStatus.set(modelId, { 
      isDownloaded: false, 
      isDownloading: true,
      downloadProgress: 0
    });
    
    try {
      // Start the download
      const modelInfo = await modelManager.downloadModel(modelId);
      
      // Update status to downloaded
      this.modelStatus.set(modelId, {
        isDownloaded: true,
        isDownloading: false,
        downloadProgress: 1
      });
      
      return;
    } catch (error) {
      // Update status to not downloading on error
      this.modelStatus.set(modelId, { 
        isDownloaded: false, 
        isDownloading: false,
        downloadProgress: undefined
      });
      
      throw error;
    }
  }

  /**
   * Get available language pairs
   */
  getAvailableLanguages(): Language[] {
    return LANGUAGES;
  }
  
  /**
   * Get all available language pairs with model status
   */
  getAvailableLanguagePairs(): {sourceCode: string, targetCode: string, status: ModelStatus}[] {
    return MODEL_CONFIGS.map(config => ({
      sourceCode: config.srcLang,
      targetCode: config.targetLang,
      status: this.modelStatus.get(config.id) || { isDownloaded: false, isDownloading: false }
    }));
  }
}

export const translationService = new TranslationService();