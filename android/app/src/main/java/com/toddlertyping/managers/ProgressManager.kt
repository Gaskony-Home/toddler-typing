package com.toddlertyping.managers

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Manages user progress and gamification (stars, levels, etc.)
 */
class ProgressManager(context: Context) {

    private val tag = "ProgressManager"
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "toddler_typing_progress",
        Context.MODE_PRIVATE
    )
    private val gson = Gson()

    private var totalStars: Int
        get() = prefs.getInt("total_stars", 0)
        set(value) = prefs.edit().putInt("total_stars", value).apply()

    private var currentLevel: Int
        get() = prefs.getInt("current_level", 1)
        set(value) = prefs.edit().putInt("current_level", value).apply()

    private var activityStars: MutableMap<String, Int>
        get() {
            val json = prefs.getString("activity_stars", null)
            return if (json != null) {
                val type = object : TypeToken<MutableMap<String, Int>>() {}.type
                gson.fromJson(json, type)
            } else {
                mutableMapOf()
            }
        }
        set(value) {
            val json = gson.toJson(value)
            prefs.edit().putString("activity_stars", json).apply()
        }

    /**
     * Award a star for completing an activity.
     *
     * @param activity The activity name
     * @return Pair of (starAwarded: Boolean, levelUp: Boolean)
     */
    fun awardStar(activity: String): Pair<Boolean, Boolean> {
        // Increment total stars
        totalStars++

        // Increment activity-specific stars
        val stars = activityStars
        stars[activity] = (stars[activity] ?: 0) + 1
        activityStars = stars

        // Check for level up (every 10 stars)
        val oldLevel = currentLevel
        val newLevel = (totalStars / 10) + 1
        val levelUp = newLevel > oldLevel

        if (levelUp) {
            currentLevel = newLevel
            Log.i(tag, "Level up! Now at level $newLevel")
        }

        Log.i(tag, "Star awarded for $activity. Total: $totalStars")

        return Pair(true, levelUp)
    }

    /**
     * Award multiple stars.
     *
     * @param activity The activity name
     * @param count Number of stars to award
     */
    fun awardStars(activity: String, count: Int) {
        totalStars += count

        val stars = activityStars
        stars[activity] = (stars[activity] ?: 0) + count
        activityStars = stars

        Log.i(tag, "Awarded $count stars for $activity. Total: $totalStars")
    }

    /**
     * Get total stars earned.
     */
    fun getAllStars(): Int = totalStars

    /**
     * Get current level.
     */
    fun getLevel(): Int = currentLevel

    /**
     * Get progress data for all activities.
     */
    fun getProgress(): Map<String, Any> {
        return mapOf(
            "total_stars" to totalStars,
            "current_level" to currentLevel,
            "activity_stars" to activityStars
        )
    }

    /**
     * Reset all progress (for testing or user request).
     */
    fun resetProgress() {
        prefs.edit().clear().apply()
        Log.i(tag, "Progress reset")
    }
}
