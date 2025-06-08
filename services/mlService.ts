// Machine Learning Service for NMT models using TensorFlow.js

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { modelManager, ModelInfo } from './modelManager';
import { MODEL_CONFIGS, ModelConfigItem } from '../constants/modelConfigs';

export interface AlternativeTranslation {
  text: string;
  confidence?: number;
}

export interface TranslationResult {
  translatedText: string;
  confidence?: number;
  alternatives?: AlternativeTranslation[];
  timeTaken?: number;
  modelId: string;
}

export class MlService {
  private isTfReady = false;
  private activeModels: { [modelId: string]: any } = {}; // tf.GraphModel
  private tokenizers: { [modelId: string]: any } = {}; // Simple placeholder for tokenizers

  constructor() {
    // Initialize TensorFlow.js when the service is created
    this.initializeTf();
  }

  /**
   * Initializes the TensorFlow.js backend for React Native
   */
  private async initializeTf(): Promise<void> {
    try {
      // Wait for TensorFlow.js to be ready
      await tf.ready();
      this.isTfReady = true;
      console.log('TensorFlow.js backend initialized successfully');
      
      // Log available backends
      const backends = tf.engine().registryFactory.getRegisteredBackends();
      console.log('Available TensorFlow.js backends:', backends);
      
      // Log current backend
      console.log('Current backend:', tf.getBackend());
    } catch (error) {
      console.error('Error initializing TensorFlow.js backend:', error);
      throw new Error('Failed to initialize TensorFlow.js backend');
    }
  }

  /**
   * Ensures that TF.js is initialized
   * @returns Promise resolving when TF.js is ready
   */
  private async ensureTfReady(): Promise<void> {
    if (!this.isTfReady) {
      await this.initializeTf();
    }
  }

  /**
   * Loads a model using the model manager
   * @param modelId ID of the model to load
   * @param forceReload Whether to force reload the model even if it's already loaded
   * @returns Promise resolving to the loaded model
   */
  public async loadModel(modelId: string, forceReload = false): Promise<any> { // tf.GraphModel
    await this.ensureTfReady();

    // Return the model if it's already loaded and no force reload is requested
    if (this.activeModels[modelId] && !forceReload) {
      console.log(`Model ${modelId} is already loaded`);
      return this.activeModels[modelId];
    }

    try {
      // Get the model path from the model manager
      const modelInfo = await modelManager.getModel(modelId);
      if (!modelInfo.localPath) {
        throw new Error(`Model ${modelId} has no local path. It may not be downloaded yet.`);
      }

      console.log(`Loading model ${modelId} from ${modelInfo.localPath}...`);
      const startTime = Date.now();

      // Load the model from the local path
      const model = await tf.loadGraphModel(`file://${modelInfo.localPath}`);
      console.log(`Model ${modelId} loaded in ${Date.now() - startTime}ms`);

      // Store the model in the active models cache
      this.activeModels[modelId] = model;

      // Log the model input and output shapes for debugging
      const inputShape = model.inputs[0].shape;
      const outputShape = model.outputs[0].shape;
      console.log(`Model ${modelId} input shape:`, inputShape);
      console.log(`Model ${modelId} output shape:`, outputShape);

      return model;
    } catch (error) {
      console.error(`Error loading model ${modelId}:`, error);
      throw new Error(`Failed to load model ${modelId}`);
    }
  }

  async runInference(model: any, input: any): Promise<any> { // tf.GraphModel, tf.Tensor
    await this.ensureTfReady();
    console.log('Running inference...');
    try {
      const output = model.predict(input) as any; // tf.Tensor | tf.Tensor[]
      // Remember to dispose tensors when done to free up memory:
      // input.dispose();
      // output.dispose(); (if it's a single tensor and you're done with it here)
      return output;
    } catch (error) {
      console.error('Error during model inference:', error);
      if (input && typeof input.dispose === 'function') {
        input.dispose(); // Dispose input tensor on error
      }
      throw error;
    }
  }
  
  /**
   * Find the best model for the given language pair
   * @param sourceCode Source language code
   * @param targetCode Target language code
   * @returns Model config or undefined if no suitable model
   */
  public findModelForLanguagePair(sourceCode: string, targetCode: string): ModelConfigItem | undefined {
    // Try to find an exact match first
    const exactMatch = MODEL_CONFIGS.find(
      config => config.srcLang === sourceCode && config.targetLang === targetCode
    );
    
    if (exactMatch) {
      return exactMatch;
    }
    
    // If no exact match, return undefined
    // In a more advanced implementation, we could try to find a pivot model
    // e.g., source -> English -> target if direct path doesn't exist
    return undefined;
  }
  
  /**
   * Tokenize input text for model processing
   * @param text Input text
   * @param modelId Model ID to use tokenizer for
   * @returns Tensor representation of the input
   */
  private tokenize(text: string, modelId: string): any { // tf.Tensor
    // TODO: Implement proper tokenization based on the model
    // This is a placeholder - actual implementation will depend on the model format
    
    console.log(`Tokenizing text for model ${modelId}: "${text}"`);  
    
    // Simple character-level tokenization as a placeholder
    // In real implementation, this would use model-specific tokenizer
    const charCodes = Array.from(text).map(c => c.charCodeAt(0));
    
    // Create input tensor with batch dimension (assuming model expects batch dim)
    // Shape would be [1, sequence_length]
    const inputTensor = tf.tensor2d([charCodes], [1, charCodes.length]);
    
    return inputTensor;
  }
  
  /**
   * Detokenize model output to text
   * @param output Model output tensor
   * @param modelId Model ID to use detokenizer for
   * @returns Decoded text string with confidence scores
   */
  private detokenize(output: any, modelId: string): { translatedText: string; confidence?: number; alternatives?: AlternativeTranslation[] } { // tf.Tensor | tf.Tensor[]
    try {
      console.log(`Detokenizing output for model ${modelId}`);  
      
      // For transformer/NMT models, output typically contains probability distributions
      // We'll implement confidence scoring based on the model's predicted probabilities
      
      const mainTensor = Array.isArray(output) ? output[0] : output;
      const outputArray = mainTensor.arraySync() as number[][];
      const firstBatchItem = outputArray[0];
      
      // Calculate confidence score from probability distributions
      const confidenceScore = this.calculateTranslationConfidence(firstBatchItem);
      
      // Generate alternative translations from top-k predictions
      const alternatives = this.generateAlternativeTranslations(firstBatchItem, modelId);
      
      // Simple character-level detokenization as a placeholder
      // TODO: Replace with proper subword/BPE tokenization for production models
      const translatedText = String.fromCharCode(...firstBatchItem.map(code => Math.max(32, Math.min(126, Math.round(Math.abs(code))))));
      
      console.log(`Translation confidence: ${confidenceScore.toFixed(3)}, alternatives: ${alternatives.length}`);

      return { 
        translatedText, 
        confidence: confidenceScore,
        alternatives: alternatives
      };
    } catch (error) {
      console.error('Error during detokenization:', error);
      return { 
        translatedText: "[Error during detokenization]", 
        confidence: 0,
        alternatives: []
      };
    } finally {
      // Clean up tensors to avoid memory leaks
      if (Array.isArray(output)) {
        output.forEach(tensor => {
          if (tensor && typeof tensor.dispose === 'function') {
            tensor.dispose();
          }
        });
      } else if (output && typeof output.dispose === 'function') {
        output.dispose();
      }
    }
  }
  
  /**
   * Calculate translation confidence score from model output probabilities
   * @param predictions Array of prediction values from the model
   * @returns Confidence score between 0 and 1
   */
  private calculateTranslationConfidence(predictions: number[]): number {
    if (!predictions || predictions.length === 0) {
      return 0;
    }

    // Method 1: Average probability confidence
    // For sequence-to-sequence models, we typically have probabilities for each token
    // We'll use the geometric mean of token probabilities as overall confidence
    
    // Convert to probabilities using softmax-like normalization
    const probs = this.softmax(predictions);
    
    // Calculate geometric mean of top probabilities (confidence measure)
    const geometricMean = Math.pow(
      probs.reduce((prod, prob) => prod * Math.max(prob, 0.001), 1), // Min prob to avoid log(0)
      1 / probs.length
    );
    
    // Method 2: Entropy-based confidence (lower entropy = higher confidence)
    const entropy = -probs.reduce((sum, prob) => {
      return sum + (prob > 0 ? prob * Math.log(prob) : 0);
    }, 0);
    
    const maxEntropy = Math.log(probs.length); // Maximum possible entropy
    const normalizedEntropy = entropy / maxEntropy;
    const entropyConfidence = 1 - normalizedEntropy; // Invert so higher = more confident
    
    // Method 3: Maximum probability (confidence of the most likely prediction)
    const maxProb = Math.max(...probs);
    
    // Combine different confidence measures with weights
    const combinedConfidence = (
      0.4 * geometricMean +        // Overall sequence confidence
      0.3 * entropyConfidence +    // Certainty of predictions
      0.3 * maxProb               // Peak prediction confidence
    );
    
    // Ensure result is between 0 and 1
    return Math.max(0, Math.min(1, combinedConfidence));
  }

  /**
   * Apply softmax function to convert logits to probabilities
   * @param logits Array of raw model outputs
   * @returns Array of probabilities summing to 1
   */
  private softmax(logits: number[]): number[] {
    // Subtract max for numerical stability
    const maxLogit = Math.max(...logits);
    const expLogits = logits.map(x => Math.exp(x - maxLogit));
    const sumExp = expLogits.reduce((sum, exp) => sum + exp, 0);
    
    return expLogits.map(exp => exp / sumExp);
  }

  /**
   * Generate alternative translation suggestions from model predictions
   * @param predictions Model output predictions
   * @param modelId Model ID for context
   * @returns Array of alternative translations with confidence scores
   */
  private generateAlternativeTranslations(predictions: number[], modelId: string): AlternativeTranslation[] {
    try {
      // Convert predictions to probabilities
      const probs = this.softmax(predictions);
      
      // Create alternatives by sampling different high-probability paths
      const alternatives: AlternativeTranslation[] = [];
      
      // Sort probabilities with indices to get top-k predictions
      const sortedProbs = probs
        .map((prob, index) => ({ prob, index }))
        .sort((a, b) => b.prob - a.prob);
      
      // Generate top 3 alternatives (excluding the top prediction which is the main result)
      for (let i = 1; i < Math.min(4, sortedProbs.length); i++) {
        const altProb = sortedProbs[i];
        
        // Skip alternatives with very low confidence
        if (altProb.prob < 0.1) continue;
        
        // Generate alternative text (placeholder implementation)
        // In production, this would involve beam search or sampling from the model
        const altPredictions = [...predictions];
        altPredictions[altProb.index] = altPredictions[altProb.index] * 1.1; // Slight variation
        
        const altText = String.fromCharCode(
          ...altPredictions.map(code => Math.max(32, Math.min(126, Math.round(Math.abs(code)))))
        );
        
        alternatives.push({
          text: altText,
          confidence: altProb.prob
        });
      }
      
      return alternatives;
    } catch (error) {
      console.error('Error generating alternative translations:', error);
      return [];
    }
  }
  
  /**
   * Translate text using the appropriate ML model
   * @param text Text to translate
   * @param sourceLanguage Source language code
   * @param targetLanguage Target language code
   * @param modelId Model ID to use for translation
   * @returns TranslationResult containing the translated text
   */
  public async translateText(
    text: string, 
    sourceLanguage: string, // Retained for context/logging, but modelId is primary
    targetLanguage: string, // Retained for context/logging, but modelId is primary
    modelId: string
  ): Promise<TranslationResult> {
    // Start timer for performance tracking
    const startTime = Date.now();
    
    try {
      // Find model configuration using the provided modelId
      const modelConfig = MODEL_CONFIGS.find(config => config.id === modelId);
      if (!modelConfig) {
        throw new Error(`No model configuration found for modelId: ${modelId}`);
      }
      // Optional: Validate if sourceLanguage and targetLanguage match modelConfig if needed
      // if (modelConfig.srcLang !== sourceLanguage || modelConfig.targetLang !== targetLanguage) {
      //   console.warn(`Mismatch between provided languages (${sourceLanguage}-${targetLanguage}) and model languages (${modelConfig.srcLang}-${modelConfig.targetLang}) for modelId ${modelId}. Using model's languages.`);
      // }  
      
      // Load the model if not already loaded
      const model = await this.loadModel(modelConfig.id);
      
      // Tokenize the input text
      const inputTensor = this.tokenize(text, modelConfig.id);
      
      // Run the model inference
      const outputTensor = await this.runInference(model, inputTensor);
      
      // Cleanup input tensor
      if (inputTensor && typeof inputTensor.dispose === 'function') {
        inputTensor.dispose();
      }
      
      // Detokenize the output
      const detokenizationResult = this.detokenize(outputTensor, modelConfig.id);
      
      // Calculate time taken
      const timeTaken = Date.now() - startTime;
      console.log(`Translation completed in ${timeTaken}ms`);
      
      // Use confidence from detokenization if available, otherwise a default placeholder
      const confidence = detokenizationResult.confidence !== undefined ? detokenizationResult.confidence : 0.75; // Default if not provided by model
      
      return {
        translatedText: detokenizationResult.translatedText,
        confidence,
        alternatives: detokenizationResult.alternatives || [], // Ensure alternatives is always an array
        timeTaken,
        modelId: modelConfig.id
      };
    } catch (error) {
      console.error('Error during translation:', error);
      throw error;
    }
  }
}

// Create a singleton instance of the service
const mlServiceInstance = new MlService();
export { mlServiceInstance as mlService };
