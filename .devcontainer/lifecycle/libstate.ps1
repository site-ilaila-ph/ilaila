#!/usr/bin/env pwsh
[string]$script:stateFile = "/setup/state.json";

function Ensure-SetupDir
{
    [string]$setupDir = Split-Path $script:stateFile -Parent;

    if (-not (Test-Path $setupDir -PathType Container))
    {
        New-Item -ItemType Directory -Path $setupDir -Force | Out-Null;
    }
}

function Get-StateData
{
    if (-not (Test-Path $script:stateFile))
    {
        return @{};
    }

    return Get-Content $script:stateFile -Raw | ConvertFrom-Json -AsHashtable;
}

function Save-StateData
{
    param(
        [Parameter(Mandatory)][hashtable]$data
    )

    Ensure-SetupDir;
    $data | ConvertTo-Json -Depth 10 | Set-Content $script:stateFile;
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

function Test-State
{
    param(
        [Parameter(Mandatory)][string]$key
    )

    [hashtable]$state = Get-StateData;
    return ($state.ContainsKey($key)) -and ($state[$key] -eq $true);
}