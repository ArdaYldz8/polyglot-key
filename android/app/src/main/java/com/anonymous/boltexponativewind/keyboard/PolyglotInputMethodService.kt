package com.anonymous.boltexponativewind.keyboard

import android.inputmethodservice.InputMethodService
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputConnection
import android.widget.Toast
import kotlinx.coroutines.*

/**
 * PolyglotInputMethodService - Main Android IME service for translation keyboard
 * Handles text input, translation, and communication with the main app
 */
class PolyglotInputMethodService : InputMethodService() {
    
    private var keyboardView: TranslationKeyboardView? = null
    private var modelInferenceManager: ModelInferenceManager? = null
    private var currentInputConnection: InputConnection? = null
    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize the model inference manager
        modelInferenceManager = ModelInferenceManager(this)
        
        // Log service creation
        android.util.Log.d("PolyglotIME", "InputMethodService created")
    }
    
    override fun onCreateInputView(): View {
        // Create and return the keyboard view
        keyboardView = TranslationKeyboardView(this)
        
        // Set up keyboard event listeners
        keyboardView?.setOnKeyboardActionListener(object : TranslationKeyboardView.OnKeyboardActionListener {
            override fun onKeyPressed(primaryCode: Int) {
                handleKeyPress(primaryCode)
            }
            
            override fun onTextInput(text: String) {
                handleTextInput(text)
            }
            
            override fun onTranslationRequested(text: String) {
                handleTranslationRequest(text)
            }
            
            override fun onLanguageSwitch() {
                handleLanguageSwitch()
            }
        })
        
        android.util.Log.d("PolyglotIME", "Input view created")
        return keyboardView!!
    }
    
    override fun onStartInput(attribute: EditorInfo?, restarting: Boolean) {
        super.onStartInput(attribute, restarting)
        
        currentInputConnection = currentInputConnection
        
        // Adapt keyboard based on input type
        attribute?.let { 
            adaptKeyboardToInputType(it)
        }
        
        android.util.Log.d("PolyglotIME", "Input started, input type: ${attribute?.inputType}")
    }
    
    override fun onStartInputView(attribute: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(attribute, restarting)
        
        // Show the keyboard view
        keyboardView?.show()
        
        android.util.Log.d("PolyglotIME", "Input view started")
    }
    
    override fun onFinishInput() {
        super.onFinishInput()
        
        // Clean up current input session
        currentInputConnection = null
        keyboardView?.hide()
        
        android.util.Log.d("PolyglotIME", "Input finished")
    }
    
    override fun onDestroy() {
        super.onDestroy()
        
        // Clean up resources
        serviceScope.cancel()
        modelInferenceManager?.cleanup()
        
        android.util.Log.d("PolyglotIME", "InputMethodService destroyed")
    }
    
    /**
     * Handle individual key presses
     */
    private fun handleKeyPress(primaryCode: Int) {
        val inputConnection = currentInputConnection ?: return
        
        when (primaryCode) {
            KEYCODE_DELETE -> {
                // Handle backspace
                inputConnection.deleteSurroundingText(1, 0)
            }
            KEYCODE_ENTER -> {
                // Handle enter/return
                inputConnection.sendKeyEvent(android.view.KeyEvent(
                    android.view.KeyEvent.ACTION_DOWN,
                    android.view.KeyEvent.KEYCODE_ENTER
                ))
                inputConnection.sendKeyEvent(android.view.KeyEvent(
                    android.view.KeyEvent.ACTION_UP,
                    android.view.KeyEvent.KEYCODE_ENTER
                ))
            }
            KEYCODE_SPACE -> {
                // Handle space
                inputConnection.commitText(" ", 1)
            }
            else -> {
                // Handle regular character input
                if (primaryCode > 0) {
                    inputConnection.commitText(primaryCode.toChar().toString(), 1)
                }
            }
        }
    }
    
    /**
     * Handle text input (for word completion, suggestions, etc.)
     */
    private fun handleTextInput(text: String) {
        val inputConnection = currentInputConnection ?: return
        inputConnection.commitText(text, 1)
    }
    
    /**
     * Handle translation requests
     */
    private fun handleTranslationRequest(text: String) {
        serviceScope.launch {
            try {
                val translatedText = modelInferenceManager?.translateText(text)
                
                if (translatedText != null) {
                    // Replace the original text with translation
                    val inputConnection = currentInputConnection
                    inputConnection?.let {
                        // Select the text and replace it
                        it.deleteSurroundingText(text.length, 0)
                        it.commitText(translatedText, 1)
                    }
                    
                    // Show translation feedback
                    showTranslationFeedback("Translated: $text → $translatedText")
                } else {
                    showTranslationFeedback("Translation failed")
                }
            } catch (e: Exception) {
                android.util.Log.e("PolyglotIME", "Translation error", e)
                showTranslationFeedback("Translation error: ${e.message}")
            }
        }
    }
    
    /**
     * Handle language switching
     */
    private fun handleLanguageSwitch() {
        modelInferenceManager?.switchLanguage()
        keyboardView?.updateLanguageDisplay()
        showTranslationFeedback("Language switched")
    }
    
    /**
     * Adapt keyboard layout based on input field type
     */
    private fun adaptKeyboardToInputType(editorInfo: EditorInfo) {
        val inputType = editorInfo.inputType
        
        when {
            // Email input
            inputType and android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS != 0 -> {
                keyboardView?.setKeyboardMode(TranslationKeyboardView.MODE_EMAIL)
            }
            // URL input
            inputType and android.text.InputType.TYPE_TEXT_VARIATION_URI != 0 -> {
                keyboardView?.setKeyboardMode(TranslationKeyboardView.MODE_URL)
            }
            // Number input
            inputType and android.text.InputType.TYPE_CLASS_NUMBER != 0 -> {
                keyboardView?.setKeyboardMode(TranslationKeyboardView.MODE_NUMBER)
            }
            // Password input (disable translation for security)
            inputType and android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD != 0 -> {
                keyboardView?.setKeyboardMode(TranslationKeyboardView.MODE_PASSWORD)
            }
            // Default text input
            else -> {
                keyboardView?.setKeyboardMode(TranslationKeyboardView.MODE_TEXT)
            }
        }
    }
    
    /**
     * Show feedback to user
     */
    private fun showTranslationFeedback(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
    
    companion object {
        // Key codes for special keys
        const val KEYCODE_DELETE = -5
        const val KEYCODE_ENTER = -4
        const val KEYCODE_SPACE = 32
        const val KEYCODE_TRANSLATE = -100
        const val KEYCODE_LANGUAGE_SWITCH = -101
    }
} 