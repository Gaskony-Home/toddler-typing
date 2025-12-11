package com.toddlertyping.api

import android.content.Context
import android.speech.tts.TextToSpeech
import android.util.Log
import android.webkit.JavascriptInterface
import com.google.gson.Gson
import com.toddlertyping.managers.ProgressManager
import com.toddlertyping.managers.SettingsManager
import com.toddlertyping.managers.VoiceManager
import java.util.*

/**
 * JavaScript bridge interface that exposes Android functionality to the WebView.
 * This mirrors the Python ToddlerTypingAPI from the desktop version.
 */
class ToddlerTypingAPI(private val context: Context) {

    private val tag = "ToddlerTypingAPI"
    private val gson = Gson()

    // Security constants for input validation
    companion object {
        private const val MAX_TEXT_LENGTH = 500
        private const val MAX_KEY_LENGTH = 10
        private const val MAX_ACTIVITY_NAME_LENGTH = 50
        private val VALID_ACTIVITIES = setOf("letters_numbers", "drawing", "colors_shapes", "coloring", "dot2dot", "sounds")
        private val VALID_THEMES = setOf("light", "dark")
        private val ALPHANUMERIC_PATTERN = Regex("^[a-zA-Z0-9]+$")
    }

    private var currentActivity: String? = null
    private val voiceManager: VoiceManager = VoiceManager(context)
    private val progressManager: ProgressManager = ProgressManager(context)
    private val settingsManager: SettingsManager = SettingsManager(context)

    init {
        Log.i(tag, "ToddlerTypingAPI initialized")
    }

    // === Input Validation Helpers ===

    private fun validateString(value: String?, maxLength: Int, fieldName: String): String? {
        if (value == null) return "Invalid $fieldName: must not be null"
        if (value.length > maxLength) return "Invalid $fieldName: exceeds maximum length of $maxLength"
        return null
    }

    private fun errorResponse(error: String): String {
        return gson.toJson(mapOf("success" to false, "error" to error))
    }

    // === Activity Management ===

    @JavascriptInterface
    fun startActivity(activityName: String): String {
        // Input validation
        validateString(activityName, MAX_ACTIVITY_NAME_LENGTH, "activityName")?.let { error ->
            Log.w(tag, "Invalid activity name: $error")
            return errorResponse(error)
        }

        if (activityName !in VALID_ACTIVITIES) {
            Log.w(tag, "Unknown activity requested: $activityName")
            return errorResponse("Unknown activity")
        }

        Log.i(tag, "Starting activity: $activityName")

        return try {
            // Stop current activity if running
            currentActivity?.let { stopActivity() }

            // Set current activity
            currentActivity = activityName

            // Speak activity welcome message if voice enabled
            val settings = settingsManager.getSettings()
            if (settings.voiceEnabled) {
                val welcomeMessage = getActivityWelcome(activityName)
                voiceManager.speak(welcomeMessage)
            }

            gson.toJson(
                mapOf(
                    "success" to true,
                    "activity" to activityName,
                    "message" to "Activity $activityName started successfully"
                )
            )
        } catch (e: Exception) {
            Log.e(tag, "Failed to start activity $activityName", e)
            gson.toJson(
                mapOf(
                    "success" to false,
                    "error" to e.message
                )
            )
        }
    }

    @JavascriptInterface
    fun stopActivity(): String {
        Log.i(tag, "Stopping activity")

        return try {
            // Clear current activity
            currentActivity = null

            gson.toJson(
                mapOf(
                    "success" to true,
                    "message" to "Activity stopped successfully"
                )
            )
        } catch (e: Exception) {
            Log.e(tag, "Failed to stop activity", e)
            gson.toJson(
                mapOf(
                    "success" to false,
                    "error" to e.message
                )
            )
        }
    }

    private fun getActivityWelcome(activityName: String): String {
        return when (activityName) {
            "letters_numbers" -> "Let's learn letters and numbers! Press any key to start."
            "drawing" -> "Time to draw! Press keys to make colorful art."
            "colors_shapes" -> "Let's explore colors and shapes!"
            "coloring" -> "Let's color some pictures! Choose your favorite colors."
            else -> "Let's play $activityName!"
        }
    }

    // === Voice/Audio Management ===

    @JavascriptInterface
    fun speak(text: String): String {
        return speak(text, false)
    }

    @JavascriptInterface
    fun speak(text: String, interrupt: Boolean): String {
        // Input validation
        validateString(text, MAX_TEXT_LENGTH, "text")?.let { error ->
            Log.w(tag, "Invalid TTS text: $error")
            return errorResponse("Invalid text input")
        }

        return try {
            val settings = settingsManager.getSettings()
            if (settings.voiceEnabled) {
                voiceManager.speak(text, interrupt)
                gson.toJson(mapOf("success" to true))
            } else {
                gson.toJson(
                    mapOf(
                        "success" to false,
                        "message" to "Voice disabled"
                    )
                )
            }
        } catch (e: Exception) {
            Log.e(tag, "Failed to speak text", e)
            gson.toJson(
                mapOf(
                    "success" to false,
                    "error" to "Speech synthesis failed"
                )
            )
        }
    }

    @JavascriptInterface
    fun speakText(text: String): String {
        return speak(text, true)
    }

    @JavascriptInterface
    fun toggleVoice(): String {
        val settings = settingsManager.getSettings()
        val newEnabled = !settings.voiceEnabled
        settings.voiceEnabled = newEnabled
        settingsManager.saveSettings(settings)

        return gson.toJson(
            mapOf(
                "success" to true,
                "voice_enabled" to newEnabled,
                "muted" to !newEnabled
            )
        )
    }

    @JavascriptInterface
    fun setVoiceEnabled(enabled: Boolean): String {
        val settings = settingsManager.getSettings()
        settings.voiceEnabled = enabled
        settingsManager.saveSettings(settings)

        return gson.toJson(
            mapOf(
                "success" to true,
                "voice_enabled" to enabled
            )
        )
    }

    // === Settings Management ===

    @JavascriptInterface
    fun saveSettings(settingsJson: String): String {
        return try {
            // Input validation - limit JSON size
            if (settingsJson.length > 1000) {
                Log.w(tag, "Settings JSON too large: ${settingsJson.length}")
                return errorResponse("Invalid settings: input too large")
            }

            Log.i(tag, "Saving settings")

            val settingsMap = try {
                gson.fromJson<Map<String, Any>>(settingsJson, Map::class.java) as? Map<String, Any>
                    ?: return errorResponse("Invalid settings format")
            } catch (e: Exception) {
                Log.w(tag, "Invalid JSON in settings: ${e.message}")
                return errorResponse("Invalid settings format")
            }

            val settings = settingsManager.getSettings()
            val allowedKeys = setOf("voice_enabled", "fullscreen", "theme")

            // Update settings with validation
            settingsMap.forEach { (key, value) ->
                if (key !in allowedKeys) {
                    Log.w(tag, "Ignoring unknown setting key: $key")
                    return@forEach
                }

                when (key) {
                    "voice_enabled" -> if (value is Boolean) settings.voiceEnabled = value
                    "fullscreen" -> if (value is Boolean) settings.fullscreen = value
                    "theme" -> if (value is String && value in VALID_THEMES) settings.theme = value
                }
            }

            settingsManager.saveSettings(settings)

            gson.toJson(
                mapOf(
                    "success" to true,
                    "message" to "Settings saved successfully"
                )
            )
        } catch (e: Exception) {
            Log.e(tag, "Failed to save settings", e)
            gson.toJson(
                mapOf(
                    "success" to false,
                    "error" to "Failed to save settings"
                )
            )
        }
    }

    @JavascriptInterface
    fun loadSettings(): String {
        return try {
            val settings = settingsManager.getSettings()
            gson.toJson(
                mapOf(
                    "success" to true,
                    "settings" to mapOf(
                        "voice_enabled" to settings.voiceEnabled,
                        "fullscreen" to settings.fullscreen,
                        "theme" to settings.theme
                    )
                )
            )
        } catch (e: Exception) {
            Log.e(tag, "Failed to load settings", e)
            gson.toJson(
                mapOf(
                    "success" to false,
                    "error" to e.message
                )
            )
        }
    }

    // === Letters & Numbers Activity ===

    @JavascriptInterface
    fun getRandomLetterOrNumber(): String {
        val isLetter = Random().nextBoolean()

        val (char, voiceText, charType) = if (isLetter) {
            val letter = ('A'..'Z').random()
            Triple(letter.toString(), "Press the letter $letter on the keyboard", "letter")
        } else {
            val number = (0..9).random()
            Triple(number.toString(), "Press the number $number on the keyboard", "number")
        }

        // Speak the instruction if voice enabled
        val settings = settingsManager.getSettings()
        if (settings.voiceEnabled) {
            voiceManager.speak(voiceText, true)
        }

        return gson.toJson(
            mapOf(
                "success" to true,
                "character" to char,
                "type" to charType,
                "voice_text" to voiceText
            )
        )
    }

    @JavascriptInterface
    fun checkLetterNumberAnswer(pressedKey: String, expectedKey: String): String {
        // Input validation
        for ((key, name) in listOf(pressedKey to "pressedKey", expectedKey to "expectedKey")) {
            validateString(key, MAX_KEY_LENGTH, name)?.let { error ->
                Log.w(tag, "Invalid key input: $error")
                return errorResponse("Invalid key input")
            }

            if (!ALPHANUMERIC_PATTERN.matches(key.trim())) {
                Log.w(tag, "Invalid characters in $name: $key")
                return errorResponse("Invalid key characters")
            }
        }

        return try {
            val pressed = pressedKey.uppercase().trim()
            val expected = expectedKey.uppercase().trim()
            val isCorrect = pressed == expected

            val result = mutableMapOf<String, Any>(
                "success" to true,
                "correct" to isCorrect,
                "pressed_key" to pressedKey,
                "expected_key" to expectedKey
            )

            // Award star if correct
            if (isCorrect) {
                val (starAwarded, levelUp) = progressManager.awardStar("letters_numbers")

                if (starAwarded) {
                    result["star_awarded"] = true
                    result["total_stars"] = progressManager.getAllStars()
                    result["level"] = progressManager.getLevel()
                    result["level_up"] = levelUp

                    // Speak encouragement
                    val settings = settingsManager.getSettings()
                    if (settings.voiceEnabled) {
                        val encouragements = listOf(
                            "Great job!",
                            "Excellent!",
                            "Well done!",
                            "Amazing!",
                            "Fantastic!",
                            "You're doing great!"
                        )
                        var message = encouragements.random()
                        if (levelUp) {
                            message = "$message Level up! You're now level ${result["level"]}!"
                        }
                        voiceManager.speak(message)
                    }
                }
            }

            gson.toJson(result)
        } catch (e: Exception) {
            Log.e(tag, "Error checking answer", e)
            gson.toJson(
                mapOf(
                    "success" to false,
                    "error" to e.message
                )
            )
        }
    }

    // === Progress/Gamification ===

    @JavascriptInterface
    fun getProgress(): String {
        return try {
            gson.toJson(
                mapOf(
                    "success" to true,
                    "progress" to progressManager.getProgress()
                )
            )
        } catch (e: Exception) {
            Log.e(tag, "Failed to get progress", e)
            gson.toJson(
                mapOf(
                    "success" to false,
                    "error" to e.message
                )
            )
        }
    }

    @JavascriptInterface
    fun awardStars(activity: String, count: Int): String {
        // Input validation
        if (activity !in VALID_ACTIVITIES) {
            Log.w(tag, "Invalid activity for star award: $activity")
            return errorResponse("Invalid activity")
        }

        if (count < 0 || count > 10) {
            Log.w(tag, "Invalid star count: $count")
            return errorResponse("Invalid star count")
        }

        return try {
            progressManager.awardStars(activity, count)
            val total = progressManager.getAllStars()

            // Speak encouragement
            val settings = settingsManager.getSettings()
            if (settings.voiceEnabled && count > 0) {
                val plural = if (count > 1) "s" else ""
                val message = "Great job! You earned $count star$plural!"
                voiceManager.speak(message)
            }

            gson.toJson(
                mapOf(
                    "success" to true,
                    "stars_awarded" to count,
                    "total_stars" to total
                )
            )
        } catch (e: Exception) {
            Log.e(tag, "Failed to award stars", e)
            gson.toJson(
                mapOf(
                    "success" to false,
                    "error" to e.message
                )
            )
        }
    }

    // === System/Info ===

    @JavascriptInterface
    fun getVersion(): String {
        return "1.0.0"
    }

    @JavascriptInterface
    fun getSystemInfo(): String {
        return gson.toJson(
            mapOf(
                "success" to true,
                "version" to "1.0.0",
                "platform" to "android",
                "current_activity" to currentActivity
            )
        )
    }

    // === Character Control (Placeholders for compatibility) ===

    @JavascriptInterface
    fun playCharacterAnimation(animationName: String): String {
        return playCharacterAnimation(animationName, null)
    }

    @JavascriptInterface
    fun playCharacterAnimation(animationName: String, loop: Boolean?): String {
        Log.i(tag, "Playing character animation: $animationName")
        return gson.toJson(
            mapOf(
                "success" to true,
                "animation" to animationName,
                "loop" to loop,
                "message" to "Animation $animationName triggered"
            )
        )
    }

    @JavascriptInterface
    fun setCharacterEmotion(emotion: String): String {
        Log.i(tag, "Setting character emotion: $emotion")
        return gson.toJson(
            mapOf(
                "success" to true,
                "emotion" to emotion,
                "message" to "Character emotion set to $emotion"
            )
        )
    }

    @JavascriptInterface
    fun characterStartTalking(): String {
        return gson.toJson(
            mapOf(
                "success" to true,
                "message" to "Character talking animation started"
            )
        )
    }

    @JavascriptInterface
    fun characterStopTalking(): String {
        return gson.toJson(
            mapOf(
                "success" to true,
                "message" to "Character talking animation stopped"
            )
        )
    }

    // === Keyboard Lock (Not applicable on Android) ===

    @JavascriptInterface
    fun checkExitCombination(): Boolean {
        // Not applicable on Android - use back button handling instead
        return false
    }

    // === Cleanup ===

    fun cleanup() {
        Log.i(tag, "Cleaning up API resources")
        currentActivity = null
        voiceManager.shutdown()
    }
}
