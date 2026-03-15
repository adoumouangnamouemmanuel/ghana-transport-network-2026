# start-backend.ps1
# Downloads Maven 3.9 if not present, then builds and runs the Spring Boot app.

$MAVEN_VERSION = "3.9.6"
$MAVEN_DIR = "$PSScriptRoot\.mvn-dist"
$MVN_CMD = "$MAVEN_DIR\apache-maven-$MAVEN_VERSION\bin\mvn.cmd"

if (-not (Test-Path $MVN_CMD)) {
    Write-Host "[setup] Downloading Apache Maven $MAVEN_VERSION ..."
    New-Item -ItemType Directory -Force -Path $MAVEN_DIR | Out-Null
    $zipUrl = "https://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.zip"
    $zipPath = "$MAVEN_DIR\maven.zip"
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
    Expand-Archive -Path $zipPath -DestinationPath $MAVEN_DIR -Force
    Remove-Item $zipPath
    Write-Host "[setup] Maven downloaded to $MAVEN_DIR"
}

Write-Host "[build] Building Spring Boot API..."
& $MVN_CMD clean package -DskipTests -f "$PSScriptRoot\pom.xml"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Check the output above."
    exit 1
}

Write-Host "[run] Starting Ghana Transport API on http://localhost:8080 ..."
& $MVN_CMD spring-boot:run -f "$PSScriptRoot\pom.xml"
