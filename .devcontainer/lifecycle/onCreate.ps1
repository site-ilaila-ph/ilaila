#!/usr/bin/env pwsh
. "$PSScriptRoot/libstate.ps1";

[string]$dest = "/workspace";
[string]$repoUrl = "https://github.com/site-ilaila-ph/ilaila.git";

Ensure-SetupDir;

if (Test-State -Key "cloned")
{
    Write-Host "Setup already initialized at $dest — skipping clone.";
    exit 0;
}

[string]$tempDir = mktemp -d -p (Split-Path $dest -Parent);

git clone $repoUrl $dest;

[int]$moveExitCode = $LASTEXITCODE;

if ($moveExitCode -ne 0)
{
    throw "Moving cloned repo into $dest failed with exit code $moveExitCode.";
}

sudo chown -R "$(whoami):$(id -gn)" $dest;
[int]$chownExitCode = $LASTEXITCODE;

if ($chownExitCode -ne 0)
{
    throw "chown of $dest failed with exit code $chownExitCode.";
}

Add-State -Key "cloned" -Value $true;