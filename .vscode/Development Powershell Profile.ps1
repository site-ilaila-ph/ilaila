[CmdletBinding()]
param (
    [switch]$Interactive
)

# This is the VSCode PowerShell Profile for development.
# Prints a quick command reference on shell start.

$env:NODE_ENV = "development"
$env:DIRECT_URL = "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:51215/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"

function Show-Manual {
    $cheatsheet = @'
Project Scripts
  pnpm run dev                            Start app & DB concurrently (dev:app + dev:db)
  pnpm run dev:setup                      Strict install & generate types for dev
  pnpm run typegen                        Generate Next.js and Prisma types
  pnpm run ci                             Run full CI flow (setup + typecheck, lint, test)
  pnpm run ci:checks                      Run checks only (typecheck, lint, vitest)
  pnpm run cd                             Run full CD flow (setup + next build)
  pnpm run prepare                        Install husky git hooks

Package Management (pnpm)
  pnpm install                        Install all dependencies
  pnpm install --frozen-lockfile      Strict install (fails if lockfile drifted)
  pnpm add <pkg>                      Install a package (add -D for devDependencies)
  pnpm remove <pkg>                   Uninstall a package
  pnpm run <script>                   Execute a script from package.json
  pnpm exec <tool>                    Run local node_modules/.bin tool
  pnpm why <pkg>                      Print the dependency tree for a package
  pnpm outdated                       List packages with newer versions
  pnpm store prune                    Clean up unreferenced packages to save space

Version Control (Git)
  git switch -c <branch>              Create a new branch and switch to it
  git switch <branch>                 Switch to an existing branch
  git fetch --prune                   Download remote data & clean deleted branches
  git pull --rebase                   Pull changes and apply local commits on top
  git status                          Show modified, staged, and untracked files
  git log --oneline --graph -10       Visual, condensed tree of last 10 commits
  git diff [--staged]                 Show unstaged (or staged) changes
  git show <commit-hash>              Show exact changes from a specific commit
  git restore <file>                  Discard local, unstaged changes
  git restore --staged <file>         Unstage a file but keep local edits
  git commit --amend --no-edit        Merge staged changes into the last commit
  git reset --soft HEAD~1             Undo last commit, keep files staged
  git reset --hard HEAD               DANGER: Wipe all uncommitted changes

Database ORM (Prisma)
  prisma generate                     Regenerate TS Client (no DB connection needed)
  prisma migrate dev                  Create+apply migration, regen client (needs DB)
  prisma migrate reset                DANGER: Drop DB, run migrations & seeds
  prisma db push                      Sync schema to DB without migration files
  prisma db pull                      Update schema.prisma to match current DB
  prisma studio                       Open local web GUI to browse DB
  prisma format                       Auto-format schema.prisma

Environment & Node
  npx <pkg>                           Run a package (downloads if not local)
  node -e "..."                       Evaluate inline JS (e.g., node -e "console.log()")
  node --env-file=.env file.js        Run native Node loading variables from .env

VSCode & PowerShell
  code .                              Open current directory in VSCode
  code <file>                         Open a specific file in VSCode
  notepad $PROFILE                    Open PowerShell profile to edit
  & $PROFILE                          Reload profile into the current session
  Start-Process pwsh -Verb RunAs      Open elevated (Admin) PowerShell window
  $env:VAR="value"                    Set a temporary session-only env var
'@

    Write-Host $cheatsheet
    Write-Host ""
}

if ($Interactive) {
    Write-Host "Welcome to a local development environment. NODE_ENV=$env:NODE_ENV, db at localhost:51214" -ForegroundColor Cyan
    Write-Host "CI/CD lives in GitHub workflow files, not here.`n" -ForegroundColor DarkGray
    Show-Manual
}
