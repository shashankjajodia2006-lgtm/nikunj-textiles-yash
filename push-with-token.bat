@echo off
setlocal
echo ========================================================
echo   Push to GitHub with Personal Access Token
echo   Repository: shashankjajodia2006-lgtm/nikunj-textiles-yash
echo ========================================================
echo.
set /p TOKEN="Paste your GitHub Personal Access Token (starts with ghp_): "
if "%TOKEN%"=="" (
    echo Error: No token entered.
    pause
    exit /b
)

echo.
echo Pushing to GitHub...
"C:\Users\Shashank\.gemini\antigravity\scratch\mingit\cmd\git.exe" push https://%TOKEN%@github.com/shashankjajodia2006-lgtm/nikunj-textiles-yash.git main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo SUCCESS! Repository is pushed.
    echo Now refresh Vercel and click Deploy!
    echo ========================================================
) else (
    echo.
    echo Push failed. Please check that the token has 'repo' permissions.
)
pause
