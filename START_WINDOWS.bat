@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "Lion Guard" http://127.0.0.1:8080/
  py -3 -m http.server 8080 --bind 127.0.0.1
  goto :end
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "Lion Guard" http://127.0.0.1:8080/
  python -m http.server 8080 --bind 127.0.0.1
  goto :end
)
echo Python 3 is required for the local server fallback.
echo You can first try opening index.html directly in Chrome or Edge.
echo See README_RU.md for details.
pause
:end
