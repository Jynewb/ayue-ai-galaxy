@echo off
chcp 65001 >nul
echo ========================================
echo    OpenClaw 一键安装 for Windows
echo ========================================
echo.
echo 正在启动安装脚本...
powershell -ExecutionPolicy Bypass -File "%~dp0openclaw-install-windows.ps1"
pause
