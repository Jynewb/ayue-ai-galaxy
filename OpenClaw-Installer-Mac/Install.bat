@echo off
chcp 65001 >nul
echo ========================================
echo    OpenClaw Auto Installer
echo ========================================
echo.
echo Starting installation...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0openclaw-install-windows.ps1"

pause
