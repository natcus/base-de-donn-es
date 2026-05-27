# PowerShell script to set up Maven, start backend, test API, and launch frontend
# ------------------------------------------------------------
# 1. Add Maven bin folder to PATH (adjust if your Maven location differs)
$MavenBin = "C:\Users\PRO ELECTRONICS\Downloads\apache-maven-3.9.6\bin"
if (-Not (Test-Path $MavenBin)) {
    Write-Host "Maven bin folder not found at $MavenBin" -ForegroundColor Red
    exit 1
}
$env:PATH = $env:PATH + ";$MavenBin"
Write-Host "Maven path added: $MavenBin" -ForegroundColor Cyan

# 2. (Optional) Set JAVA_HOME if not already set
if (-Not $env:JAVA_HOME) {
    $possibleJdks = Get-ChildItem "C:\Program Files\Java" -Directory | Where-Object { $_.Name -like "jdk*" }
    if ($possibleJdks) {
        $env:JAVA_HOME = $possibleJdks[0].FullName
        Write-Host "JAVA_HOME set to $env:JAVA_HOME" -ForegroundColor Cyan
    } else {
        Write-Host "No JDK found in C:\Program Files\Java. Set JAVA_HOME manually if needed." -ForegroundColor Yellow
    }
}

# 3. Verify Maven works
Write-Host "Checking Maven version..." -ForegroundColor Cyan
mvn -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "Maven not found. Ensure the path is correct." -ForegroundColor Red
    exit 1
}

# 4. Start Spring Boot backend (non‑blocking)
$backendDir = "C:\Users\PRO ELECTRONICS\OneDrive\Documents\BDDA\SGSU\sgsu-backend"
Set-Location $backendDir
Write-Host "Starting backend..." -ForegroundColor Green
# Start Maven in a new PowerShell job so the script can continue
$backendJob = Start-Job -ScriptBlock { mvn spring-boot:run } -Name "sgsu-backend"
Start-Sleep -Seconds 10   # give a few seconds for the server to start

# 5. Test the API (optional – you can comment this block if you only need the servers)
Write-Host "Testing backend API..." -ForegroundColor Cyan
$apiResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:8081/api/etudiants" -ContentType "application/json" -Body (
    @{ matricule = "20260099"; nom = "Dupont"; prenom = "Alice"; email = "alice@example.com"; sexe = "Féminin"; filiere = "Informatique"; niveau = 1; type = "Nouveau"; telephone = "0123456789"; adresse = "12 rue X" } | ConvertTo-Json
)
Write-Host "API response:`n$($apiResponse | ConvertTo-Json -Depth 5)" -ForegroundColor Green

# 6. Start the React/Vite frontend (non‑blocking)
$frontendDir = "C:\Users\PRO ELECTRONICS\OneDrive\Documents\BDDA\SGSU\sgsu-frontend"
Set-Location $frontendDir
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
npm install
Write-Host "Launching frontend..." -ForegroundColor Green
# Start Vite in a new PowerShell job
$frontendJob = Start-Job -ScriptBlock { npm run dev } -Name "sgsu-frontend"

Write-Host "All services started. Backend (job: $($backendJob.Name)), Frontend (job: $($frontendJob.Name))." -ForegroundColor Magenta
Write-Host "Use Get-Job | Receive-Job to view their output, and Stop-Job <id> to stop them." -ForegroundColor Yellow
