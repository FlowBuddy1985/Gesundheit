@echo off
chcp 65001 >nul
title Gesundheit-App & TÜV Theorie-Trainer
cd /d "%~dp0"

echo ========================================================================
echo   Starte Gesundheit-App & TÜV Theorie-Trainer Server...
echo ========================================================================
echo.

node server.js

if errorlevel 1 (
    echo.
    echo FEHLER beim Starten von Node.js!
    echo Bitte stellen Sie sicher, dass Node.js installiert ist.
    pause
)

