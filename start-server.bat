@echo off
title Nikunj Textiles (Brand Yash) - Local Server
echo ========================================================
echo   Nikunj Textiles (Brand Yash) Local Server
echo   Serving at: http://localhost:8080/
echo ========================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
pause
