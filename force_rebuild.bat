@echo off
echo Forcing rebuild of Toddler Typing...
echo.

echo Step 1: Stopping Explorer to release file locks...
taskkill /F /IM explorer.exe >nul 2>&1

echo Step 2: Waiting for file locks to release...
timeout /t 3 /nobreak >nul

echo Step 3: Removing dist directory...
rmdir /S /Q dist 2>nul
rmdir /S /Q build 2>nul
del /Q *.spec 2>nul

echo Step 4: Restarting Explorer...
start explorer.exe

echo Step 5: Waiting for Explorer to start...
timeout /t 2 /nobreak >nul

echo Step 6: Running build...
"C:\Users\Gaskin\AppData\Local\Programs\Python\Python312\python.exe" build.py

echo.
echo Build complete! Press any key to exit...
pause >nul
