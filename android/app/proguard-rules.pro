# Add project specific ProGuard rules here.
# Keep JavaScript Interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebView JavaScript interface
-keepattributes JavascriptInterface
-keepattributes *Annotation*

-dontwarn com.toddlertyping.**
-keep class com.toddlertyping.** { *; }
