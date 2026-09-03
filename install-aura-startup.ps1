$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startupFolder "AURA Local Assistant.lnk"
$targetPath = Join-Path $projectRoot "deploy-aura-local.cmd"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.WorkingDirectory = $projectRoot
$shortcut.Description = "Start AURA local assistant on Windows login"
$shortcut.Save()

Write-Host "AURA startup shortcut created at: $shortcutPath"
