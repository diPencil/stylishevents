@echo off
setlocal
cd /d "%~dp0"

echo Starting Stylish Events backend on http://localhost:5000 ...
start "Stylish Events Backend" /D "%~dp0backend" cmd /k "npm.cmd run start"

echo Starting Stylish Events frontend on http://localhost:3002 ...
start "Stylish Events Frontend" /D "%~dp0frontend" cmd /k "npm.cmd run dev"

echo.
echo Open http://localhost:3002/admin/
echo Keep both opened terminal windows running while testing locally.
pause
endlocal
