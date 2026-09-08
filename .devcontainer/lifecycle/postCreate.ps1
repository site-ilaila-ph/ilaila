#!/usr/bin/env pwsh
. "$PSScriptRoot/libstate.ps1";

[string]$dest = "/workspaces/project";
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