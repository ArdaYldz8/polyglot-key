// Configuration for ML models, including names, URLs for download, versions, etc.

export interface ModelConfigItem {
  id: string;
  name: string;
  description: string;
  url: string;
  version: string;
  size: number; // in MB
  srcLang: string;
  targetLang: string;
  lastUpdated: string; // ISO date string
}

// Example model configurations for TensorFlow.js models
export const MODEL_CONFIGS: ModelConfigItem[] = [
  {
    id: 'en2tr-small',
    name: 'English to Turkish (Small)',
    description:
      'Compact TensorFlow.js model for English to Turkish translation',
    // Using TensorFlow Hub placeholder URLs - these would be replaced with actual model URLs
    url: 'https://tfhub.dev/tensorflow/tfjs-model/opus-mt-en-tr/1/model.json',
    version: '1.0.0',
    size: 25, // MB
    srcLang: 'en',
    targetLang: 'tr',
    lastUpdated: '2024-06-01',
  },
  {
    id: 'tr2en-small',
    name: 'Turkish to English (Small)',
    description:
      'Compact TensorFlow.js model for Turkish to English translation',
    url: 'https://tfhub.dev/tensorflow/tfjs-model/opus-mt-tr-en/1/model.json',
    version: '1.0.0',
    size: 25, // MB
    srcLang: 'tr',
    targetLang: 'en',
    lastUpdated: '2024-06-01',
  },
  {
    id: 'opus-mt-en2tr-base',
    name: 'OPUS-MT English to Turkish',
    description:
      'Base OPUS-MT model for English to Turkish translation with improved accuracy',
    url: 'https://tfhub.dev/tensorflow/tfjs-model/opus-mt-en-tr/1/model.json',
    version: '1.1.0',
    size: 65, // MB
    srcLang: 'en',
    targetLang: 'tr',
    lastUpdated: '2024-06-05',
  },
];
