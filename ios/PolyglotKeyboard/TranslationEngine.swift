import Foundation
import CoreML

/**
 * TranslationEngine - Handles ML model loading and translation processing
 * Manages TensorFlow Lite models and provides translation services
 */

protocol TranslationEngineDelegate: AnyObject {
    func translationEngine(_ engine: TranslationEngine, didLoadModel success: Bool)
    func translationEngine(_ engine: TranslationEngine, didUpdateProgress progress: Float)
}

enum TranslationError: Error {
    case modelNotLoaded
    case invalidInput
    case translationFailed
    case networkError
}

class TranslationEngine {
    
    // MARK: - Properties
    weak var delegate: TranslationEngineDelegate?
    
    private var currentSourceLanguage = "en"
    private var currentTargetLanguage = "tr"
    private var isModelLoaded = false
    
    // Translation cache for quick lookups
    private var translationCache: [String: String] = [:]
    
    // Quick translations for common phrases
    private let quickTranslations: [String: [String: String]] = [
        "hello": [
            "tr": "merhaba",
            "es": "hola", 
            "fr": "bonjour",
            "de": "hallo"
        ],
        "thank you": [
            "tr": "teşekkür ederim",
            "es": "gracias",
            "fr": "merci", 
            "de": "danke"
        ],
        "good morning": [
            "tr": "günaydın",
            "es": "buenos días",
            "fr": "bonjour",
            "de": "guten morgen"
        ],
        "goodbye": [
            "tr": "hoşça kal",
            "es": "adiós",
            "fr": "au revoir",
            "de": "auf wiedersehen"
        ],
        "yes": [
            "tr": "evet",
            "es": "sí",
            "fr": "oui",
            "de": "ja"
        ],
        "no": [
            "tr": "hayır", 
            "es": "no",
            "fr": "non",
            "de": "nein"
        ],
        "please": [
            "tr": "lütfen",
            "es": "por favor",
            "fr": "s'il vous plaît",
            "de": "bitte"
        ],
        "excuse me": [
            "tr": "affedersiniz",
            "es": "perdón",
            "fr": "excusez-moi",
            "de": "entschuldigung"
        ]
    ]
    
    // MARK: - Initialization
    init() {
        loadModel()
    }
    
    // MARK: - Public Methods
    func setLanguagePair(source: String, target: String) {
        currentSourceLanguage = source
        currentTargetLanguage = target
        
        // Clear cache when switching languages
        translationCache.removeAll()
        
        // Reload model for new language pair
        loadModel()
        
        print("Language pair set to: \(source) → \(target)")
    }
    
    func translateText(_ text: String, completion: @escaping (Result<String, TranslationError>) -> Void) {
        let normalizedText = text.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        
        // Check cache first
        let cacheKey = "\(normalizedText):\(currentSourceLanguage):\(currentTargetLanguage)"
        if let cachedTranslation = translationCache[cacheKey] {
            completion(.success(cachedTranslation))
            return
        }
        
        // Check quick translations
        if let quickTranslation = quickTranslations[normalizedText]?[currentTargetLanguage] {
            translationCache[cacheKey] = quickTranslation
            completion(.success(quickTranslation))
            return
        }
        
        // Perform model inference
        performTranslation(text: text) { [weak self] result in
            switch result {
            case .success(let translatedText):
                self?.translationCache[cacheKey] = translatedText
                completion(.success(translatedText))
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
    
    func getSuggestions(for text: String) -> [String] {
        let normalizedText = text.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        var suggestions: [String] = []
        
        // Add quick translation if available
        if let quickTranslation = quickTranslations[normalizedText]?[currentTargetLanguage] {
            suggestions.append(quickTranslation)
        }
        
        // Add similar translations
        for (key, translations) in quickTranslations {
            if key.contains(normalizedText) && key != normalizedText {
                if let translation = translations[currentTargetLanguage] {
                    suggestions.append(translation)
                }
            }
        }
        
        // Limit to 3 suggestions
        return Array(suggestions.prefix(3))
    }
    
    // MARK: - Private Methods
    private func loadModel() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            
            // Simulate model loading
            // In a real implementation, this would load the actual CoreML or TensorFlow Lite model
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                self.isModelLoaded = true
                self.delegate?.translationEngine(self, didLoadModel: true)
                print("Translation model loaded for \(self.currentSourceLanguage) → \(self.currentTargetLanguage)")
            }
        }
    }
    
    private func performTranslation(text: String, completion: @escaping (Result<String, TranslationError>) -> Void) {
        guard isModelLoaded else {
            completion(.failure(.modelNotLoaded))
            return
        }
        
        // Simulate translation processing
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            
            // Simulate processing time
            Thread.sleep(forTimeInterval: 0.2)
            
            let translatedText = self.simulateTranslation(text: text)
            
            DispatchQueue.main.async {
                completion(.success(translatedText))
            }
        }
    }
    
    private func simulateTranslation(text: String) -> String {
        let normalizedText = text.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        
        switch currentTargetLanguage {
        case "tr":
            return translateToTurkish(normalizedText)
        case "es":
            return translateToSpanish(normalizedText)
        case "fr":
            return translateToFrench(normalizedText)
        case "de":
            return translateToGerman(normalizedText)
        default:
            return "[\(currentTargetLanguage.uppercased())] \(text)"
        }
    }
    
    private func translateToTurkish(_ text: String) -> String {
        switch text {
        case "how are you?":
            return "nasılsın?"
        case "what's your name?":
            return "adın ne?"
        case "where are you from?":
            return "nerelisin?"
        case "i love you":
            return "seni seviyorum"
        case "good night":
            return "iyi geceler"
        case "see you later":
            return "görüşürüz"
        default:
            return "[TR] \(text)"
        }
    }
    
    private func translateToSpanish(_ text: String) -> String {
        switch text {
        case "how are you?":
            return "¿cómo estás?"
        case "what's your name?":
            return "¿cómo te llamas?"
        case "where are you from?":
            return "¿de dónde eres?"
        case "i love you":
            return "te amo"
        case "good night":
            return "buenas noches"
        case "see you later":
            return "hasta luego"
        default:
            return "[ES] \(text)"
        }
    }
    
    private func translateToFrench(_ text: String) -> String {
        switch text {
        case "how are you?":
            return "comment allez-vous?"
        case "what's your name?":
            return "comment vous appelez-vous?"
        case "where are you from?":
            return "d'où venez-vous?"
        case "i love you":
            return "je t'aime"
        case "good night":
            return "bonne nuit"
        case "see you later":
            return "à bientôt"
        default:
            return "[FR] \(text)"
        }
    }
    
    private func translateToGerman(_ text: String) -> String {
        switch text {
        case "how are you?":
            return "wie geht es dir?"
        case "what's your name?":
            return "wie heißt du?"
        case "where are you from?":
            return "woher kommst du?"
        case "i love you":
            return "ich liebe dich"
        case "good night":
            return "gute nacht"
        case "see you later":
            return "bis später"
        default:
            return "[DE] \(text)"
        }
    }
} 