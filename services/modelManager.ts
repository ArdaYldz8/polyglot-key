// Manages downloading, caching, and versioning of ML models
import * as FileSystem from 'react-native-fs';
import { MODEL_CONFIGS, ModelConfigItem } from '../constants/modelConfigs';

export interface ModelInfo {
  id: string;
  name: string;
  url: string;
  version: string;
  localPath?: string;
  isDownloaded: boolean;
  downloadProgress?: number;
  downloadJobId?: number;
  lastChecked?: Date;
  priority?: number; // Higher number = higher priority
  downloadSize?: number; // Size in bytes
  usageCount?: number; // How often this model is used
  lastUsed?: Date; // When this model was last used
}

export interface DownloadQueueItem {
  modelId: string;
  priority: number;
  estimatedSize: number;
  addedAt: Date;
}

export interface ProgressiveDownloadOptions {
  maxConcurrentDownloads?: number;
  prioritizeByUsage?: boolean;
  downloadOnWifiOnly?: boolean;
  maxStorageUsage?: number; // Maximum storage in bytes
}

export class ModelManager {
  private static instance: ModelManager;
  private models: Map<string, ModelInfo>;
  private readonly modelDir: string;
  private downloadQueue: DownloadQueueItem[] = [];
  private activeDownloads: Set<string> = new Set();
  private progressiveOptions: ProgressiveDownloadOptions = {
    maxConcurrentDownloads: 2,
    prioritizeByUsage: true,
    downloadOnWifiOnly: false,
    maxStorageUsage: 500 * 1024 * 1024 // 500MB default
  };

  private constructor() {
    this.models = new Map<string, ModelInfo>();
    // Set the directory where all models will be saved
    this.modelDir = `${FileSystem.DocumentDirectoryPath}/ml-models`;
    this.initializeModelConfigs();
  }

  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  private async initializeModelConfigs(): Promise<void> {
    // Create the models directory if it doesn't exist
    try {
      const exists = await FileSystem.exists(this.modelDir);
      if (!exists) {
        await FileSystem.mkdir(this.modelDir);
        console.log(`Created model directory at: ${this.modelDir}`);
      }

      // Load the model configurations from constants and check which ones are downloaded
      for (const config of MODEL_CONFIGS) {
        const modelDir = `${this.modelDir}/${config.id}`;
        const modelJsonPath = `${modelDir}/model.json`;
        const isDownloaded = await FileSystem.exists(modelJsonPath);

        // Calculate priority based on language popularity and model size
        const priority = this.calculateModelPriority(config);

        this.models.set(config.id, {
          id: config.id,
          name: config.name,
          url: config.url,
          version: config.version,
          localPath: isDownloaded ? modelJsonPath : undefined,
          isDownloaded,
          priority,
          downloadSize: (config.size || 15) * 1024 * 1024, // Convert MB to bytes
          usageCount: 0,
          lastUsed: undefined
        });

        if (isDownloaded) {
          console.log(`Found existing model: ${config.id} at ${modelJsonPath}`);
        }
      }

      // Start progressive downloading for high-priority models
      this.startProgressiveDownloading();
    } catch (error) {
      console.error('Error initializing model configs:', error);
    }
  }

  /**
   * Calculate model priority based on language popularity and other factors
   */
  private calculateModelPriority(config: ModelConfigItem): number {
    // Language popularity scores (higher = more popular)
    const languagePopularity: { [key: string]: number } = {
      'en': 100, 'es': 90, 'fr': 80, 'de': 70, 'it': 60,
      'pt': 55, 'ru': 50, 'ja': 45, 'ko': 40, 'zh': 85,
      'ar': 35, 'hi': 30, 'tr': 25, 'nl': 20, 'sv': 15
    };

    const srcPop = languagePopularity[config.srcLang] || 10;
    const targetPop = languagePopularity[config.targetLang] || 10;
    
    // Base priority is average of source and target popularity
    let priority = (srcPop + targetPop) / 2;
    
    // Boost English pairs (most commonly requested)
    if (config.srcLang === 'en' || config.targetLang === 'en') {
      priority += 20;
    }
    
    // Penalize very large models slightly
    const sizeInBytes = (config.size || 15) * 1024 * 1024;
    if (sizeInBytes > 50 * 1024 * 1024) { // > 50MB
      priority -= 10;
    }
    
    return Math.max(1, Math.round(priority));
  }

  /**
   * Start progressive downloading of models based on priority
   */
  public async startProgressiveDownloading(): Promise<void> {
    console.log('Starting progressive model downloading...');
    
    // Get undownloaded models sorted by priority
    const undownloadedModels = Array.from(this.models.values())
      .filter(model => !model.isDownloaded)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Add high-priority models to download queue
    for (const model of undownloadedModels.slice(0, 5)) { // Top 5 priority models
      this.addToDownloadQueue(model.id, model.priority || 1, model.downloadSize || 15 * 1024 * 1024);
    }

    // Process the download queue
    this.processDownloadQueue();
  }

  /**
   * Add a model to the progressive download queue
   */
  public addToDownloadQueue(modelId: string, priority: number, estimatedSize: number): void {
    // Check if already in queue or downloading
    if (this.downloadQueue.some(item => item.modelId === modelId) || this.activeDownloads.has(modelId)) {
      return;
    }

    const queueItem: DownloadQueueItem = {
      modelId,
      priority,
      estimatedSize,
      addedAt: new Date()
    };

    this.downloadQueue.push(queueItem);
    
    // Sort queue by priority (highest first)
    this.downloadQueue.sort((a, b) => b.priority - a.priority);
    
    console.log(`Added model ${modelId} to download queue (priority: ${priority})`);
    
    // Try to process the queue
    this.processDownloadQueue();
  }

  /**
   * Process the download queue with concurrency limits
   */
  private async processDownloadQueue(): Promise<void> {
    const maxConcurrent = this.progressiveOptions.maxConcurrentDownloads || 2;
    
    // Check if we can start more downloads
    while (this.activeDownloads.size < maxConcurrent && this.downloadQueue.length > 0) {
      const nextItem = this.downloadQueue.shift();
      if (!nextItem) break;

      // Check storage constraints
      if (await this.wouldExceedStorageLimit(nextItem.estimatedSize)) {
        console.log(`Skipping download of ${nextItem.modelId} due to storage constraints`);
        continue;
      }

      // Start download in background
      this.downloadModelProgressively(nextItem.modelId);
    }
  }

  /**
   * Check if downloading a model would exceed storage limits
   */
  private async wouldExceedStorageLimit(additionalSize: number): Promise<boolean> {
    try {
      const currentUsage = await this.getCurrentStorageUsage();
      const maxUsage = this.progressiveOptions.maxStorageUsage || 500 * 1024 * 1024;
      
      return (currentUsage + additionalSize) > maxUsage;
    } catch (error) {
      console.error('Error checking storage limits:', error);
      return false; // Allow download if we can't check
    }
  }

  /**
   * Get current storage usage by all models
   */
  private async getCurrentStorageUsage(): Promise<number> {
    try {
      const stats = await FileSystem.stat(this.modelDir);
      return typeof stats.size === 'number' ? stats.size : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Download a model as part of progressive downloading
   */
  private async downloadModelProgressively(modelId: string): Promise<void> {
    this.activeDownloads.add(modelId);
    
    try {
      console.log(`Starting progressive download of model: ${modelId}`);
      await this.downloadModel(modelId);
      console.log(`Completed progressive download of model: ${modelId}`);
    } catch (error) {
      console.error(`Failed to progressively download model ${modelId}:`, error);
    } finally {
      this.activeDownloads.delete(modelId);
      
      // Continue processing queue
      this.processDownloadQueue();
    }
  }

  /**
   * Request a model with intelligent prioritization
   */
  public async requestModel(modelId: string, urgent: boolean = false): Promise<ModelInfo> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model with ID ${modelId} not found in configurations.`);
    }

    // Update usage statistics
    const updatedModel = {
      ...model,
      usageCount: (model.usageCount || 0) + 1,
      lastUsed: new Date()
    };
    this.models.set(modelId, updatedModel);

    // If model is already downloaded, return it
    if (model.isDownloaded) {
      return updatedModel;
    }

    // If urgent, download immediately
    if (urgent) {
      console.log(`Urgent request for model ${modelId}, downloading immediately`);
      return this.downloadModel(modelId);
    }

    // Otherwise, add to priority queue with boosted priority
    const boostedPriority = (model.priority || 1) + 50; // Boost priority for requested models
    this.addToDownloadQueue(modelId, boostedPriority, model.downloadSize || 15 * 1024 * 1024);

    return updatedModel;
  }

  /**
   * Configure progressive download options
   */
  public configureProgressiveDownloading(options: Partial<ProgressiveDownloadOptions>): void {
    this.progressiveOptions = { ...this.progressiveOptions, ...options };
    console.log('Progressive download options updated:', this.progressiveOptions);
  }

  /**
   * Get download queue status
   */
  public getDownloadQueueStatus(): {
    queueLength: number;
    activeDownloads: number;
    queuedModels: string[];
    activeModels: string[];
  } {
    return {
      queueLength: this.downloadQueue.length,
      activeDownloads: this.activeDownloads.size,
      queuedModels: this.downloadQueue.map(item => item.modelId),
      activeModels: Array.from(this.activeDownloads)
    };
  }

  /**
   * Pause progressive downloading
   */
  public pauseProgressiveDownloading(): void {
    console.log('Pausing progressive downloading');
    this.downloadQueue.length = 0; // Clear queue
    // Note: Active downloads will continue but no new ones will start
  }

  /**
   * Resume progressive downloading
   */
  public resumeProgressiveDownloading(): void {
    console.log('Resuming progressive downloading');
    this.startProgressiveDownloading();
  }

  public async downloadModel(modelId: string): Promise<ModelInfo> {
    const modelConfig = this.models.get(modelId);
    if (!modelConfig) {
      throw new Error(`Model with ID ${modelId} not found in configurations.`);
    }

    if (modelConfig.isDownloaded) {
      console.log(`Model ${modelId} is already downloaded.`);
      return modelConfig;
    }

    const modelDir = `${this.modelDir}/${modelId}`;
    const modelJsonPath = `${modelDir}/model.json`;

    try {
      // Create the model's directory if it doesn't exist
      const dirExists = await FileSystem.exists(modelDir);
      if (!dirExists) {
        await FileSystem.mkdir(modelDir);
      }

      console.log(`Downloading model ${modelId} from ${modelConfig.url}...`);

      // For TensorFlow.js models, we typically need to download model.json and its associated binary weight files
      // This is a simplified example that assumes the URL points directly to a model.json file
      // For actual implementation, you might need to handle downloading multiple files based on the model format
      const downloadResult = await FileSystem.downloadFile({
        fromUrl: modelConfig.url,
        toFile: modelJsonPath,
        background: true,
        progress: (res: { bytesWritten: number; contentLength: number }) => {
          const progress = res.bytesWritten / res.contentLength;
          console.log(`Download progress for ${modelId}: ${Math.round(progress * 100)}%`);
          
          // Update the model info with progress
          const updatedModel = { ...modelConfig, downloadProgress: progress };
          this.models.set(modelId, updatedModel);
        }
      }).promise;

      console.log(`Model ${modelId} downloaded successfully.`);

      // Update the model info
      const updatedModel: ModelInfo = {
        ...modelConfig,
        id: modelId,
        localPath: modelJsonPath,
        isDownloaded: true,
        downloadProgress: 1,
        lastChecked: new Date()
      };
      this.models.set(modelId, updatedModel);

      return updatedModel;
    } catch (error) {
      console.error(`Error downloading model ${modelId}:`, error);
      throw error;
    }
  }

  public async getModel(modelId: string, forceDownload = false): Promise<ModelInfo> {
    const modelInfo = this.models.get(modelId);
    if (!modelInfo) {
      throw new Error(`Model with ID ${modelId} not found in configurations.`);
    }

    // If the model is not downloaded or a download is forced, download it first
    if (!modelInfo.isDownloaded || forceDownload) {
      return this.downloadModel(modelId);
    }

    return modelInfo;
  }

  public async getModelPath(modelId: string): Promise<string> {
    const modelInfo = await this.getModel(modelId);
    if (!modelInfo.localPath) {
      throw new Error(`Model ${modelId} has no local path. It may not be downloaded yet.`);
    }
    return modelInfo.localPath;
  }

  public async checkForUpdates(): Promise<void> {
    // In a real app, you would fetch the latest model versions from a server
    // and compare them with the local versions to determine if updates are needed.
    // For this prototype, we'll simulate this check with a simplified approach.
    
    console.log('Checking for model updates...');
    
    // Simulate checking for updates by logging the current models
    // Use Array.from to avoid downlevelIteration issues
    Array.from(this.models.entries()).forEach(([modelId, modelInfo]) => {
      console.log(`Model ${modelId}: version ${modelInfo.version}, downloaded: ${modelInfo.isDownloaded}`);
      
      // Update the last checked timestamp
      const updatedModel = { 
        ...modelInfo,
        id: modelId,
        lastChecked: new Date() 
      };
      this.models.set(modelId, updatedModel);
    });
    
    // In a real application, you would implement actual version checking here
    // and re-download models that have newer versions available
  }

  public getAvailableModels(): ModelInfo[] {
    return Array.from(this.models.values());
  }
  
  public async deleteModel(modelId: string): Promise<void> {
    const modelInfo = this.models.get(modelId);
    if (!modelInfo || !modelInfo.isDownloaded || !modelInfo.localPath) {
      console.log(`Model ${modelId} is not downloaded or doesn't exist.`);
      return;
    }
    
    const modelDir = `${this.modelDir}/${modelId}`;
    try {
      await FileSystem.unlink(modelDir);
      console.log(`Model ${modelId} deleted successfully.`);
      
      // Update the model info
      const updatedModel = {
        ...modelInfo,
        id: modelId,
        localPath: undefined,
        isDownloaded: false,
        downloadProgress: undefined
      };
      this.models.set(modelId, updatedModel);
    } catch (error) {
      console.error(`Error deleting model ${modelId}:`, error);
      throw error;
    }
  }
}

export const modelManager = ModelManager.getInstance();
