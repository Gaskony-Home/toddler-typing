package com.toddlertyping.managers

import android.content.Context
import android.content.SharedPreferences
import android.util.Log

/**
 * Settings data class
 */
data class Settings(
    var voiceEnabled: Boolean = true,
    var fullscreen: Boolean = true,
    var theme: String = "light"
)

/**
 * Manages application settings using SharedPreferences.
 */
class SettingsManager(context: Context) {

    private val tag = "SettingsManager"
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "toddler_typing_settings",
        Context.MODE_PRIVATE
    )

    /**
     * Load settings from SharedPreferences.
     */
    fun getSettings(): Settings {
        return Settings(
            voiceEnabled = prefs.getBoolean("voice_enabled", true),
            fullscreen = prefs.getBoolean("fullscreen", true),
            theme = prefs.getString("theme", "light") ?: "light"
        )
    }

    /**
     * Save settings to SharedPreferences.
     */
    fun saveSettings(settings: Settings) {
        prefs.edit().apply {
            putBoolean("voice_enabled", settings.voiceEnabled)
            putBoolean("fullscreen", settings.fullscreen)
            putString("theme", settings.theme)
            apply()
        }
        Log.i(tag, "Settings saved")
    }
}
