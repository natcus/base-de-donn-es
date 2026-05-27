$mavenVersion = "3.9.6"
$mavenFolder = Join-Path $PSScriptRoot "maven"
$mavenZip = Join-Path $PSScriptRoot "maven.zip"
$mavenBin = Join-Path $mavenFolder "apache-maven-$mavenVersion\bin\mvn.cmd"

if (-not (Test-Path $mavenBin)) {
    Write-Host "Downloading Maven..." -ForegroundColor Cyan
    $url = "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $url -OutFile "$mavenZip"
    
    Write-Host "Extracting..." -ForegroundColor Cyan
    Expand-Archive -Path "$mavenZip" -DestinationPath "$mavenFolder" -Force
    Remove-Item "$mavenZip"
}

Write-Host "Launching SGSU Backend..." -ForegroundColor Green
& "$mavenBin" spring-boot:run
