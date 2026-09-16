@echo off
title Install KAUSIC to Android Device
echo ========================================================
echo   Installing KAUSIC (2050 Cyber-Robotics Audio) to Phone
echo ========================================================
echo.

cd /d "%~dp0"

echo Checking ADB device connection...
adb devices

echo.
echo If your device says "unauthorized", check your phone screen and tap "Always allow".
echo.
echo Installing KAUSIC-v50-debug.apk...
adb install -r KAUSIC-v50-debug.apk

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! KAUSIC has been installed on your device!
    echo ========================================================
    echo Launching KAUSIC on your phone...
    adb shell am start -n com.kausic.music/com.kausic.music.MainActivity
) else (
    echo.
    echo ========================================================
    echo   Installation failed or device not detected via ADB.
    echo   Ensure USB Debugging is ON in Settings -^> Developer Options.
    echo   You can also copy "KAUSIC-v50-debug.apk" directly to your phone.
    echo ========================================================
)

echo.
pause
