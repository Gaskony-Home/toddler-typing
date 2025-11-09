# PowerShell script to create/update desktop shortcut for Toddler Typing
# This ensures the shortcut always points to the latest build

$WScriptShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Toddler Typing.lnk"

# Get the absolute path to the executable
$ProjectRoot = $PSScriptRoot
$ExePath = Join-Path $ProjectRoot "dist\toddler-typing\toddler-typing.exe"
$WorkingDir = Join-Path $ProjectRoot "dist\toddler-typing"

# Verify executable exists
if (-Not (Test-Path $ExePath)) {
    Write-Host "ERROR: Executable not found at: $ExePath" -ForegroundColor Red
    Write-Host "Please run build.py first to create the executable." -ForegroundColor Yellow
    exit 1
}

# Create shortcut
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $ExePath
$Shortcut.WorkingDirectory = $WorkingDir
$Shortcut.Description = "Toddler Typing - Educational App for Toddlers"
$Shortcut.WindowStyle = 1  # Normal window

# Try to set icon if it exists
$IconPath = Join-Path $ProjectRoot "src\toddler_typing\assets\images\icon.ico"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = $IconPath
}

$Shortcut.Save()

Write-Host "SUCCESS: Desktop shortcut created/updated!" -ForegroundColor Green
Write-Host "Shortcut location: $ShortcutPath" -ForegroundColor Cyan
Write-Host "Points to: $ExePath" -ForegroundColor Cyan
