@echo off
REM Force Rebuild Script - Handles locked dist folder
REM This script aggressively cleans and rebuilds the application

echo ================================================
echo TODDLER TYPING - FORCE REBUILD
echo ================================================
echo.
echo This will forcefully clean and rebuild the application.
echo.

REM Kill any running Python processes
echo Step 1: Killing all Python processes...
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM pythonw.exe /T >nul 2>&1
timeout /t 2 >nul

REM Kill the exe if running
echo Step 2: Killing toddler-typing.exe if running...
taskkill /F /IM toddler-typing.exe /T >nul 2>&1
timeout /t 2 >nul

REM Restart Windows Explorer to release file handles
echo Step 3: Restarting Windows Explorer...
taskkill /F /IM explorer.exe >nul 2>&1
timeout /t 2 >nul
start explorer.exe
timeout /t 3 >nul

REM Try to delete dist folder
echo Step 4: Removing old dist folder...
rmdir /S /Q dist >nul 2>&1
rmdir /S /Q build >nul 2>&1
timeout /t 1 >nul

REM Check if dist was deleted
if exist dist (
    echo WARNING: Could not delete dist folder completely
    echo This is OK - PyInstaller will try to work around it
    echo.
) else (
    echo SUCCESS: Old build files removed
    echo.
)

REM Run the build
echo Step 5: Building new executable...
echo.
python build.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo BUILD COMPLETE!
    echo ================================================
    echo.
    echo The desktop shortcut has been updated.
    echo You can now use it to run the latest version.
    echo.
) else (
    echo.
    echo ================================================
    echo BUILD FAILED
    echo ================================================
    echo.
    echo If the dist folder is still locked, please:
    echo 1. Close all File Explorer windows
    echo 2. Restart your computer
    echo 3. Run this script again
    echo.
)

pause
