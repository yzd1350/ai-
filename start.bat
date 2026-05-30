@echo off
title AI Troubleshoot Server

echo ================================
echo   AI Troubleshoot Assistant
echo ================================
echo.

echo [1/2] Starting backend API...
cd /d "%~dp0server"
start "API Backend" cmd /k "node index.js"

timeout /t 3 /nobreak >nul

echo [2/2] Starting frontend...
cd /d "%~dp0client"
start "Frontend" cmd /k "npx vite --host"

echo.
echo ================================
echo   Servers starting...
echo.
echo   Local:  http://localhost:5173
echo.
echo   Close the two black windows
echo   to stop the servers.
echo ================================
pause
