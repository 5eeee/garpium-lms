# Упаковка проекта для деплоя на VPS (минимальный архив).
param(
  [string]$Output = "lms-deploy.tgz"
)

$root = Split-Path -Parent $PSScriptRoot
Push-Location $root

$exclude = @(
  "node_modules",
  ".next",
  ".git",
  "deploy/.env.production",
  ".env",
  ".env.local",
  "*.tgz",
  ".cursor"
)

$tarArgs = @("-czf", $Output)
foreach ($item in $exclude) {
  $tarArgs += "--exclude=$item"
}
$tarArgs += "."

& tar @tarArgs
if ($LASTEXITCODE -ne 0) {
  Pop-Location
  exit $LASTEXITCODE
}

$size = (Get-Item $Output).Length / 1MB
Write-Host "Created $Output ($([math]::Round($size, 2)) MB)"
Pop-Location
