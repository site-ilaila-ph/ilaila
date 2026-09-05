[CmdletBinding()]
param (
    [switch]$Interactive = $false
)

# This is the VSCode PowerShell Profile for development.
# Prints a quick command reference on shell start.

$env:NODE_ENV = "development"
$env:DEBUG = "1"
$env:DIRECT_URL = "postgres://postgres:00000000@localhost:5432/ilaila_db?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"
$env:DATABASE_URL = "postgres://postgres:00000000@localhost:5432/ilaila_db?pgbouncer=true&sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"