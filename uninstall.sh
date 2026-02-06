#!/bin/bash

# Docker TUI Uninstallation Script for Linux/macOS

set -e

echo "🗑️  Docker TUI Uninstallation Script"
echo "===================================="
echo ""

# Check common installation locations
INSTALL_LOCATIONS=(
    "/usr/local/bin/docker-tui"
    "$HOME/.local/bin/docker-tui"
    "$HOME/bin/docker-tui"
)

FOUND=0

for location in "${INSTALL_LOCATIONS[@]}"; do
    if [ -f "$location" ]; then
        echo "Found installation at: $location"
        rm -f "$location"
        echo "✅ Removed $location"
        FOUND=1
    fi
done

if [ $FOUND -eq 0 ]; then
    echo "❌ No installation found in common locations"
    echo ""
    echo "Checked locations:"
    for location in "${INSTALL_LOCATIONS[@]}"; do
        echo "  - $location"
    done
    exit 1
fi

echo ""
echo "✅ Uninstallation complete!"
echo ""
echo "Note: PATH modifications in your shell config were not removed."
echo "      You may want to remove them manually if you added any."
