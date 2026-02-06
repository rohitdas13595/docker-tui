# Installation Scripts Guide

This directory contains automated installation scripts for Docker TUI across different platforms.

## 📁 Files

- `install.sh` - Installation script for Linux/macOS
- `install.bat` - Installation script for Windows
- `uninstall.sh` - Uninstallation script for Linux/macOS
- `uninstall.bat` - Uninstallation script for Windows

## 🚀 Quick Start

### Linux / macOS

```bash
# Make script executable (if not already)
chmod +x install.sh

# Run installation
./install.sh

# Later, to uninstall
./uninstall.sh
```

### Windows

```powershell
# Run installation
.\install.bat

# Later, to uninstall
.\uninstall.bat
```

## 📋 What the Scripts Do

### Installation (`install.sh` / `install.bat`)

1. **Detect System**: Automatically detects your OS and CPU architecture
2. **Check Dependencies**: Verifies Bun is installed
3. **Install Packages**: Runs `bun install` to get all dependencies
4. **Build Executable**: Compiles a standalone binary for your platform
5. **Install Binary**: Copies the executable to a system directory:
   - Linux/macOS: `/usr/local/bin`, `~/.local/bin`, or `~/bin`
   - Windows: `%LOCALAPPDATA%\Programs\docker-tui`
6. **Update PATH**: Adds the installation directory to your PATH
7. **Provide Instructions**: Shows next steps if manual PATH update is needed

### Uninstallation (`uninstall.sh` / `uninstall.bat`)

1. **Find Installation**: Searches common installation locations
2. **Remove Binary**: Deletes the docker-tui executable
3. **Clean Up**: Removes installation directory (Windows)
4. **Update PATH**: Attempts to remove from PATH (Windows)

## 🎯 Installation Locations

### Linux/macOS

The script tries these locations in order:

1. `/usr/local/bin/docker-tui` (if writable)
2. `~/.local/bin/docker-tui` (user-local, recommended)
3. `~/bin/docker-tui` (fallback)

### Windows

- `%LOCALAPPDATA%\Programs\docker-tui\docker-tui.exe`
  (typically `C:\Users\<username>\AppData\Local\Programs\docker-tui\`)

## 🔧 Requirements

### All Platforms

- [Bun](https://bun.sh/) v1.0 or higher
- Git (to clone the repository)
- Docker (to run the application)

### Linux/macOS Additional

- Bash shell
- Write permissions to installation directory OR ability to use `sudo`

### Windows Additional

- Command Prompt or PowerShell
- Administrator rights may be needed for PATH modification

## 🐛 Troubleshooting

### "Bun is not installed"

Install Bun first:

- Linux/macOS: `curl -fsSL https://bun.sh/install | bash`
- Windows: Download from https://bun.sh/

### "Permission denied" (Linux/macOS)

Try with sudo:

```bash
sudo ./install.sh
```

Or install to user directory:

```bash
# The script will automatically use ~/.local/bin if /usr/local/bin is not writable
./install.sh
```

### "docker-tui: command not found" after installation

**Linux/macOS:**

1. Check if the directory is in your PATH:

   ```bash
   echo $PATH | grep -o "/usr/local/bin\|$HOME/.local/bin\|$HOME/bin"
   ```

2. If not, add to your shell config:

   ```bash
   # For bash
   echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc

   # For zsh
   echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

**Windows:**

1. Close and reopen your terminal (PATH changes require a new session)
2. If still not working, check Environment Variables:
   - Press `Win + X` → System → Advanced system settings
   - Environment Variables → User variables → Path
   - Verify `%LOCALAPPDATA%\Programs\docker-tui` is listed

### Build fails

1. Ensure you have the latest Bun version: `bun upgrade`
2. Clear dependencies and reinstall: `rm -rf node_modules && bun install`
3. Check if you have enough disk space

### Docker socket permission denied (Linux)

Add your user to the docker group:

```bash
sudo usermod -aG docker $USER
# Log out and back in for changes to take effect
```

Or run with sudo:

```bash
sudo docker-tui
```

## 📝 Manual Installation

If the automated scripts don't work, you can install manually:

```bash
# 1. Install dependencies
bun install

# 2. Build for your platform
# Linux
bun build --compile --target=bun-linux-x64 ./src/index.tsx --outfile docker-tui

# macOS (Apple Silicon)
bun build --compile --target=bun-darwin-arm64 ./src/index.tsx --outfile docker-tui

# Windows
bun build --compile --target=bun-windows-x64 ./src/index.tsx --outfile docker-tui.exe

# 3. Move to a directory in your PATH
# Linux/macOS
sudo mv docker-tui /usr/local/bin/

# Windows (run as Administrator in PowerShell)
Move-Item docker-tui.exe "$env:LOCALAPPDATA\Programs\docker-tui\"
```

## 🆘 Getting Help

If you encounter issues:

1. Check the [README.md](README.md) for general documentation
2. Open an issue on [GitHub](https://github.com/rohitkd13595/docker-tui/issues)
3. Include:
   - Your OS and version
   - Bun version (`bun --version`)
   - Error messages
   - Steps to reproduce
