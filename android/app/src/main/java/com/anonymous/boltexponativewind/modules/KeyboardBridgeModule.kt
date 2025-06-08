package com.anonymous.boltexponativewind.modules

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.content.Context
import android.content.SharedPreferences
import org.json.JSONObject
import org.json.JSONArray

/**
 * KeyboardBridgeModule - React Native bridge for keyboard communication
 * Handles settings synchronization, translation history, and keyboard status
 */
class KeyboardBridgeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private val preferences: SharedPreferences = reactContext.getSharedPreferences("polyglot_keyboard", Context.MODE_PRIVATE)
    
    override fun getName(): String {
        return "KeyboardBridge"
    }
    
    /**
     * Get keyboard settings from native storage
     */
    @ReactMethod
    fun getKeyboardSettings(promise: Promise) {
        try {
            val settings = WritableNativeMap()
            
            settings.putString("sourceLanguage", preferences.getString("source_language", "en"))
            settings.putString("targetLanguage", preferences.getString("target_language", "tr"))
            settings.putBoolean("translationEnabled", preferences.getBoolean("translation_enabled", true))
            settings.putBoolean("hapticFeedback", preferences.getBoolean("haptic_feedback", true))
            settings.putBoolean("soundFeedback", preferences.getBoolean("sound_feedback", false))
            settings.putString("keyboardTheme", preferences.getString("keyboard_theme", "system"))
            settings.putBoolean("autoTranslate", preferences.getBoolean("auto_translate", false))
            settings.putInt("translationDelay", preferences.getInt("translation_delay", 500))
            
            promise.resolve(settings)
        } catch (e: Exception) {
            promise.reject("SETTINGS_ERROR", "Failed to get keyboard settings", e)
        }
    }
    
    /**
     * Update keyboard settings in native storage
     */
    @ReactMethod
    fun updateKeyboardSettings(settings: ReadableMap, promise: Promise) {
        try {
            val editor = preferences.edit()
            
            if (settings.hasKey("sourceLanguage")) {
                editor.putString("source_language", settings.getString("sourceLanguage"))
            }
            if (settings.hasKey("targetLanguage")) {
                editor.putString("target_language", settings.getString("targetLanguage"))
            }
            if (settings.hasKey("translationEnabled")) {
                editor.putBoolean("translation_enabled", settings.getBoolean("translationEnabled"))
            }
            if (settings.hasKey("hapticFeedback")) {
                editor.putBoolean("haptic_feedback", settings.getBoolean("hapticFeedback"))
            }
            if (settings.hasKey("soundFeedback")) {
                editor.putBoolean("sound_feedback", settings.getBoolean("soundFeedback"))
            }
            if (settings.hasKey("keyboardTheme")) {
                editor.putString("keyboard_theme", settings.getString("keyboardTheme"))
            }
            if (settings.hasKey("autoTranslate")) {
                editor.putBoolean("auto_translate", settings.getBoolean("autoTranslate"))
            }
            if (settings.hasKey("translationDelay")) {
                editor.putInt("translation_delay", settings.getInt("translationDelay"))
            }
            
            editor.apply()
            
            // Notify keyboard of settings change
            sendEventToKeyboard("settingsUpdated", settings.toHashMap())
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SETTINGS_UPDATE_ERROR", "Failed to update keyboard settings", e)
        }
    }
    
    /**
     * Get translation history from native storage
     */
    @ReactMethod
    fun getTranslationHistory(promise: Promise) {
        try {
            val historyJson = preferences.getString("translation_history", "[]")
            val historyArray = JSONArray(historyJson)
            val history = WritableNativeArray()
            
            for (i in 0 until historyArray.length()) {
                val item = historyArray.getJSONObject(i)
                val historyItem = WritableNativeMap()
                
                historyItem.putString("id", item.getString("id"))
                historyItem.putString("originalText", item.getString("originalText"))
                historyItem.putString("translatedText", item.getString("translatedText"))
                historyItem.putString("sourceLanguage", item.getString("sourceLanguage"))
                historyItem.putString("targetLanguage", item.getString("targetLanguage"))
                historyItem.putDouble("timestamp", item.getDouble("timestamp"))
                historyItem.putBoolean("isFavorite", item.optBoolean("isFavorite", false))
                historyItem.putDouble("confidence", item.optDouble("confidence", 0.0))
                
                history.pushMap(historyItem)
            }
            
            promise.resolve(history)
        } catch (e: Exception) {
            promise.reject("HISTORY_ERROR", "Failed to get translation history", e)
        }
    }
    
    /**
     * Add translation to history
     */
    @ReactMethod
    fun addTranslationToHistory(translation: ReadableMap, promise: Promise) {
        try {
            val historyJson = preferences.getString("translation_history", "[]")
            val historyArray = JSONArray(historyJson)
            
            // Create new translation item
            val newItem = JSONObject()
            newItem.put("id", translation.getString("id") ?: System.currentTimeMillis().toString())
            newItem.put("originalText", translation.getString("originalText"))
            newItem.put("translatedText", translation.getString("translatedText"))
            newItem.put("sourceLanguage", translation.getString("sourceLanguage"))
            newItem.put("targetLanguage", translation.getString("targetLanguage"))
            newItem.put("timestamp", System.currentTimeMillis().toDouble())
            newItem.put("isFavorite", translation.getBoolean("isFavorite"))
            newItem.put("confidence", translation.getDouble("confidence"))
            
            // Add to beginning of array
            historyArray.put(0, newItem)
            
            // Limit history to 1000 items
            while (historyArray.length() > 1000) {
                historyArray.remove(historyArray.length() - 1)
            }
            
            // Save back to preferences
            preferences.edit()
                .putString("translation_history", historyArray.toString())
                .apply()
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("HISTORY_ADD_ERROR", "Failed to add translation to history", e)
        }
    }
    
    /**
     * Clear translation history
     */
    @ReactMethod
    fun clearTranslationHistory(promise: Promise) {
        try {
            preferences.edit()
                .putString("translation_history", "[]")
                .apply()
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("HISTORY_CLEAR_ERROR", "Failed to clear translation history", e)
        }
    }
    
    /**
     * Check if keyboard is enabled in system settings
     */
    @ReactMethod
    fun isKeyboardEnabled(promise: Promise) {
        try {
            val inputMethodManager = reactApplicationContext.getSystemService(Context.INPUT_METHOD_SERVICE) as android.view.inputmethod.InputMethodManager
            val enabledInputMethods = inputMethodManager.enabledInputMethodList
            
            val packageName = reactApplicationContext.packageName
            val isEnabled = enabledInputMethods.any { 
                it.packageName == packageName 
            }
            
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.reject("KEYBOARD_STATUS_ERROR", "Failed to check keyboard status", e)
        }
    }
    
    /**
     * Open keyboard settings in system
     */
    @ReactMethod
    fun openKeyboardSettings(promise: Promise) {
        try {
            val intent = android.content.Intent(android.provider.Settings.ACTION_INPUT_METHOD_SETTINGS)
            intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("KEYBOARD_SETTINGS_ERROR", "Failed to open keyboard settings", e)
        }
    }
    
    /**
     * Get keyboard usage statistics
     */
    @ReactMethod
    fun getKeyboardStats(promise: Promise) {
        try {
            val stats = WritableNativeMap()
            
            stats.putInt("totalTranslations", preferences.getInt("total_translations", 0))
            stats.putInt("totalKeystrokes", preferences.getInt("total_keystrokes", 0))
            stats.putDouble("averageTranslationTime", preferences.getFloat("avg_translation_time", 0f).toDouble())
            stats.putString("mostUsedLanguagePair", preferences.getString("most_used_language_pair", "en-tr"))
            stats.putDouble("lastUsed", preferences.getLong("last_used", 0).toDouble())
            stats.putInt("sessionsCount", preferences.getInt("sessions_count", 0))
            
            promise.resolve(stats)
        } catch (e: Exception) {
            promise.reject("STATS_ERROR", "Failed to get keyboard statistics", e)
        }
    }
    
    /**
     * Update keyboard statistics
     */
    @ReactMethod
    fun updateKeyboardStats(stats: ReadableMap, promise: Promise) {
        try {
            val editor = preferences.edit()
            
            if (stats.hasKey("totalTranslations")) {
                editor.putInt("total_translations", stats.getInt("totalTranslations"))
            }
            if (stats.hasKey("totalKeystrokes")) {
                editor.putInt("total_keystrokes", stats.getInt("totalKeystrokes"))
            }
            if (stats.hasKey("averageTranslationTime")) {
                editor.putFloat("avg_translation_time", stats.getDouble("averageTranslationTime").toFloat())
            }
            if (stats.hasKey("mostUsedLanguagePair")) {
                editor.putString("most_used_language_pair", stats.getString("mostUsedLanguagePair"))
            }
            if (stats.hasKey("lastUsed")) {
                editor.putLong("last_used", stats.getDouble("lastUsed").toLong())
            }
            if (stats.hasKey("sessionsCount")) {
                editor.putInt("sessions_count", stats.getInt("sessionsCount"))
            }
            
            editor.apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STATS_UPDATE_ERROR", "Failed to update keyboard statistics", e)
        }
    }
    
    /**
     * Send event to keyboard service
     */
    private fun sendEventToKeyboard(eventName: String, data: Any?) {
        try {
            val params = WritableNativeMap()
            params.putString("event", eventName)
            
            when (data) {
                is Map<*, *> -> {
                    val dataMap = WritableNativeMap()
                    data.forEach { (key, value) ->
                        when (value) {
                            is String -> dataMap.putString(key.toString(), value)
                            is Boolean -> dataMap.putBoolean(key.toString(), value)
                            is Int -> dataMap.putInt(key.toString(), value)
                            is Double -> dataMap.putDouble(key.toString(), value)
                            is Float -> dataMap.putDouble(key.toString(), value.toDouble())
                        }
                    }
                    params.putMap("data", dataMap)
                }
                is String -> params.putString("data", data)
                is Boolean -> params.putBoolean("data", data)
                is Int -> params.putInt("data", data)
                is Double -> params.putDouble("data", data)
            }
            
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("KeyboardEvent", params)
        } catch (e: Exception) {
            android.util.Log.e("KeyboardBridge", "Failed to send event to keyboard", e)
        }
    }
    
    /**
     * Listen for keyboard events
     */
    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN event emitter
    }
    
    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN event emitter
    }
} 