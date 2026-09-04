param(
    [switch]$Interactive,
    [string]$EnvFile = ".env.production.local",
    [switch]$Force
)

# This is the VSCode PowerShell Profile for production.
# If you find yourself wanting to go to this profile,
# you probably should just contact me instead (@ssword-dev<ssword.dev@gmail.com>)

Write-Host "PRODUCTION SHELL"

if (-not $Force) {
    $confirmation = Read-Host "Load production secrets? (yes/no)"
    if ($confirmation -ne "yes") {
        Write-Host "Aborted."
        return
    }
}

if (-not (Test-Path $EnvFile)) {
    Write-Host "Env file '$EnvFile' not found. Aborting."
    return
}

$loadedCount = 0
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        return
    }
    if ($line -match '^([^=]+)=(.*)$') {
        $name  = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($value.StartsWith('"') -and $value.EndsWith('"')) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
        $loadedCount++
    }
}

Write-Host "Loaded $loadedCount variable(s) from $EnvFile."

function global:prompt {
    "[PRODUCTION] PS $($executionContext.SessionState.Path.CurrentLocation)> "
}