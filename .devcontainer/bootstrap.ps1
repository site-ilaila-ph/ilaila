#!/usr/bin/env pwsh
# pwsh+bash

[string]$dest = "/workspaces/project";
[string]$repoUrl = "https://github.com/site-ilaila-ph/ilaila.git";
[string]$stateFile = "$dest/.setup/state.json";

function Ensure-SetupDir
{
    [string]$setupDir = Split-Path $stateFile -Parent;

    if (-not (Test-Path $setupDir -PathType Container))
    {
        New-Item -ItemType Directory -Path $setupDir -Force | Out-Null;
    }
}

function Get-StateData
{
    if (-not (Test-Path $stateFile))
    {
        return @{};
    }

    return Get-Content $stateFile -Raw | ConvertFrom-Json -AsHashtable;
}

function Save-StateData
{
    param(
        [Parameter(Mandatory)][hashtable]$data
    )

    Ensure-SetupDir;
    $data | ConvertTo-Json -Depth 10 | Set-Content $stateFile;
}

function Add-State
{
    param(
        [Parameter(Mandatory)][string]$key,
        [Parameter(Mandatory)]$value
    )

    [hashtable]$state = Get-StateData;

    if ($state.ContainsKey($key))
    {
        Write-Warning "Key '$key' already exists with value '$($state[$key])' — use Update-State to overwrite.";
        return;
    }

    $state[$key] = $value;
    Save-StateData $state;
}

function Read-State
{
    param(
        [Parameter(Mandatory)][string]$key
    )

    [hashtable]$state = Get-StateData;

    if (-not $state.ContainsKey($key))
    {
        return $null;
    }

    return $state[$key];
}

function Update-State
{
    param(
        [Parameter(Mandatory)][string]$key,
        [Parameter(Mandatory)]$value
    )

    [hashtable]$state = Get-StateData;

    if (-not $state.ContainsKey($key))
    {
        Write-Warning "Key '$key' does not exist — use Add-State to create it.";
        return;
    }

    $state[$key] = $value;
    Save-StateData $state;
}

function Delete-State
{
    param(
        [Parameter(Mandatory)][string]$key
    )

    [hashtable]$state = Get-StateData;

    if (-not $state.ContainsKey($key))
    {
        Write-Warning "Key '$key' does not exist — nothing to delete.";
        return;
    }

    $state.Remove($key);
    Save-StateData $state;
}

function Test-State
{
    param(
        [Parameter(Mandatory)][string]$key
    )

    [hashtable]$state = Get-StateData;
    return ($state.ContainsKey($key)) -and ($state[$key] -eq $true);
}

# --- setup flow ---

[string]$setupDir = Split-Path $stateFile -Parent;

if (Test-Path $setupDir -PathType Container)
{
    Write-Host "Setup already initialized at $dest — skipping clone.";
}
else
{
    [string]$tempDir = mktemp -d;

    git clone $repoUrl $tempDir;
    [int]$cloneExitCode = $LASTEXITCODE;

    if ($cloneExitCode -ne 0)
    {
        throw "Git clone failed with exit code $cloneExitCode.";
    }

    mv "$tempDir/." $dest;
    chown -R "$(whoami):$(id -gn)" $dest;
    Ensure-SetupDir;
}

Set-Location $dest;

if (Test-State -Key "installed")
{
    Write-Host "Install/dev:setup already done — skipping.";
}
else
{
    pnpm install --frozen-lockfile;
    [int]$installExitCode = $LASTEXITCODE;

    if ($installExitCode -ne 0)
    {
        Write-Host "Retrying with approve-builds...";
        pnpm approve-builds;
        pnpm install --frozen-lockfile;
    }

    pnpm run dev:setup;
    Add-State -Key "installed" -Value $true;
}

pnpm supabase start;