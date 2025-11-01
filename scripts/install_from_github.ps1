<#
install_from_github.ps1 — Windows auto-installer for Obsidian plugin

What it does:
1) Tries to download the latest GitHub Release asset (plugin zip).
2) If not found, downloads the repository ZIP of a branch (default: main).
3) Detects plugin id from manifest.json, then installs to <Vault>\.obsidian\plugins\<id> with backup of the old folder.

Usage (PowerShell):
  # Basic usage (required VaultPath)
  .\scripts\install_from_github.ps1 -VaultPath "E:\Path\To\Your\Vault"

  # Optional: specify repo and branch explicitly
  .\scripts\install_from_github.ps1 -VaultPath "E:\Vault" -Repo "HappyToy010101/obsidian-word-statistics-RU-EN-CN" -Branch "main"

This script needs network access to github.com. It uses only built-in PowerShell commands.
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$VaultPath,
    [string]$Repo = "HappyToy010101/obsidian-word-statistics-RU-EN-CN",
    [string]$Branch = "main"
)

$ErrorActionPreference = 'Stop'

function Write-Step($msg) { Write-Host "[Installer] $msg" -ForegroundColor Cyan }
function Write-Info($msg) { Write-Host "[Installer] $msg" -ForegroundColor Gray }
function Write-Ok($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Warning $msg }
function Write-Fail($msg) { Write-Error $msg }

if (!(Test-Path $VaultPath)) {
    Write-Fail "Vault path not found: $VaultPath"
    exit 1
}

# Prepare temp workspace
$TempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("obsidian-plugin-" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $TempRoot | Out-Null
Write-Info "Temp dir: $TempRoot"

$zipRelease = Join-Path $TempRoot 'plugin-release.zip'
$zipBranch  = Join-Path $TempRoot 'repo.zip'
$unpackDir  = Join-Path $TempRoot 'unzipped'
New-Item -ItemType Directory -Path $unpackDir | Out-Null

# Try latest release first
$releaseApi = "https://api.github.com/repos/$Repo/releases/latest"
$headers = @{ 'User-Agent' = 'obsidian-plugin-installer' }
$assetUrl = $null

Write-Step "Checking latest release for $Repo ..."
try {
    $release = Invoke-RestMethod -Uri $releaseApi -Headers $headers -ErrorAction Stop
    if ($null -ne $release.assets -and $release.assets.Count -gt 0) {
        # Prefer asset named like plugin-*.zip, else any .zip
        $asset = $release.assets | Where-Object { $_.name -match '^plugin-.*\.zip$' } | Select-Object -First 1
        if (-not $asset) {
            $asset = $release.assets | Where-Object { $_.name -like '*.zip' } | Select-Object -First 1
        }
        if ($asset) {
            $assetUrl = $asset.browser_download_url
            Write-Info "Found release asset: $($asset.name)"
        }
    }
} catch {
    Write-Warn "Release API check failed (continuing with branch zip): $($_.Exception.Message)"
}

if ($assetUrl) {
    Write-Step "Downloading release asset..."
    Invoke-WebRequest -Uri $assetUrl -OutFile $zipRelease -Headers $headers
    Write-Ok "Downloaded: $zipRelease"
    Write-Step "Unpacking release zip..."
    Expand-Archive -Path $zipRelease -DestinationPath $unpackDir -Force
} else {
    # Fallback: download repo zip of branch
    $branchZipUrl = "https://codeload.github.com/$Repo/zip/refs/heads/$Branch"
    Write-Step "Downloading repository (branch $Branch)..."
    Invoke-WebRequest -Uri $branchZipUrl -OutFile $zipBranch -Headers $headers
    Write-Ok "Downloaded: $zipBranch"
    Write-Step "Unpacking repository zip..."
    Expand-Archive -Path $zipBranch -DestinationPath $unpackDir -Force
}

# Find plugin root (folder containing manifest.json)
Write-Step "Searching for manifest.json..."
$manifestFiles = Get-ChildItem -Path $unpackDir -Filter 'manifest.json' -Recurse | Select-Object -First 1
if (-not $manifestFiles) {
    Write-Fail "manifest.json not found in downloaded content."
    exit 1
}
$pluginRoot = Split-Path -Parent $manifestFiles.FullName
Write-Ok "Plugin root: $pluginRoot"

# Read manifest to get plugin id
$manifest = Get-Content -Raw -Path $manifestFiles.FullName | ConvertFrom-Json
$pluginId = $manifest.id
if (-not $pluginId) {
    Write-Fail "Cannot read 'id' from manifest.json"
    exit 1
}

# Verify main.js exists
$mainJs = Join-Path $pluginRoot 'main.js'
if (!(Test-Path $mainJs)) {
    Write-Warn "main.js not found in plugin root. The repository might not contain a prebuilt bundle."
    Write-Warn "You may need the developer install (npm install; npm run build)."
}

# Destination dir in vault
$dest = Join-Path $VaultPath ".obsidian\plugins\$pluginId"
Write-Step "Installing to: $dest"

# Backup old
if (Test-Path $dest) {
    $backup = "$dest.bak_$(Get-Date -Format 'yyyyMMddHHmmss')"
    Write-Info "Backing up existing plugin folder to: $backup"
    Rename-Item -Path $dest -NewName $backup -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $dest -Force | Out-Null

# Copy runtime files
$runtimeFiles = @('manifest.json','main.js','styles.css','data.json','README.md','versions.json')
foreach ($f in $runtimeFiles) {
    $src = Join-Path $pluginRoot $f
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dest -Force
        Write-Info "Copied: $f"
    }
}
# dictionaries folder
$dictSrc = Join-Path $pluginRoot 'dictionaries'
if (Test-Path $dictSrc) {
    Copy-Item -Path $dictSrc -Destination $dest -Recurse -Force
    Write-Info "Copied: dictionaries/"
}

Write-Ok "Installed plugin '$pluginId' to your vault."
Write-Host "Now open Obsidian → Settings → Community plugins → enable the plugin if it's disabled." -ForegroundColor Yellow

# Cleanup temp
try { Remove-Item -Path $TempRoot -Recurse -Force } catch {}
