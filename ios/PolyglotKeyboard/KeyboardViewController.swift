import UIKit

/**
 * KeyboardViewController - Main iOS keyboard extension controller
 * Handles keyboard UI, translation requests, and user interactions
 */
class KeyboardViewController: UIInputViewController {
    
    // MARK: - Properties
    private var keyboardView: TranslationKeyboardView?
    private var translationEngine: TranslationEngine?
    private var currentLanguagePair = ("en", "tr")
    private var isTranslationMode = false
    
    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupKeyboard()
        setupTranslationEngine()
        setupConstraints()
        
        print("PolyglotKeyboard: KeyboardViewController loaded")
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        // Update keyboard for current input context
        updateKeyboardForInputType()
    }
    
    // MARK: - Setup Methods
    private func setupKeyboard() {
        keyboardView = TranslationKeyboardView()
        keyboardView?.delegate = self
        
        guard let keyboardView = keyboardView else { return }
        
        // Add keyboard view to input view
        view.addSubview(keyboardView)
        keyboardView.translatesAutoresizingMaskIntoConstraints = false
        
        // Set background color
        view.backgroundColor = UIColor.systemBackground
    }
    
    private func setupTranslationEngine() {
        translationEngine = TranslationEngine()
        translationEngine?.delegate = self
        
        // Load default language pair
        translationEngine?.setLanguagePair(source: currentLanguagePair.0, target: currentLanguagePair.1)
    }
    
    private func setupConstraints() {
        guard let keyboardView = keyboardView else { return }
        
        NSLayoutConstraint.activate([
            keyboardView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            keyboardView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            keyboardView.topAnchor.constraint(equalTo: view.topAnchor),
            keyboardView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }
    
    // MARK: - Input Context Handling
    private func updateKeyboardForInputType() {
        guard let textDocumentProxy = textDocumentProxy else { return }
        
        let keyboardType = textDocumentProxy.keyboardType ?? .default
        let isSecureTextEntry = textDocumentProxy.isSecureTextEntry
        
        // Adapt keyboard based on input type
        switch keyboardType {
        case .emailAddress:
            keyboardView?.setKeyboardMode(.email)
        case .URL:
            keyboardView?.setKeyboardMode(.url)
        case .numberPad, .decimalPad:
            keyboardView?.setKeyboardMode(.number)
        default:
            if isSecureTextEntry {
                keyboardView?.setKeyboardMode(.password)
                isTranslationMode = false // Disable translation for passwords
            } else {
                keyboardView?.setKeyboardMode(.text)
                isTranslationMode = true
            }
        }
        
        keyboardView?.updateLanguageDisplay(source: currentLanguagePair.0, target: currentLanguagePair.1)
    }
    
    // MARK: - Text Input Handling
    private func insertText(_ text: String) {
        textDocumentProxy.insertText(text)
    }
    
    private func deleteBackward() {
        textDocumentProxy.deleteBackward()
    }
    
    private func insertNewline() {
        textDocumentProxy.insertText("\n")
    }
    
    // MARK: - Translation Handling
    private func requestTranslation(for text: String) {
        guard isTranslationMode else { return }
        
        translationEngine?.translateText(text) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(let translatedText):
                    self?.handleTranslationResult(original: text, translated: translatedText)
                case .failure(let error):
                    self?.handleTranslationError(error)
                }
            }
        }
    }
    
    private func handleTranslationResult(original: String, translated: String) {
        // Replace the original text with translation
        // First, select and delete the original text
        for _ in original {
            textDocumentProxy.deleteBackward()
        }
        
        // Insert the translated text
        textDocumentProxy.insertText(translated)
        
        // Show translation feedback
        showTranslationFeedback(original: original, translated: translated)
        
        // Provide haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
    }
    
    private func handleTranslationError(_ error: Error) {
        print("Translation error: \(error)")
        
        // Show error feedback
        let notificationFeedback = UINotificationFeedbackGenerator()
        notificationFeedback.notificationOccurred(.error)
    }
    
    private func showTranslationFeedback(original: String, translated: String) {
        // Update suggestion strip with translation result
        keyboardView?.showTranslationFeedback(original: original, translated: translated)
    }
    
    // MARK: - Language Switching
    private func switchLanguage() {
        // Cycle through language pairs
        switch currentLanguagePair {
        case ("en", "tr"):
            currentLanguagePair = ("tr", "en")
        case ("tr", "en"):
            currentLanguagePair = ("en", "es")
        case ("en", "es"):
            currentLanguagePair = ("es", "en")
        case ("es", "en"):
            currentLanguagePair = ("en", "fr")
        case ("en", "fr"):
            currentLanguagePair = ("fr", "en")
        case ("fr", "en"):
            currentLanguagePair = ("en", "de")
        case ("en", "de"):
            currentLanguagePair = ("de", "en")
        default:
            currentLanguagePair = ("en", "tr")
        }
        
        // Update translation engine
        translationEngine?.setLanguagePair(source: currentLanguagePair.0, target: currentLanguagePair.1)
        
        // Update UI
        keyboardView?.updateLanguageDisplay(source: currentLanguagePair.0, target: currentLanguagePair.1)
        
        // Provide haptic feedback
        let selectionFeedback = UISelectionFeedbackGenerator()
        selectionFeedback.selectionChanged()
        
        print("Language switched to: \(currentLanguagePair.0) → \(currentLanguagePair.1)")
    }
    
    // MARK: - Clipboard Translation
    private func translateClipboard() {
        guard let clipboardText = UIPasteboard.general.string,
              !clipboardText.isEmpty else { return }
        
        requestTranslation(for: clipboardText)
    }
    
    // MARK: - Keyboard Appearance
    override func textWillChange(_ textInput: UITextInput?) {
        // Called when text input is about to change
    }
    
    override func textDidChange(_ textInput: UITextInput?) {
        // Called when text input has changed
        // Could be used for real-time translation suggestions
    }
}

// MARK: - TranslationKeyboardViewDelegate
extension KeyboardViewController: TranslationKeyboardViewDelegate {
    func keyboardView(_ keyboardView: TranslationKeyboardView, didTapKey key: String) {
        insertText(key)
    }
    
    func keyboardView(_ keyboardView: TranslationKeyboardView, didTapSpecialKey keyType: SpecialKeyType) {
        switch keyType {
        case .backspace:
            deleteBackward()
        case .return:
            insertNewline()
        case .space:
            insertText(" ")
        case .translate:
            // Get current word or selected text for translation
            if let selectedText = textDocumentProxy.selectedText, !selectedText.isEmpty {
                requestTranslation(for: selectedText)
            } else {
                // Get the current word
                if let currentWord = getCurrentWord() {
                    requestTranslation(for: currentWord)
                }
            }
        case .languageSwitch:
            switchLanguage()
        case .clipboardTranslate:
            translateClipboard()
        }
    }
    
    func keyboardView(_ keyboardView: TranslationKeyboardView, didSelectSuggestion suggestion: String) {
        insertText(suggestion)
    }
    
    private func getCurrentWord() -> String? {
        // Get text before cursor to find current word
        guard let documentContextBeforeInput = textDocumentProxy.documentContextBeforeInput else {
            return nil
        }
        
        // Find the last word
        let words = documentContextBeforeInput.components(separatedBy: .whitespacesAndNewlines)
        return words.last?.isEmpty == false ? words.last : nil
    }
}

// MARK: - TranslationEngineDelegate
extension KeyboardViewController: TranslationEngineDelegate {
    func translationEngine(_ engine: TranslationEngine, didLoadModel success: Bool) {
        print("Translation model loaded: \(success)")
        
        if success {
            keyboardView?.setTranslationAvailable(true)
        } else {
            keyboardView?.setTranslationAvailable(false)
        }
    }
    
    func translationEngine(_ engine: TranslationEngine, didUpdateProgress progress: Float) {
        // Update loading progress if needed
        keyboardView?.updateLoadingProgress(progress)
    }
} 