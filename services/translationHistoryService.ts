import * as FileSystem from 'react-native-fs';
import { Language } from '@/types/translation';

export interface TranslationHistoryItem {
  id: string; // Unique ID for the item, e.g., timestamp or UUID
  originalText: string;
  translatedText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  timestamp: number; // Unix timestamp
  isFavorite: boolean;
  modelId?: string; // Optional: model used for translation
  translationConfidence?: number; // Optional: confidence of this specific translation
  detectionConfidence?: number; // Optional: confidence of source language detection if auto-detected
  qualityFeedback?: number; // Optional: e.g., 1 for good, -1 for bad, 0 for neutral/no feedback
}

const HISTORY_FILE_PATH = `${FileSystem.DocumentDirectoryPath}/translation_history.json`;

export class TranslationHistoryService {
  private static instance: TranslationHistoryService;
  private history: TranslationHistoryItem[] = [];
  private isLoaded: boolean = false;

  private constructor() {
    this._loadHistoryFromFile().catch(error => 
      console.error('Failed to load translation history on init:', error)
    );
  }

  public static getInstance(): TranslationHistoryService {
    if (!TranslationHistoryService.instance) {
      TranslationHistoryService.instance = new TranslationHistoryService();
    }
    return TranslationHistoryService.instance;
  }

  private async _ensureLoaded(): Promise<void> {
    if (!this.isLoaded) {
      await this._loadHistoryFromFile();
    }
  }

  private async _loadHistoryFromFile(): Promise<void> {
    try {
      const fileExists = await FileSystem.exists(HISTORY_FILE_PATH);
      if (fileExists) {
        const content = await FileSystem.readFile(HISTORY_FILE_PATH, 'utf8');
        this.history = JSON.parse(content);
        console.log('Translation history loaded successfully.');
      } else {
        this.history = [];
        console.log('No existing translation history file found. Initializing empty history.');
      }
    } catch (error) {
      console.error('Error loading translation history:', error);
      this.history = []; // Fallback to empty history on error
    }
    this.isLoaded = true;
  }

  private async _saveHistoryToFile(): Promise<void> {
    try {
      const jsonContent = JSON.stringify(this.history, null, 2); // Pretty print JSON
      await FileSystem.writeFile(HISTORY_FILE_PATH, jsonContent, 'utf8');
      console.log('Translation history saved successfully.');
    } catch (error) {
      console.error('Error saving translation history:', error);
      // Potentially re-throw or handle more gracefully depending on requirements
    }
  }

  public async getHistory(count?: number): Promise<TranslationHistoryItem[]> {
    await this._ensureLoaded();
    // Return a copy to prevent direct modification of the internal array
    const sortedHistory = [...this.history].sort((a, b) => b.timestamp - a.timestamp);
    return count ? sortedHistory.slice(0, count) : sortedHistory;
  }

  public async addTranslation(itemDetails: Omit<TranslationHistoryItem, 'id' | 'timestamp' | 'isFavorite'>): Promise<TranslationHistoryItem> {
    await this._ensureLoaded();
    const newItem: TranslationHistoryItem = {
      ...itemDetails,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 15), // Simple unique ID
      timestamp: Date.now(),
      isFavorite: false,
    };
    this.history.unshift(newItem); // Add to the beginning for chronological order (newest first)
    // Optional: Limit history size
    // const MAX_HISTORY_SIZE = 100;
    // if (this.history.length > MAX_HISTORY_SIZE) {
    //   this.history.pop(); // Remove the oldest item
    // }
    await this._saveHistoryToFile();
    return newItem;
  }

  public async toggleFavorite(itemId: string): Promise<TranslationHistoryItem | undefined> {
    await this._ensureLoaded();
    const itemIndex = this.history.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      this.history[itemIndex].isFavorite = !this.history[itemIndex].isFavorite;
      await this._saveHistoryToFile();
      return this.history[itemIndex];
    }
    console.warn(`Item with id ${itemId} not found for toggling favorite.`);
    return undefined;
  }

  public async deleteTranslation(itemId: string): Promise<void> {
    await this._ensureLoaded();
    const initialLength = this.history.length;
    this.history = this.history.filter(item => item.id !== itemId);
    if (this.history.length < initialLength) {
      await this._saveHistoryToFile();
      console.log(`Translation item ${itemId} deleted.`);
    } else {
      console.warn(`Item with id ${itemId} not found for deletion.`);
    }
  }

  public async clearHistory(): Promise<void> {
    this.history = [];
    await this._saveHistoryToFile();
    console.log('Translation history cleared.');
  }

  public async getFavorites(): Promise<TranslationHistoryItem[]> {
    await this._ensureLoaded();
    return [...this.history]
      .filter(item => item.isFavorite)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  public async submitFeedback(itemId: string, feedbackScore: number): Promise<TranslationHistoryItem | undefined> {
    await this._ensureLoaded();
    const itemIndex = this.history.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      this.history[itemIndex].qualityFeedback = feedbackScore;
      await this._saveHistoryToFile();
      console.log(`Feedback ${feedbackScore} submitted for item ${itemId}`);
      return this.history[itemIndex];
    }
    console.warn(`Item with id ${itemId} not found for submitting feedback.`);
    return undefined;
  }
}

// Create a singleton instance of the service
export const translationHistoryService = TranslationHistoryService.getInstance();
