@echo off
chcp 65001 >nul
title 机务AI排故助手 - 启动

echo ================================
echo   机务AI排故助手
echo ================================
echo.

:: 启动后端
echo [1/2] 启动后端...
start "API后端" cmd /k "cd /d %~dp0server && node index.js"

:: 等后端准备好
echo 等待后端启动...
timeout /t 4 /nobreak >nul

:: 启动前端
echo [2/2] 启动前端...
start "前端页面" cmd /k "cd /d %~dp0client && npx vite --host"

echo.
echo ================================
echo   启动完成！
echo.
echo   本机访问: http://localhost:5173
echo.

:: 获取本机 IP
for /f "tokens=2 delims=: " %%a in ('ipconfig ^| findstr "IPv4"') do (
  if not "%%a"=="127.0.0.1" (
    echo   局域网访问: http://%%a:5173
  )
)

echo.
echo   (关掉两个黑窗口 = 关闭服务)
pause
