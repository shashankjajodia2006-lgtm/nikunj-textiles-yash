@echo off
setlocal
echo ========================================================
echo   Nikunj Textiles (Yash) - Pushing to GitHub
echo   Repository: shashankjajodia2006-lgtm/nikunj-textiles-yash
echo ========================================================
echo.

set GIT_CMD="C:\Users\Shashank\.gemini\antigravity\scratch\mingit\cmd\git.exe"
if not exist %GIT_CMD% set GIT_CMD=git

cd /d "%~dp0"
%GIT_CMD% remote remove origin 2>nul
%GIT_CMD% remote add origin https://github.com/shashankjajodia2006-lgtm/nikunj-textiles-yash.git
%GIT_CMD% branch -M main

echo Pushing all files to GitHub...
%GIT_CMD% push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo SUCCESS! Your code is now live on GitHub!
    echo.
    echo Next Step: Go to https://vercel.com/new and import:
    echo shashankjajodia2006-lgtm/nikunj-textiles-yash
    echo ========================================================
) else (
    echo.
    echo If GitHub requested a sign-in, please complete the prompt above.
)
pause
