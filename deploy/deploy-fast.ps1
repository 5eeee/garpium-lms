# Быстрый деплой на VPS: build на ПК, на сервере ~1–3 мин.
param(
  [string]$VpsHost = "92.242.61.6",
  [string]$User = "root",
  [string]$AppDir = "/opt/garpium-lms",
  [string]$Archive = "lms-fast.tgz",
  [switch]$SkipPack,
  [int]$MaxAttempts = 12
)

$ErrorActionPreference = "Stop"
$deployDir = $PSScriptRoot
$root = Split-Path -Parent $deployDir
$localArchive = Join-Path $root $Archive
$plinkTarget = "${User}@${VpsHost}"

if (-not $SkipPack) {
  & (Join-Path $deployDir "fast-pack.ps1") -Output $localArchive
} elseif (-not (Test-Path $localArchive)) {
  throw "Archive not found: $localArchive (run without -SkipPack first)"
}

$hk = "SHA256:2KmTJY/psePZrCJz3izXU1YZEBUqVX3eFtIoECg4V84"
$pw = $env:LMS_DEPLOY_PASSWORD
if (-not $pw) {
  Write-Host "Set env LMS_DEPLOY_PASSWORD or edit deploy-fast.ps1"
  $pw = "CjA2OmV9S1a6HLpZ"
}

$pscp = "C:\Program Files\PuTTY\pscp.exe"
$plink = "C:\Program Files\PuTTY\plink.exe"
$remoteArchive = "/tmp/$Archive"
$remote = "cd $AppDir && tar -xzf $remoteArchive && bash deploy/vps-fast-deploy.sh"

function Invoke-DeployStep {
  param([string]$Name, [scriptblock]$Action)
  for ($i = 1; $i -le $MaxAttempts; $i++) {
    Write-Host ">> $Name (attempt $i/$MaxAttempts)..."
    try {
      & $Action
      if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw "exit code $LASTEXITCODE" }
      return
    } catch {
      if ($i -eq $MaxAttempts) { throw "${Name} failed after ${MaxAttempts} attempts: $_" }
      $delay = [Math]::Min(30, 3 * $i)
      Write-Host "   retry in ${delay}s..."
      Start-Sleep -Seconds $delay
    }
  }
}

Invoke-DeployStep "Upload $Archive" {
  & $pscp -batch -hostkey $hk -pw $pw $localArchive "${plinkTarget}:${remoteArchive}"
  if ($LASTEXITCODE -ne 0) { throw "pscp exit $LASTEXITCODE" }
}

$deployOut = ""
Invoke-DeployStep "Fast deploy on server" {
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $deployOut = (& $plink -ssh $plinkTarget -pw $pw -batch -hostkey $hk $remote 2>&1 | ForEach-Object { "$_" }) -join "`n"
  $deployOut = $deployOut.Trim()
  $exit = $LASTEXITCODE
  $ErrorActionPreference = $prevEap
  Write-Host $deployOut
  if ($exit -ne 0) { throw "plink exit $exit" }
  if ($deployOut -notmatch "FAST_DEPLOY_OK") {
    throw "remote deploy did not report FAST_DEPLOY_OK"
  }
}

try {
  $dash = Invoke-WebRequest -Uri "https://lms.garpium.com/login" -UseBasicParsing -TimeoutSec 20
  Write-Host ">> Prod check: login HTTP $($dash.StatusCode)"
} catch {
  Write-Warning "Prod HTTPS check failed: $($_.Exception.Message)"
}

Write-Host "Done: https://lms.garpium.com"
