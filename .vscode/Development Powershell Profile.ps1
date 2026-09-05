[CmdletBinding()]
param (
    [switch]$Interactive = $false
)

# This is the VSCode PowerShell Profile for development.
# Prints a quick command reference on shell start.

$env:NODE_ENV = "development"
$env:DEBUG = "1"
$env:DIRECT_URL = "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:51215/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"