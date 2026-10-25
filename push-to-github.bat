@echo off
setlocal
echo ========================================================
echo   Nikunj Textiles (Yash) - Push to GitHub for Vercel
echo ========================================================
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/your-username/nikunj-textiles-yash.git): "
if "%REPO_URL%"=="" (
    echo Error: No URL provided.
    pause
    exit /b
)

set GIT_CMD="C:\Users\Shashank\.gemini\antigravity\scratch\mingit\cmd\git.exe"
if not exist %GIT_CMD% set GIT_CMD=git

%GIT_CMD% remote remove origin 2>nul
%GIT_CMD% remote add origin %REPO_URL%
%GIT_CMD% branch -M main
echo.
echo Pushing to GitHub...
%GIT_CMD% push -u origin main
echo.
echo ========================================================
echo Done! Now go to https://vercel.com/new to import and deploy!
echo ========================================================
pause
