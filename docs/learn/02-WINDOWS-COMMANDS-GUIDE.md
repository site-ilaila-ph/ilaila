# PowerShell Basics

PowerShell is Windows' modern command-line shell and scripting language. It replaces the older `cmd.exe` (Command Prompt) for most development work — you'll open it the same way (search "PowerShell" in the Start menu), and it's where every command in this series, starting with `cd`, actually runs.

The one thing worth knowing up front: PowerShell is not just a text-based command line — every command's output is a structured **object**, not raw text, and commands are called **cmdlets**, written `Verb-Noun` (`Get-ChildItem`, `Set-Location`, `Copy-Item`). This matters more later when you get to scripting; for now, just recognize the naming pattern when you see it, since it's how you'll guess a command's name before you've memorized it.

---

## 1. Navigation and Inspection

You already have `cd`. Here's the rest of the basic set:

```powershell
Get-Location          # print current directory (alias: pwd)
Get-ChildItem          # list contents of current directory (alias: ls, or dir)
Get-ChildItem -Force   # list contents INCLUDING hidden items like .git
```

Most cmdlets have short aliases carried over from Unix shells or `cmd.exe` so muscle memory transfers. `ls`, `dir`, and `Get-ChildItem` all do the same thing here — the alias just calls the real cmdlet underneath.

---

## 2. Creating and Removing

```powershell
New-Item -ItemType Directory -Name "Projects"    # create a folder (alias: mkdir)
New-Item -ItemType File -Name "notes.txt"         # create an empty file
Remove-Item notes.txt                              # delete a file (alias: rm, del)
Remove-Item Projects -Recurse                      # delete a folder and everything in it
```

`Remove-Item -Recurse` deletes without a confirmation prompt and without a recycle bin safety net for most item types. Be certain of your current directory (`Get-Location`) before running it.

---

## 3. Copying and Moving

```powershell
Copy-Item app.js app.js.bak       # copy a file
Copy-Item -Recurse src backup     # copy a folder and its contents
Move-Item app.js src\app.js        # move (or rename, if the destination is a new filename in the same folder)
```

There's no separate "rename" command — `Move-Item` to a new name in the same location renames it.

---

## 4. Viewing File Contents

```powershell
Get-Content app.js       # print a file's contents to the screen (alias: cat, type)
```

Useful for quickly checking a small file without opening an editor. Not what you want for large files or binary files — it'll dump raw content or garbage output.

---

## 5. Clearing the Screen

```powershell
Clear-Host      # alias: cls, clear
```

Purely cosmetic — doesn't affect anything, just clears visual clutter.

---

## 6. Tab Completion — Use It Constantly

Start typing a file, folder, or cmdlet name and press `Tab`. PowerShell will complete it, and repeated `Tab` presses cycle through matches. This isn't a shortcut for the lazy — it's how you avoid typos in paths, which is one of the most common sources of "file not found" errors. If you're typing a full path by hand instead of tab-completing it, you're doing it the hard way.

---

## 7. Execution Policy

By default, PowerShell **blocks running scripts** (`.ps1` files) — even ones you wrote yourself. This isn't a bug; it's a safety default meant to stop malicious scripts from silently running (e.g., a `.ps1` attached to an email). Running a single command interactively at the prompt is unaffected — this restriction is specifically about executing `.ps1` script files.

Check your current setting:

```powershell
Get-ExecutionPolicy
```

If it's `Restricted` (common default), any script you try to run — including ones tied to some dev tools and Git hooks — will simply refuse to execute. For development work, set it to `Bypass` for your own user account:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

`-Scope CurrentUser` limits this change to your own account rather than the whole machine, which is the reasonable default for a personal dev machine. You may need to run PowerShell as Administrator the first time this command is applied, depending on your machine's configuration. Once set, you won't need to touch this again.

---

## 8. .NET-Style PowerShell (For Those Coming From C#)

PowerShell is built directly on .NET, which means every value you touch — even the output of a basic cmdlet — is a real .NET object underneath. That gives you two ways to write the same script: PowerShell's native pipeline idiom (`Get-ChildItem | Where-Object { ... } | Sort-Object ...`), or direct .NET calls (`[System.IO.Directory]::GetFiles(...)`, `foreach`, `if`).

**Pick one and stay in it. Do not mix them.** A script that alternates between `Where-Object { $_.Length -gt 1MB }` and `[System.IO.File]::ReadAllText(...)` in the same block is harder to read than either style alone, because the reader has to context-switch between "pipeline of objects flowing through filters" and "explicit method calls with local variables" line to line. Since your background is C# console applications, the .NET style will be the more natural one to standardize on — write PowerShell scripts the way you'd write a C# console app: explicit types, `foreach`/`if`, direct method calls. Skip the pipeline cmdlets (`Where-Object`, `Sort-Object`, `ForEach-Object`, `ls`/`dir` aliases) in scripts entirely, even though they're shorter — save them for one-off interactive commands at the prompt, not for anything you're writing to be read again.

A script written consistently in .NET style:

```powershell
[string]$path = "C:\Projects\login-form"
$files = [System.IO.Directory]::GetFiles($path)

$largeFiles = New-Object System.Collections.Generic.List[System.IO.FileInfo]

foreach ($filePath in $files) {
    $file = New-Object System.IO.FileInfo($filePath)
    if ($file.Length -gt 1MB) {
        $largeFiles.Add($file)
    }
}

foreach ($file in $largeFiles) {
    Write-Host "$($file.Name): $([math]::Round($file.Length / 1MB, 2)) MB"
}
```

Compare that to the same result the pipeline way — shorter, but a different idiom entirely, and not one to reach for mid-script once you've committed to .NET style:

```powershell
Get-ChildItem $path | Where-Object { $_.Length -gt 1MB } | Sort-Object Length -Descending
```

The `[ClassName]::Method()` syntax is a static method call on a .NET type, same semantics as C#:

```powershell
[System.IO.File]::ReadAllText("app.js")
[System.DateTime]::Now
[System.Math]::Sqrt(16)
```

Variables are dynamically typed by default (`$x = 5`), but explicit typing is closer to what you're used to and worth doing consistently rather than only sometimes:

```powershell
[int]$count = 5
[string]$name = "app"
```

Functions, loops, conditionals, and error handling all read close to C#:

```powershell
function Get-FileSizeMB {
    param([string]$Path)
    $file = New-Object System.IO.FileInfo($Path)
    return [math]::Round($file.Length / 1MB, 2)
}

[double]$size = Get-FileSizeMB -Path "app.js"

try {
    [string]$content = [System.IO.File]::ReadAllText("config.json")
} catch [System.IO.FileNotFoundException] {
    Write-Host "File not found: $($_.Exception.Message)"
}
```

**Compatibility note**: this level of .NET integration applies to modern PowerShell (PowerShell 7+, cross-platform, installed separately) and largely also to Windows PowerShell 5.1 (built into Windows 10/11). Older Windows versions may ship an older, more limited PowerShell with less complete .NET access — if a script from a tutorial doesn't behave as described, check `$PSVersionTable.PSVersion` and consider installing current PowerShell rather than assuming the code is wrong.

This section is optional depth — the basic commands in Sections 1–6 are what you'll use day to day for project navigation and Git work. Come back to this once you're scripting something repetitive, not before.
