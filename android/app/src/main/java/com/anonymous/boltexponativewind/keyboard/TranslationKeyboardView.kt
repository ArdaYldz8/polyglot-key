package com.anonymous.boltexponativewind.keyboard

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.Button
import android.widget.TextView
import android.widget.HorizontalScrollView
import androidx.core.content.ContextCompat

/**
 * TranslationKeyboardView - Custom keyboard UI with translation suggestions
 * Implements Material Design 3 principles and accessibility support
 */
class TranslationKeyboardView(private val context: Context) : LinearLayout(context) {
    
    interface OnKeyboardActionListener {
        fun onKeyPressed(primaryCode: Int)
        fun onTextInput(text: String)
        fun onTranslationRequested(text: String)
        fun onLanguageSwitch()
    }
    
    private var keyboardActionListener: OnKeyboardActionListener? = null
    private var suggestionStrip: LinearLayout? = null
    private var keyboardLayout: LinearLayout? = null
    private var languageIndicator: TextView? = null
    private var currentMode: Int = MODE_TEXT
    private var currentLanguagePair = "en → tr"
    
    init {
        orientation = VERTICAL
        setupKeyboardView()
    }
    
    /**
     * Set up the main keyboard view structure
     */
    private fun setupKeyboardView() {
        // Create suggestion strip
        createSuggestionStrip()
        
        // Create main keyboard layout
        createKeyboardLayout()
        
        // Apply Material Design 3 styling
        applyMaterialDesign()
    }
    
    /**
     * Create the suggestion strip with translation suggestions
     */
    private fun createSuggestionStrip() {
        suggestionStrip = LinearLayout(context).apply {
            orientation = HORIZONTAL
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT)
            setPadding(16, 8, 16, 8)
            setBackgroundColor(ContextCompat.getColor(context, android.R.color.white))
        }
        
        // Language indicator
        languageIndicator = TextView(context).apply {
            text = currentLanguagePair
            setPadding(12, 8, 12, 8)
            setBackgroundResource(android.R.drawable.btn_default)
            setOnClickListener { 
                keyboardActionListener?.onLanguageSwitch()
            }
        }
        
        suggestionStrip?.addView(languageIndicator)
        
        // Suggestion scroll view
        val suggestionScrollView = HorizontalScrollView(context).apply {
            layoutParams = LayoutParams(0, LayoutParams.WRAP_CONTENT, 1f)
        }
        
        val suggestionsContainer = LinearLayout(context).apply {
            orientation = HORIZONTAL
            // Add sample suggestions
            addSuggestion("Hello", "Merhaba")
            addSuggestion("Thank you", "Teşekkür ederim")
            addSuggestion("Good morning", "Günaydın")
        }
        
        suggestionScrollView.addView(suggestionsContainer)
        suggestionStrip?.addView(suggestionScrollView)
        
        // Translation button
        val translateButton = Button(context).apply {
            text = "🌐"
            layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT)
            setOnClickListener {
                // Request translation of current text
                requestTranslationOfCurrentText()
            }
        }
        
        suggestionStrip?.addView(translateButton)
        addView(suggestionStrip)
    }
    
    /**
     * Create the main keyboard layout
     */
    private fun createKeyboardLayout() {
        keyboardLayout = LinearLayout(context).apply {
            orientation = VERTICAL
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT)
            setPadding(8, 8, 8, 8)
        }
        
        // Create keyboard rows
        createKeyboardRows()
        
        addView(keyboardLayout)
    }
    
    /**
     * Create keyboard rows with QWERTY layout
     */
    private fun createKeyboardRows() {
        // Row 1: QWERTYUIOP
        val row1 = createKeyboardRow(listOf("Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"))
        keyboardLayout?.addView(row1)
        
        // Row 2: ASDFGHJKL
        val row2 = createKeyboardRow(listOf("A", "S", "D", "F", "G", "H", "J", "K", "L"))
        keyboardLayout?.addView(row2)
        
        // Row 3: ZXCVBNM with special keys
        val row3 = LinearLayout(context).apply {
            orientation = HORIZONTAL
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT)
            setPadding(4, 4, 4, 4)
        }
        
        // Add shift/caps key
        val shiftKey = createSpecialKey("⇧", PolyglotInputMethodService.KEYCODE_DELETE)
        row3.addView(shiftKey)
        
        // Add regular letter keys
        val letterKeys = createKeyboardRow(listOf("Z", "X", "C", "V", "B", "N", "M"))
        for (i in 0 until letterKeys.childCount) {
            row3.addView(letterKeys.getChildAt(i))
        }
        
        // Add backspace key
        val backspaceKey = createSpecialKey("⌫", PolyglotInputMethodService.KEYCODE_DELETE)
        row3.addView(backspaceKey)
        
        keyboardLayout?.addView(row3)
        
        // Row 4: Space bar and special keys
        val row4 = LinearLayout(context).apply {
            orientation = HORIZONTAL
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT)
            setPadding(4, 4, 4, 4)
        }
        
        // Numbers key
        val numbersKey = createSpecialKey("123", -200)
        row4.addView(numbersKey)
        
        // Space bar
        val spaceKey = createSpecialKey("Space", PolyglotInputMethodService.KEYCODE_SPACE).apply {
            layoutParams = LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1f)
        }
        row4.addView(spaceKey)
        
        // Enter key
        val enterKey = createSpecialKey("⏎", PolyglotInputMethodService.KEYCODE_ENTER)
        row4.addView(enterKey)
        
        keyboardLayout?.addView(row4)
    }
    
    /**
     * Create a row of keyboard keys
     */
    private fun createKeyboardRow(keys: List<String>): LinearLayout {
        return LinearLayout(context).apply {
            orientation = HORIZONTAL
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT)
            setPadding(4, 4, 4, 4)
            
            keys.forEach { key ->
                val button = createKey(key, key.first().code)
                addView(button)
            }
        }
    }
    
    /**
     * Create a regular keyboard key
     */
    private fun createKey(label: String, keyCode: Int): Button {
        return Button(context).apply {
            text = label
            layoutParams = LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1f).apply {
                setMargins(2, 2, 2, 2)
            }
            setOnClickListener {
                keyboardActionListener?.onKeyPressed(keyCode)
            }
            // Apply Material Design styling
            setBackgroundResource(android.R.drawable.btn_default)
        }
    }
    
    /**
     * Create a special function key
     */
    private fun createSpecialKey(label: String, keyCode: Int): Button {
        return Button(context).apply {
            text = label
            layoutParams = LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT).apply {
                setMargins(2, 2, 2, 2)
            }
            setOnClickListener {
                when (keyCode) {
                    PolyglotInputMethodService.KEYCODE_TRANSLATE -> {
                        requestTranslationOfCurrentText()
                    }
                    else -> {
                        keyboardActionListener?.onKeyPressed(keyCode)
                    }
                }
            }
            // Special styling for function keys
            setBackgroundResource(android.R.drawable.btn_default)
        }
    }
    
    /**
     * Add a suggestion to the suggestion strip
     */
    private fun LinearLayout.addSuggestion(original: String, translation: String) {
        val suggestionButton = Button(context).apply {
            text = "$original → $translation"
            layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT).apply {
                setMargins(4, 0, 4, 0)
            }
            setOnClickListener {
                keyboardActionListener?.onTextInput(translation)
            }
        }
        addView(suggestionButton)
    }
    
    /**
     * Request translation of currently typed text
     */
    private fun requestTranslationOfCurrentText() {
        // This would typically get the current text from the input field
        // For now, we'll use placeholder text
        val currentText = "Hello" // Placeholder - would get from InputConnection
        keyboardActionListener?.onTranslationRequested(currentText)
    }
    
    /**
     * Apply Material Design 3 styling
     */
    private fun applyMaterialDesign() {
        // Set background color
        setBackgroundColor(ContextCompat.getColor(context, android.R.color.background_light))
        
        // Apply elevation and shadows (Material Design)
        elevation = 8f
    }
    
    /**
     * Set keyboard action listener
     */
    fun setOnKeyboardActionListener(listener: OnKeyboardActionListener) {
        keyboardActionListener = listener
    }
    
    /**
     * Show the keyboard
     */
    fun show() {
        visibility = View.VISIBLE
    }
    
    /**
     * Hide the keyboard
     */
    fun hide() {
        visibility = View.GONE
    }
    
    /**
     * Set keyboard mode (text, email, number, etc.)
     */
    fun setKeyboardMode(mode: Int) {
        currentMode = mode
        // Adapt layout based on mode
        when (mode) {
            MODE_EMAIL -> {
                // Add @ and . keys
            }
            MODE_URL -> {
                // Add / and . keys
            }
            MODE_NUMBER -> {
                // Show number pad
            }
            MODE_PASSWORD -> {
                // Disable translation for security
            }
            // Default is MODE_TEXT
        }
    }
    
    /**
     * Update language display
     */
    fun updateLanguageDisplay() {
        // Cycle through language pairs
        currentLanguagePair = when (currentLanguagePair) {
            "en → tr" -> "tr → en"
            "tr → en" -> "en → es"
            "en → es" -> "es → en"
            else -> "en → tr"
        }
        languageIndicator?.text = currentLanguagePair
    }
    
    companion object {
        const val MODE_TEXT = 0
        const val MODE_EMAIL = 1
        const val MODE_URL = 2
        const val MODE_NUMBER = 3
        const val MODE_PASSWORD = 4
    }
} 