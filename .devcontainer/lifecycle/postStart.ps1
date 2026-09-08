#!/usr/bin/env pwsh
[string]$dest = "/workspaces/project";
Set-Location $dest;

pnpm supabase start;
[int]$supabaseExitCode = $LASTEXITCODE;

if ($supabaseExitCode -ne 0)
{
    throw "pnpm supabase start failed with exit code $supabaseExitCode.";
}