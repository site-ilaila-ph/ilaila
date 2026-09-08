#!/usr/bin/env pwsh
# pwsh+bash (runs on devcontainer)

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

Ensure-SetupDir

if (Test-State -Key "cloned")
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
    Add-State -Key "cloned" -Value $true
}

Set-Location $dest;

if (Test-State -Key "installed")
{
    Write-Host "Install/dev:setup already done — skipping.";
}
else
{
    $installOutput = pnpm install --frozen-lockfile 2>&1 | Out-String;
    [int]$installExitCode = $LASTEXITCODE;

    if ($installExitCode -ne 0)
    {
        if ($installOutput -match "approve-builds|Ignored build scripts")
        {
            Write-Host "Build scripts require approval — running approve-builds...";
            
            pnpm approve-builds;
            [int]$approveExitCode = $LASTEXITCODE;

            if ($approveExitCode -ne 0)
            {
                throw "pnpm approve-builds failed with exit code $approveExitCode.";
            }

            pnpm install --frozen-lockfile;
            [int]$retryInstallExitCode = $LASTEXITCODE;

            if ($retryInstallExitCode -ne 0)
            {
                throw "pnpm install failed after approving build scripts with exit code $retryInstallExitCode.";
            }
        }
        else
        {
            Write-Error $installOutput;
            throw "pnpm install failed with exit code $installExitCode.";
        }
    }

    pnpm run dev:setup;
    [int]$setupExitCode = $LASTEXITCODE;

    if ($setupExitCode -ne 0)
    {
        throw "pnpm run dev:setup failed with exit code $setupExitCode.";
    }

    Add-State -Key "installed" -Value $true;
}

pnpm supabase start;
[int]$supabaseExitCode = $LASTEXITCODE;

if ($supabaseExitCode -ne 0)
{
    throw "pnpm supabase start failed with exit code $supabaseExitCode.";
}