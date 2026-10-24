@echo off
echo Cleaning up build artifacts and dependencies...

rd /s /q frontend\node_modules
echo [done] frontend\node_modules removed

rd /s /q backend\target
echo [done] backend\target removed

echo.
echo Project is ready to zip.
