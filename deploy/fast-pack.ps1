# Сборка Next.js локально + архив release/ для быстрого деплоя.
param(
  [string]$Output = "lms-fast.tgz"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root

Write-Host ">> prisma generate (native + linux)..."
& npx prisma generate
if ($LASTEXITCODE -ne 0) {
  Pop-Location
  exit $LASTEXITCODE
}

Write-Host ">> npm run build (local)..."
& npm run build
if ($LASTEXITCODE -ne 0) {
  Pop-Location
  exit $LASTEXITCODE
}

$standalone = Join-Path $root ".next\standalone"
if (-not (Test-Path (Join-Path $standalone "server.js"))) {
  Write-Error "Missing .next/standalone/server.js - enable output standalone in next.config"
}

$release = Join-Path $root "release"
if (Test-Path $release) { Remove-Item -Recurse -Force $release }
New-Item -ItemType Directory -Path $release | Out-Null

Write-Host ">> Assembling release/..."
Copy-Item -Path (Join-Path $standalone "*") -Destination $release -Recurse -Force

$staticDest = Join-Path $release ".next\static"
New-Item -ItemType Directory -Path $staticDest -Force | Out-Null
Copy-Item -Path (Join-Path $root ".next\static\*") -Destination $staticDest -Recurse -Force

$publicDest = Join-Path $release "public"
if (Test-Path $publicDest) { Remove-Item -Recurse -Force $publicDest }
Copy-Item -Path (Join-Path $root "public") -Destination $publicDest -Recurse -Force

$prismaDest = Join-Path $release "prisma"
if (Test-Path $prismaDest) { Remove-Item -Recurse -Force $prismaDest }
Copy-Item -Path (Join-Path $root "prisma") -Destination $prismaDest -Recurse -Force

if (Test-Path $Output) { Remove-Item -Force $Output }

Write-Host ">> Creating $Output..."
& tar -czf $Output release deploy/Dockerfile.runtime deploy/docker-compose.fast.yml deploy/vps-fast-deploy.sh deploy/apply-migrations.sh
if ($LASTEXITCODE -ne 0) {
  Pop-Location
  exit $LASTEXITCODE
}

$sizeMb = [math]::Round(((Get-Item $Output).Length / 1MB), 2)
Write-Host ("OK: " + $Output + " sizeMb=" + $sizeMb)
Pop-Location
