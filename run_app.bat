@echo off
title YouTube Music Ad-Free Client (Rust Engine)
echo ========================================================
echo   Launching YouTube Music Ad-Free Desktop Client
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Ad-Free InnerTube Backend Server (Port 5050)...
start "YTMusic Backend Engine" cmd /k "python backend\server.py"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Custom Modern Frontend (Port 5173)...
cd frontend
start "YTMusic Frontend UI" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo Opening YouTube Music Pro in your browser...
start http://localhost:5173

echo.
echo Application is running! Keep this window open.
echo Backend: http://127.0.0.1:5050
echo Frontend: http://localhost:5173
echo ========================================================
pause
