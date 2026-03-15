#!/bin/bash
# ============================================================
#  Ghana Transport Network - Start Backend API
#  Downloads Maven 3.9 if not present, then builds and runs
#  the Spring Boot REST API.
#  Requires: Java 17+, bash, curl or wget
# ============================================================

MAVEN_VERSION="3.9.6"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAVEN_DIR="$SCRIPT_DIR/.mvn-dist"
MVN_CMD="$MAVEN_DIR/apache-maven-$MAVEN_VERSION/bin/mvn"

if [ ! -f "$MVN_CMD" ]; then
    echo "[setup] Downloading Apache Maven $MAVEN_VERSION ..."
    mkdir -p "$MAVEN_DIR"
    TAR_URL="https://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.tar.gz"
    TAR_PATH="$MAVEN_DIR/maven.tar.gz"

    if command -v curl &> /dev/null; then
        curl -L "$TAR_URL" -o "$TAR_PATH"
    elif command -v wget &> /dev/null; then
        wget -q "$TAR_URL" -O "$TAR_PATH"
    else
        echo "[ERROR] Neither curl nor wget is available. Please install Maven manually and add it to your PATH."
        exit 1
    fi

    tar -xzf "$TAR_PATH" -C "$MAVEN_DIR"
    rm "$TAR_PATH"
    chmod +x "$MVN_CMD"
    echo "[setup] Maven extracted to $MAVEN_DIR"
fi

echo "[build] Building Spring Boot API..."
"$MVN_CMD" clean package -DskipTests -f "$SCRIPT_DIR/pom.xml"

if [ $? -ne 0 ]; then
    echo "[ERROR] Build failed. Check the output above."
    exit 1
fi

echo "[run] Starting Ghana Transport API on http://localhost:8081 ..."
"$MVN_CMD" spring-boot:run -f "$SCRIPT_DIR/pom.xml"
