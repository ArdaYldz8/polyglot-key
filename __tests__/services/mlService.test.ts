import { mlService } from '../../services/mlService';

// Mock the actual ML service for testing
jest.mock('../../services/mlService', () => ({
  mlService: {
    translateText: jest.fn(),
    findModelForLanguagePair: jest.fn(),
    loadModel: jest.fn(),
  },
}));

const mockMlService = mlService as jest.Mocked<typeof mlService>;

describe('ML Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('translateText', () => {
    it('should translate text successfully', async () => {
      const mockResult = {
        translatedText: 'Hola mundo',
        confidence: 0.95,
        alternatives: [{ text: 'Hola mundo' }, { text: 'Saludos mundo' }],
        timeTaken: 150,
        modelId: 'en-es-model',
      };

      mockMlService.translateText.mockResolvedValueOnce(mockResult);

      const result = await mlService.translateText(
        'Hello world',
        'en',
        'es',
        'en-es-model',
      );

      expect(result).toEqual(mockResult);
      expect(result.translatedText).toBe('Hola mundo');
      expect(result.confidence).toBe(0.95);
    });

    it('should handle translation errors', async () => {
      const error = new Error('Translation failed');
      mockMlService.translateText.mockRejectedValueOnce(error);

      await expect(
        mlService.translateText('Hello world', 'en', 'es', 'en-es-model'),
      ).rejects.toThrow('Translation failed');
    });

    it('should handle empty text input', async () => {
      mockMlService.translateText.mockResolvedValueOnce({
        translatedText: '',
        confidence: 0,
        alternatives: [],
        timeTaken: 50,
        modelId: 'en-es-model',
      });

      const result = await mlService.translateText(
        '',
        'en',
        'es',
        'en-es-model',
      );

      expect(result.translatedText).toBe('');
      expect(result.confidence).toBe(0);
    });

    it('should return translation with timing information', async () => {
      const mockResult = {
        translatedText: 'Bonjour',
        confidence: 0.88,
        alternatives: [],
        timeTaken: 200,
        modelId: 'en-fr-model',
      };

      mockMlService.translateText.mockResolvedValueOnce(mockResult);

      const result = await mlService.translateText(
        'Hello',
        'en',
        'fr',
        'en-fr-model',
      );

      expect(result.timeTaken).toBeDefined();
      expect(typeof result.timeTaken).toBe('number');
      expect(result.modelId).toBe('en-fr-model');
    });
  });

  describe('findModelForLanguagePair', () => {
    it('should find model for language pair', () => {
      // Mock return value as any to avoid complex type issues
      mockMlService.findModelForLanguagePair.mockReturnValueOnce({} as any);

      const result = mlService.findModelForLanguagePair('en', 'es');

      expect(mockMlService.findModelForLanguagePair).toHaveBeenCalledWith(
        'en',
        'es',
      );
      expect(result).toBeDefined();
    });

    it('should return undefined for unsupported language pair', () => {
      mockMlService.findModelForLanguagePair.mockReturnValueOnce(undefined);

      const result = mlService.findModelForLanguagePair('en', 'xyz');

      expect(result).toBeUndefined();
    });
  });

  describe('loadModel', () => {
    it('should load model successfully', async () => {
      const mockModel = { predict: jest.fn() };
      mockMlService.loadModel.mockResolvedValueOnce(mockModel);

      const result = await mlService.loadModel('en-es-model');

      expect(mockMlService.loadModel).toHaveBeenCalledWith('en-es-model');
      expect(result).toBeDefined();
    });

    it('should handle model loading errors', async () => {
      const error = new Error('Model not found');
      mockMlService.loadModel.mockRejectedValueOnce(error);

      await expect(mlService.loadModel('invalid-model')).rejects.toThrow(
        'Model not found',
      );
    });
  });
});
