@echo off
REM Docker TUI Uninstallation Script for Windows

echo ================================
echo Docker TUI Uninstallation Script
echo ================================
echo.

set "INSTALL_DIR=%LOCALAPPDATA%\Programs\docker-tui"

if not exist "%INSTALL_DIR%\docker-tui.exe" (
    echo [ERROR] Installation not found at %INSTALL_DIR%
    pause
    exit /b 1
)

echo Removing %INSTALL_DIR%...
del /F /Q "%INSTALL_DIR%\docker-tui.exe"
rmdir "%INSTALL_DIR%" 2>nul

echo [OK] Removed executable
echo.

REM Try to remove from PATH
echo Removing from PATH...
for /f "skip=2 tokens=3*" %%a in ('reg query HKCU\Environment /v PATH 2^>nul') do set "CURRENT_PATH=%%b"

if defined CURRENT_PATH (
    set "NEW_PATH=%CURRENT_PATH%"
    call set "NEW_PATH=%%NEW_PATH:%INSTALL_DIR%;=%%"
    call set "NEW_PATH=%%NEW_PATH:;%INSTALL_DIR%=%%"
    call set "NEW_PATH=%%NEW_PATH:%INSTALL_DIR%=%%"
    
    setx PATH "%NEW_PATH%" >nul
    if %errorlevel% equ 0 (
        echo [OK] Removed from PATH
    ) else (
        echo [WARNING] Could not remove from PATH automatically
        echo Please remove manually: %INSTALL_DIR%
    )
)

echo.
echo ================================
echo Uninstallation complete!
echo ================================
echo.
echo Note: Close and reopen your terminal for PATH changes to take effect
echo.
pause
