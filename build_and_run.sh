#!/bin/bash
# ============================================================
#  Ghana Transport Network - Build & Run Script
#  Requires Java 16+ (uses records)
# ============================================================

SRC_DIR="src"
OUT_DIR="out"
MAIN_CLASS="Main"
DATA_FILE="data/ghana_cities_graph_2026.txt"

echo "=== Ghana Transport Network Build Script ==="

# Clean
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Compile
echo "[1/2] Compiling..."
find "$SRC_DIR" -name "*.java" | xargs javac --enable-preview --release 21 -d "$OUT_DIR" 2>&1

if [ $? -ne 0 ]; then
    echo "[ERROR] Compilation failed."
    exit 1
fi

echo "[2/2] Compilation successful. Running..."
echo ""

# Run
java --enable-preview -cp "$OUT_DIR" "$MAIN_CLASS" "$DATA_FILE"
