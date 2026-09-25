@echo off
title Hourglass
cd /d "%~dp0"

echo.
echo  Hourglass is starting...
echo  A browser tab will open in a few seconds.
echo.
echo  Keep this window open while you use the app.
echo  Close this window when you are done — that stops Hourglass.
echo.

REM Free leftover ports from a previous run that did not shut down cleanly
for %%P in (5000 5173 5174 5175) do (
  for /f "tokens=5" %%A in ('netstat -ano ^| findstr ":%%P .*LISTENING"') do (
    taskkill /F /PID %%A >nul 2>&1
  )
)

start "" cmd /c "timeout /t 6 /nobreak >nul && start http://localhost:5173/"
call npm run dev

echo.
echo  Hourglass stopped. Press any key to close this window.
pause >nul
