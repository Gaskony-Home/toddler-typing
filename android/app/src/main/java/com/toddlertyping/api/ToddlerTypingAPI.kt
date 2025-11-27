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

    private var currentActivity: String? = null
    private val voiceManager: VoiceManager = VoiceManager(context)
    private val progressManager: ProgressManager = ProgressManager(context)
    private val settingsManager: SettingsManager = SettingsManager(context)

    init {
        Log.i(tag, "ToddlerTypingAPI initialized")
    }

    // === Activity Management ===

    @JavascriptInterface
    fun startActivity(activityName: String): String {
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
                    "error" to e.message
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
            Log.i(tag, "Saving settings: $settingsJson")

            val settingsMap = gson.fromJson<Map<String, Any>>(
                settingsJson,
                Map::class.java
            ) as Map<String, Any>

            val settings = settingsManager.getSettings()

            // Update settings
            settingsMap["voice_enabled"]?.let {
                settings.voiceEnabled = it as Boolean
            }
            settingsMap["fullscreen"]?.let {
                settings.fullscreen = it as Boolean
            }
            settingsMap["theme"]?.let {
                settings.theme = it as String
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
                    "error" to e.message
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
