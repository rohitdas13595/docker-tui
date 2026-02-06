#!/bin/bash

# Docker TUI Installation Script for Linux/macOS
# This script builds and installs docker-tui to your system

set -e

echo "🐳 Docker TUI Installation Script"
echo "=================================="
echo ""

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

case "${OS}" in
    Linux*)     PLATFORM="linux";;
    Darwin*)    PLATFORM="darwin";;
    *)          echo "❌ Unsupported OS: ${OS}"; exit 1;;
esac

case "${ARCH}" in
    x86_64)     ARCH_TYPE="x64";;
    arm64|aarch64) ARCH_TYPE="arm64";;
    *)          echo "❌ Unsupported architecture: ${ARCH}"; exit 1;;
esac

echo "📋 Detected: ${PLATFORM}-${ARCH_TYPE}"
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed!"
    echo "📥 Install Bun first: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun found: $(bun --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Build the executable
echo "🔨 Building executable for ${PLATFORM}-${ARCH_TYPE}..."
if [ "${PLATFORM}" = "darwin" ]; then
    bun build --compile --target=bun-darwin-${ARCH_TYPE} ./src/index.tsx --outfile bin/docker-tui
else
    bun build --compile --target=bun-linux-${ARCH_TYPE} ./src/index.tsx --outfile bin/docker-tui
fi

if [ ! -f "bin/docker-tui" ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Determine installation directory
if [ -w "/usr/local/bin" ]; then
    INSTALL_DIR="/usr/local/bin"
elif [ -w "$HOME/.local/bin" ]; then
    INSTALL_DIR="$HOME/.local/bin"
    mkdir -p "$INSTALL_DIR"
else
    INSTALL_DIR="$HOME/bin"
    mkdir -p "$INSTALL_DIR"
fi

# Install the executable
echo "📥 Installing to ${INSTALL_DIR}..."
cp bin/docker-tui "${INSTALL_DIR}/docker-tui"
chmod +x "${INSTALL_DIR}/docker-tui"

echo "✅ Installed successfully!"
echo ""

# Check if directory is in PATH
if [[ ":$PATH:" != *":${INSTALL_DIR}:"* ]]; then
    echo "⚠️  ${INSTALL_DIR} is not in your PATH"
    echo ""
    echo "Add the following line to your shell config file:"
    
    # Detect shell
    SHELL_NAME=$(basename "$SHELL")
    case "$SHELL_NAME" in
        bash)
            CONFIG_FILE="$HOME/.bashrc"
            ;;
        zsh)
            CONFIG_FILE="$HOME/.zshrc"
            ;;
        fish)
            CONFIG_FILE="$HOME/.config/fish/config.fish"
            echo "  set -gx PATH ${INSTALL_DIR} \$PATH"
            ;;
        *)
            CONFIG_FILE="$HOME/.profile"
            ;;
    esac
    
    if [ "$SHELL_NAME" != "fish" ]; then
        echo "  export PATH=\"${INSTALL_DIR}:\$PATH\""
        echo ""
        echo "Or run this command to add it automatically:"
        echo "  echo 'export PATH=\"${INSTALL_DIR}:\$PATH\"' >> ${CONFIG_FILE}"
        echo "  source ${CONFIG_FILE}"
    fi
else
    echo "✅ ${INSTALL_DIR} is already in your PATH"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Run 'docker-tui' to start the application"
echo ""
echo "Note: Make sure Docker is running and you have permission to access the Docker socket"
echo "      You may need to add your user to the 'docker' group or use sudo"
