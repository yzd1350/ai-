@echo off
chcp 65001 >nul
title 机务AI排故助手

echo ================================
echo   机务AI排故助手 - 启动中...
echo ================================
echo.

:: 启动后端 (3001)
echo [1/2] 启动后端 API (端口 3001)...
start "排故后端" cmd /c "cd /d %~dp0server && node index.js"
timeout /t 3 /nobreak >nul

:: 启动前端 (5173)
echo [2/2] 启动前端页面 (端口 5173)...
start "排故前端" cmd /c "cd /d %~dp0client && npx vite --host"
timeout /t 3 /nobreak >nul

echo.
echo ================================
echo   启动完成！
echo ================================
echo.
echo   本机访问:  http://localhost:5173
echo.

:: 获取并显示本机 IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set ip=%%a
    set ip=!ip: =!
    if not "!ip!"=="127.0.0.1" echo   手机/其他设备: http://!ip!:5173
)

echo.
echo ================================
echo   关闭方法：关掉两个命令行窗口
echo ================================
pause
