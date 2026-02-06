@echo off
REM Docker TUI Installation Script for Windows
REM This script builds and installs docker-tui to your system

echo ================================
echo Docker TUI Installation Script
echo ================================
echo.

REM Check if bun is installed
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Bun is not installed!
    echo Install Bun first: https://bun.sh/
    pause
    exit /b 1
)

echo [OK] Bun found
bun --version
echo.

REM Install dependencies
echo Installing dependencies...
call bun install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

REM Build the executable
echo.
echo Building executable for Windows...
call bun build --compile --target=bun-windows-x64 ./src/index.tsx --outfile bin/docker-tui.exe
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

if not exist "bin\docker-tui.exe" (
    echo [ERROR] Build failed - executable not found!
    pause
    exit /b 1
)

echo [OK] Build successful!
echo.

REM Determine installation directory
set "INSTALL_DIR=%LOCALAPPDATA%\Programs\docker-tui"

REM Create installation directory
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Copy executable
echo Installing to %INSTALL_DIR%...
copy /Y "bin\docker-tui.exe" "%INSTALL_DIR%\docker-tui.exe" >nul
if %errorlevel% neq 0 (
    echo [ERROR] Failed to copy executable
    pause
    exit /b 1
)

echo [OK] Installed successfully!
echo.

REM Check if directory is in PATH
echo %PATH% | find /i "%INSTALL_DIR%" >nul
if %errorlevel% neq 0 (
    echo [WARNING] %INSTALL_DIR% is not in your PATH
    echo.
    echo Adding to PATH...
    
    REM Add to user PATH
    for /f "skip=2 tokens=3*" %%a in ('reg query HKCU\Environment /v PATH 2^>nul') do set "CURRENT_PATH=%%b"
    
    if defined CURRENT_PATH (
        setx PATH "%CURRENT_PATH%;%INSTALL_DIR%" >nul
    ) else (
        setx PATH "%INSTALL_DIR%" >nul
    )
    
    if %errorlevel% equ 0 (
        echo [OK] Added to PATH successfully!
        echo.
        echo IMPORTANT: Close and reopen your terminal for PATH changes to take effect
    ) else (
        echo [ERROR] Failed to add to PATH automatically
        echo.
        echo Please add the following directory to your PATH manually:
        echo   %INSTALL_DIR%
        echo.
        echo Instructions:
        echo   1. Press Win + X and select "System"
        echo   2. Click "Advanced system settings"
        echo   3. Click "Environment Variables"
        echo   4. Under "User variables", select "Path" and click "Edit"
        echo   5. Click "New" and add: %INSTALL_DIR%
        echo   6. Click "OK" on all dialogs
    )
) else (
    echo [OK] %INSTALL_DIR% is already in your PATH
)

echo.
echo ================================
echo Installation complete!
echo ================================
echo.
echo Run 'docker-tui' to start the application
echo.
echo Note: Make sure Docker Desktop is running
echo.
pause
