package com.toddlertyping.managers

import android.content.Context
import android.speech.tts.TextToSpeech
import android.util.Log
import java.util.*

/**
 * Manages text-to-speech functionality for the app.
 */
class VoiceManager(context: Context) {

    private val tag = "VoiceManager"
    private var tts: TextToSpeech? = null
    private var isInitialized = false

    init {
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val result = tts?.setLanguage(Locale.US)
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    Log.e(tag, "Language not supported")
                } else {
                    isInitialized = true
                    Log.i(tag, "TextToSpeech initialized successfully")
                }
            } else {
                Log.e(tag, "TextToSpeech initialization failed")
            }
        }
    }

    /**
     * Speak the given text.
     *
     * @param text The text to speak
     * @param interrupt Whether to interrupt current speech
     */
    fun speak(text: String, interrupt: Boolean = false) {
        if (!isInitialized) {
            Log.w(tag, "TTS not initialized, cannot speak")
            return
        }

        try {
            val queueMode = if (interrupt) {
                TextToSpeech.QUEUE_FLUSH
            } else {
                TextToSpeech.QUEUE_ADD
            }

            tts?.speak(text, queueMode, null, null)
            Log.d(tag, "Speaking: $text")
        } catch (e: Exception) {
            Log.e(tag, "Error speaking text", e)
        }
    }

    /**
     * Stop current speech.
     */
    fun stop() {
        tts?.stop()
    }

    /**
     * Shutdown the TTS engine.
     */
    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        isInitialized = false
        Log.i(tag, "TextToSpeech shutdown")
    }
}
