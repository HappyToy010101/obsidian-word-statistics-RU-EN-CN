<#
PowerShell helper: build_and_package.ps1
- Runs `npm run build`
- Collects runtime plugin files into `dist/` and creates a zip `dist/plugin-<id>.zip`
- Optionally installs the built plugin into a given vault path's `.obsidian/plugins/<id>` folder

Usage:
  # Create zip only
  .\scripts\build_and_package.ps1

  # Create zip and install to a vault (replace with your vault root path)
  .\scripts\build_and_package.ps1 -VaultPath "E:\Path\To\Your\Vault"

Notes:
- Requires PowerShell 5+ (Compress-Archive is used).
- The script looks for `manifest.json` in the repo root to read the plugin id.
- Files included: manifest.json, main.js, styles.css, data.json, README.md, versions.json and the `dictionaries/` folder when present.
#>
param(
    [string]$VaultPath = ""
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $scriptDir

Write-Host "[build_and_package] Working directory: $scriptDir"

# Run build
Write-Host "[build_and_package] Running 'npm run build'..."
$buildExit = & npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm run build failed with exit code $LASTEXITCODE"
    Pop-Location
    exit $LASTEXITCODE
}
Write-Host "[build_and_package] Build finished."

# Read manifest.json
$manifestPath = Join-Path $scriptDir 'manifest.json'
if (!(Test-Path $manifestPath)) {
    Write-Error "manifest.json not found in $scriptDir"
    Pop-Location
    exit 1
}
$manifest = Get-Content -Raw -Path $manifestPath | ConvertFrom-Json
$pluginId = $manifest.id
if (-not $pluginId) {
    Write-Error "Cannot read plugin id from manifest.json"
    Pop-Location
    exit 1
}

# Prepare temporary folder for packaging
$tmp = Join-Path $scriptDir 'dist_tmp'
if (Test-Path $tmp) { Remove-Item -Path $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp | Out-Null

# Files to include (only minimal runtime files)
$toInclude = @('manifest.json','main.js','styles.css')
foreach ($f in $toInclude) {
    $src = Join-Path $scriptDir $f
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $tmp -Force
        Write-Host "[build_and_package] Included: $f"
    }
}
# Do NOT include dictionaries in the package; dictionaries are fetched on-demand per language and cached locally.

# Create dist and zip
$dist = Join-Path $scriptDir 'dist'
if (Test-Path $dist) { Remove-Item -Path $dist -Recurse -Force }
New-Item -ItemType Directory -Path $dist | Out-Null
$zipName = "plugin-$pluginId.zip"
$zipPath = Join-Path $dist $zipName
if (Test-Path $zipPath) { Remove-Item -Path $zipPath -Force }

Write-Host "[build_and_package] Creating package: $zipPath"
Compress-Archive -Path (Join-Path $tmp '*') -DestinationPath $zipPath

Write-Host "[build_and_package] Package created: $zipPath"

if ($VaultPath -ne "") {
    # Install into vault .obsidian/plugins/<id>
    $dest = Join-Path $VaultPath ".obsidian\plugins\$pluginId"
    Write-Host "[build_and_package] Installing to: $dest"

    if (Test-Path $dest) {
        $backup = "$dest.bak_$(Get-Date -Format 'yyyyMMddHHmmss')"
        Write-Host "[build_and_package] Backing up existing plugin folder to: $backup"
        Rename-Item -Path $dest -NewName $backup -ErrorAction SilentlyContinue
    }

    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    Copy-Item -Path (Join-Path $tmp '*') -Destination $dest -Recurse -Force
    Write-Host "[build_and_package] Installed to: $dest"
}

# Cleanup temporary packaging folder
if (Test-Path $tmp) { Remove-Item -Path $tmp -Recurse -Force }

Pop-Location
Write-Host "[build_and_package] Done."
