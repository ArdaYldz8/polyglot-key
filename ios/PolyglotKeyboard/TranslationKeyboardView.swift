import UIKit

/**
 * TranslationKeyboardView - Custom iOS keyboard UI with translation capabilities
 * Provides QWERTY layout with suggestion strip and translation features
 */

protocol TranslationKeyboardViewDelegate: AnyObject {
    func keyboardView(_ keyboardView: TranslationKeyboardView, didTapKey key: String)
    func keyboardView(_ keyboardView: TranslationKeyboardView, didTapSpecialKey keyType: SpecialKeyType)
    func keyboardView(_ keyboardView: TranslationKeyboardView, didSelectSuggestion suggestion: String)
}

enum SpecialKeyType {
    case backspace
    case `return`
    case space
    case translate
    case languageSwitch
    case clipboardTranslate
}

enum KeyboardMode {
    case text
    case email
    case url
    case number
    case password
}

class TranslationKeyboardView: UIView {
    
    // MARK: - Properties
    weak var delegate: TranslationKeyboardViewDelegate?
    
    private var suggestionStrip: UIStackView!
    private var keyboardContainer: UIStackView!
    private var languageIndicator: UIButton!
    private var translateButton: UIButton!
    private var suggestionScrollView: UIScrollView!
    private var suggestionStackView: UIStackView!
    
    private var currentMode: KeyboardMode = .text
    private var isTranslationAvailable = false
    
    // MARK: - Initialization
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupKeyboard()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupKeyboard()
    }
    
    // MARK: - Setup
    private func setupKeyboard() {
        backgroundColor = UIColor.systemBackground
        
        setupSuggestionStrip()
        setupKeyboardLayout()
        setupConstraints()
        applyModernStyling()
    }
    
    private func setupSuggestionStrip() {
        // Main suggestion strip container
        suggestionStrip = UIStackView()
        suggestionStrip.axis = .horizontal
        suggestionStrip.distribution = .fill
        suggestionStrip.alignment = .center
        suggestionStrip.spacing = 8
        suggestionStrip.backgroundColor = UIColor.secondarySystemBackground
        suggestionStrip.layoutMargins = UIEdgeInsets(top: 8, left: 16, bottom: 8, right: 16)
        suggestionStrip.isLayoutMarginsRelativeArrangement = true
        
        // Language indicator button
        languageIndicator = UIButton(type: .system)
        languageIndicator.setTitle("en → tr", for: .normal)
        languageIndicator.titleLabel?.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        languageIndicator.backgroundColor = UIColor.systemBlue.withAlphaComponent(0.1)
        languageIndicator.layer.cornerRadius = 8
        languageIndicator.contentEdgeInsets = UIEdgeInsets(top: 6, left: 12, bottom: 6, right: 12)
        languageIndicator.addTarget(self, action: #selector(languageIndicatorTapped), for: .touchUpInside)
        
        // Suggestion scroll view
        suggestionScrollView = UIScrollView()
        suggestionScrollView.showsHorizontalScrollIndicator = false
        suggestionScrollView.showsVerticalScrollIndicator = false
        
        suggestionStackView = UIStackView()
        suggestionStackView.axis = .horizontal
        suggestionStackView.distribution = .fill
        suggestionStackView.alignment = .center
        suggestionStackView.spacing = 8
        
        suggestionScrollView.addSubview(suggestionStackView)
        
        // Translation button
        translateButton = UIButton(type: .system)
        translateButton.setTitle("🌐", for: .normal)
        translateButton.titleLabel?.font = UIFont.systemFont(ofSize: 18)
        translateButton.backgroundColor = UIColor.systemGreen.withAlphaComponent(0.1)
        translateButton.layer.cornerRadius = 8
        translateButton.contentEdgeInsets = UIEdgeInsets(top: 6, left: 12, bottom: 6, right: 12)
        translateButton.addTarget(self, action: #selector(translateButtonTapped), for: .touchUpInside)
        
        // Add to suggestion strip
        suggestionStrip.addArrangedSubview(languageIndicator)
        suggestionStrip.addArrangedSubview(suggestionScrollView)
        suggestionStrip.addArrangedSubview(translateButton)
        
        addSubview(suggestionStrip)
        
        // Add sample suggestions
        addSuggestion("Hello", translation: "Merhaba")
        addSuggestion("Thank you", translation: "Teşekkür ederim")
        addSuggestion("Good morning", translation: "Günaydın")
    }
    
    private func setupKeyboardLayout() {
        keyboardContainer = UIStackView()
        keyboardContainer.axis = .vertical
        keyboardContainer.distribution = .fillEqually
        keyboardContainer.alignment = .fill
        keyboardContainer.spacing = 8
        keyboardContainer.layoutMargins = UIEdgeInsets(top: 8, left: 8, bottom: 8, right: 8)
        keyboardContainer.isLayoutMarginsRelativeArrangement = true
        
        // Create keyboard rows
        createKeyboardRows()
        
        addSubview(keyboardContainer)
    }
    
    private func createKeyboardRows() {
        // Row 1: QWERTYUIOP
        let row1 = createKeyRow(keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"])
        keyboardContainer.addArrangedSubview(row1)
        
        // Row 2: ASDFGHJKL
        let row2 = createKeyRow(keys: ["A", "S", "D", "F", "G", "H", "J", "K", "L"])
        keyboardContainer.addArrangedSubview(row2)
        
        // Row 3: ZXCVBNM with special keys
        let row3 = UIStackView()
        row3.axis = .horizontal
        row3.distribution = .fill
        row3.alignment = .fill
        row3.spacing = 4
        
        // Shift key (placeholder)
        let shiftKey = createSpecialKey(title: "⇧", type: .backspace, width: 60)
        row3.addArrangedSubview(shiftKey)
        
        // Letter keys
        let letterKeys = ["Z", "X", "C", "V", "B", "N", "M"]
        for key in letterKeys {
            let button = createKey(title: key)
            row3.addArrangedSubview(button)
        }
        
        // Backspace key
        let backspaceKey = createSpecialKey(title: "⌫", type: .backspace, width: 60)
        row3.addArrangedSubview(backspaceKey)
        
        keyboardContainer.addArrangedSubview(row3)
        
        // Row 4: Space bar and special keys
        let row4 = UIStackView()
        row4.axis = .horizontal
        row4.distribution = .fill
        row4.alignment = .fill
        row4.spacing = 4
        
        // Numbers key
        let numbersKey = createSpecialKey(title: "123", type: .backspace, width: 60)
        row4.addArrangedSubview(numbersKey)
        
        // Space bar
        let spaceKey = createSpecialKey(title: "Space", type: .space, width: 0)
        spaceKey.setContentHuggingPriority(.defaultLow, for: .horizontal)
        row4.addArrangedSubview(spaceKey)
        
        // Return key
        let returnKey = createSpecialKey(title: "⏎", type: .return, width: 60)
        row4.addArrangedSubview(returnKey)
        
        keyboardContainer.addArrangedSubview(row4)
    }
    
    private func createKeyRow(keys: [String]) -> UIStackView {
        let stackView = UIStackView()
        stackView.axis = .horizontal
        stackView.distribution = .fillEqually
        stackView.alignment = .fill
        stackView.spacing = 4
        
        for key in keys {
            let button = createKey(title: key)
            stackView.addArrangedSubview(button)
        }
        
        return stackView
    }
    
    private func createKey(title: String) -> UIButton {
        let button = UIButton(type: .system)
        button.setTitle(title, for: .normal)
        button.titleLabel?.font = UIFont.systemFont(ofSize: 18, weight: .medium)
        button.backgroundColor = UIColor.systemGray6
        button.layer.cornerRadius = 8
        button.layer.shadowColor = UIColor.black.cgColor
        button.layer.shadowOffset = CGSize(width: 0, height: 1)
        button.layer.shadowOpacity = 0.1
        button.layer.shadowRadius = 2
        
        button.addTarget(self, action: #selector(keyTapped(_:)), for: .touchUpInside)
        
        // Add touch feedback
        button.addTarget(self, action: #selector(keyTouchDown(_:)), for: .touchDown)
        button.addTarget(self, action: #selector(keyTouchUp(_:)), for: [.touchUpInside, .touchUpOutside, .touchCancel])
        
        return button
    }
    
    private func createSpecialKey(title: String, type: SpecialKeyType, width: CGFloat) -> UIButton {
        let button = UIButton(type: .system)
        button.setTitle(title, for: .normal)
        button.titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        button.backgroundColor = UIColor.systemGray5
        button.layer.cornerRadius = 8
        button.layer.shadowColor = UIColor.black.cgColor
        button.layer.shadowOffset = CGSize(width: 0, height: 1)
        button.layer.shadowOpacity = 0.1
        button.layer.shadowRadius = 2
        
        if width > 0 {
            button.widthAnchor.constraint(equalToConstant: width).isActive = true
        }
        
        button.tag = type.hashValue
        button.addTarget(self, action: #selector(specialKeyTapped(_:)), for: .touchUpInside)
        
        // Add touch feedback
        button.addTarget(self, action: #selector(keyTouchDown(_:)), for: .touchDown)
        button.addTarget(self, action: #selector(keyTouchUp(_:)), for: [.touchUpInside, .touchUpOutside, .touchCancel])
        
        return button
    }
    
    private func setupConstraints() {
        suggestionStrip.translatesAutoresizingMaskIntoConstraints = false
        keyboardContainer.translatesAutoresizingMaskIntoConstraints = false
        suggestionStackView.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            // Suggestion strip
            suggestionStrip.topAnchor.constraint(equalTo: topAnchor),
            suggestionStrip.leadingAnchor.constraint(equalTo: leadingAnchor),
            suggestionStrip.trailingAnchor.constraint(equalTo: trailingAnchor),
            suggestionStrip.heightAnchor.constraint(equalToConstant: 44),
            
            // Keyboard container
            keyboardContainer.topAnchor.constraint(equalTo: suggestionStrip.bottomAnchor),
            keyboardContainer.leadingAnchor.constraint(equalTo: leadingAnchor),
            keyboardContainer.trailingAnchor.constraint(equalTo: trailingAnchor),
            keyboardContainer.bottomAnchor.constraint(equalTo: bottomAnchor),
            
            // Suggestion scroll view
            suggestionScrollView.heightAnchor.constraint(equalToConstant: 32),
            
            // Suggestion stack view
            suggestionStackView.topAnchor.constraint(equalTo: suggestionScrollView.topAnchor),
            suggestionStackView.leadingAnchor.constraint(equalTo: suggestionScrollView.leadingAnchor),
            suggestionStackView.trailingAnchor.constraint(equalTo: suggestionScrollView.trailingAnchor),
            suggestionStackView.bottomAnchor.constraint(equalTo: suggestionScrollView.bottomAnchor),
            suggestionStackView.heightAnchor.constraint(equalTo: suggestionScrollView.heightAnchor)
        ])
    }
    
    private func applyModernStyling() {
        // Add subtle border
        layer.borderColor = UIColor.separator.cgColor
        layer.borderWidth = 0.5
        
        // Add shadow
        layer.shadowColor = UIColor.black.cgColor
        layer.shadowOffset = CGSize(width: 0, height: -2)
        layer.shadowOpacity = 0.1
        layer.shadowRadius = 4
    }
    
    // MARK: - Public Methods
    func setKeyboardMode(_ mode: KeyboardMode) {
        currentMode = mode
        
        // Adapt keyboard based on mode
        switch mode {
        case .password:
            translateButton.isHidden = true
            isTranslationAvailable = false
        default:
            translateButton.isHidden = false
            isTranslationAvailable = true
        }
    }
    
    func updateLanguageDisplay(source: String, target: String) {
        languageIndicator.setTitle("\(source) → \(target)", for: .normal)
    }
    
    func setTranslationAvailable(_ available: Bool) {
        isTranslationAvailable = available
        translateButton.alpha = available ? 1.0 : 0.5
        translateButton.isEnabled = available
    }
    
    func updateLoadingProgress(_ progress: Float) {
        // Update loading indicator if needed
        translateButton.alpha = 0.5 + (0.5 * progress)
    }
    
    func showTranslationFeedback(original: String, translated: String) {
        // Clear existing suggestions
        suggestionStackView.arrangedSubviews.forEach { $0.removeFromSuperview() }
        
        // Add translation result as suggestion
        addSuggestion(original, translation: translated)
        
        // Animate feedback
        UIView.animate(withDuration: 0.3) {
            self.suggestionStrip.backgroundColor = UIColor.systemGreen.withAlphaComponent(0.1)
        } completion: { _ in
            UIView.animate(withDuration: 0.3, delay: 1.0) {
                self.suggestionStrip.backgroundColor = UIColor.secondarySystemBackground
            }
        }
    }
    
    private func addSuggestion(_ text: String, translation: String) {
        let button = UIButton(type: .system)
        button.setTitle("\(text) → \(translation)", for: .normal)
        button.titleLabel?.font = UIFont.systemFont(ofSize: 12, weight: .medium)
        button.backgroundColor = UIColor.systemBlue.withAlphaComponent(0.1)
        button.layer.cornerRadius = 6
        button.contentEdgeInsets = UIEdgeInsets(top: 4, left: 8, bottom: 4, right: 8)
        
        button.addTarget(self, action: #selector(suggestionTapped(_:)), for: .touchUpInside)
        
        suggestionStackView.addArrangedSubview(button)
    }
    
    // MARK: - Actions
    @objc private func keyTapped(_ sender: UIButton) {
        guard let title = sender.title(for: .normal) else { return }
        delegate?.keyboardView(self, didTapKey: title)
        
        // Haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
    }
    
    @objc private func specialKeyTapped(_ sender: UIButton) {
        let specialKeyTypes: [SpecialKeyType] = [.backspace, .return, .space, .translate, .languageSwitch, .clipboardTranslate]
        
        if sender.tag < specialKeyTypes.count {
            let keyType = specialKeyTypes[sender.tag]
            delegate?.keyboardView(self, didTapSpecialKey: keyType)
        }
        
        // Haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }
    
    @objc private func languageIndicatorTapped() {
        delegate?.keyboardView(self, didTapSpecialKey: .languageSwitch)
        
        // Haptic feedback
        let selectionFeedback = UISelectionFeedbackGenerator()
        selectionFeedback.selectionChanged()
    }
    
    @objc private func translateButtonTapped() {
        delegate?.keyboardView(self, didTapSpecialKey: .translate)
        
        // Haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }
    
    @objc private func suggestionTapped(_ sender: UIButton) {
        guard let title = sender.title(for: .normal) else { return }
        
        // Extract translation part (after →)
        let components = title.components(separatedBy: " → ")
        if components.count > 1 {
            delegate?.keyboardView(self, didSelectSuggestion: components[1])
        }
        
        // Haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
    }
    
    @objc private func keyTouchDown(_ sender: UIButton) {
        UIView.animate(withDuration: 0.1) {
            sender.transform = CGAffineTransform(scaleX: 0.95, y: 0.95)
            sender.alpha = 0.7
        }
    }
    
    @objc private func keyTouchUp(_ sender: UIButton) {
        UIView.animate(withDuration: 0.1) {
            sender.transform = .identity
            sender.alpha = 1.0
        }
    }
} 