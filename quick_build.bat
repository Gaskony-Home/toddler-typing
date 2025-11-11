@echo off
REM Quick Build Script for Toddler Typing
REM This script increments the version and rebuilds the application

echo ================================================
echo TODDLER TYPING - QUICK BUILD
echo ================================================
echo.

echo Step 1: Incrementing version (patch)...
python increment_version.py patch
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Version increment failed
    pause
    exit /b 1
)
echo.

echo Step 2: Building executable...
python build.py
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo.

echo ================================================
echo BUILD COMPLETE!
echo ================================================
echo.
echo The desktop shortcut has been updated to point to the new build.
echo You can now use the desktop shortcut to run the latest version.
echo.
pause
