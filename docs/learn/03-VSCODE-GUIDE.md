# Visual Studio Code

VS Code is a code editor, not an IDE in the heavyweight sense (no built-in compiler, no project wizard) — what makes it usable for real projects is that it's built directly around the filesystem concepts and terminal you already know, rather than hiding them behind its own abstractions.

---

## 1. VS Code Opens Folders, Not Just Files

This is the single most important habit to build, and the most common thing beginners get wrong: **open the project folder, not individual files.**

If you use **File → Open File...** and pick one file, VS Code treats it as a loose, unrelated file — no project context, no awareness of anything else nearby, most features degraded or unavailable.

If you use **File → Open Folder...** and pick the project's root directory, VS Code treats that folder as a **workspace**: the Explorer sidebar shows the real directory tree rooted there, search operates across the whole project, and every path VS Code shows or resolves is relative to that folder — the exact same relative-path rules from the filesystem guide.

```
File → Open Folder... → select C:\Users\yourname\Projects\login-form
```

The sidebar you now see on the left **is** `C:\Users\yourname\Projects\login-form`, rendered as a tree. It's not a separate VS Code-managed structure — it's the actual filesystem, live. Create, rename, or delete a file in the sidebar and it happens on disk immediately, same as doing it in File Explorer or with `Remove-Item` in PowerShell.

---

## 2. The Integrated Terminal

**View → Terminal**, or `` Ctrl+` `` (backtick). This opens a real PowerShell prompt, embedded in the editor window — not a simulation, not a VS Code-specific shell. It is the same PowerShell from the previous guide, with one important property: **its current directory starts at your open workspace folder.**

This is where the folder-as-workspace model pays off directly. If you opened `C:\Users\yourname\Projects\login-form` as your workspace, the integrated terminal opens already `cd`'d into that exact folder — no manual navigation needed before you start running `git status`, `npm install`, or anything else project-related.

You can open multiple terminal panels (the `+` icon in the terminal panel), useful for running a dev server in one and issuing Git commands in another without them interrupting each other.

---

## 3. `code .` — Launching VS Code From Where You Already Are

Once the VS Code command-line tool is installed (this happens automatically on a normal install, or check **Command Palette → Shell Command: Install 'code' command in PATH** if `code` isn't recognized), you get a shortcut that removes the "open folder" dialog entirely:

```powershell
cd C:\Users\yourname\Projects\login-form
code .
```

`.` is the same "current directory" symbol from the filesystem guide. `code .` tells VS Code: open a window with the current directory as the workspace. If you're already sitting in a project folder in PowerShell — which, per the workflow above, you will be constantly — this is faster than tabbing over to Explorer, navigating to Open Folder, and clicking through a dialog to a location you're already standing in.

This becomes the normal way you start working on something:

```powershell
cd Projects\login-form
code .
```

Two lines, and you're in the editor with the right folder open and the integrated terminal (once you open it) already rooted in the right place.

---

## 4. Reading the Explorer Sidebar Correctly

A few things that trip people up because they don't match File Explorer's conventions:

- **Bracketed/colored filenames** in the sidebar (often blue or green, sometimes with a letter like `M` or `U` next to them) are Git status indicators — modified, untracked, etc. This is VS Code's built-in Git integration surfacing the same information `git status` would give you in the terminal. Don't be alarmed by colored text; it's informational, not an error state.
- **A file open in the editor but not yet saved** shows a filled dot instead of the close-tab `×`. Unsaved changes exist only in the editor's memory — not on disk, and critically, **not visible to Git** until you save.
- **The Explorer sidebar and the integrated terminal can drift out of sync** if you create or delete files entirely through the terminal — VS Code usually catches up automatically, but if the sidebar looks stale, it's reading state, not the source of truth. The filesystem is the source of truth; the sidebar is a view of it.

---

## 5. Extensions

Extensions are what make VS Code project-specific rather than a generic text editor — language support, linters, formatters, debuggers, and Git tooling are almost all delivered this way rather than built in.

Open the Extensions view with `Ctrl+Shift+X` or the icon in the left activity bar (four squares). Search, install, done — installed extensions apply globally to your VS Code install by default, active in every workspace you open, not just the current one.

A few worth knowing about by name, since you'll see them referenced constantly and they're relevant to this stack:

- **GitLens** — extends VS Code's built-in Git support with inline blame annotations, richer history views, and comparison tools.
- **C# Dev Kit** / **C#** (Microsoft) — project system, IntelliSense, and debugging for .NET/C# work.
- **ESLint** / **Prettier** — linting and formatting, if any part of the project touches JavaScript/TypeScript.
- **PowerShell** (Microsoft) — syntax highlighting, IntelliSense, and debugging for `.ps1` scripts, relevant given the previous guide.

Extensions can also be **disabled per-workspace** (right-click → Disable (Workspace)) — useful when an extension is relevant to some projects but noisy or irrelevant in others, without uninstalling it globally.

---

## 6. The `.vscode` Folder — Project-Level Configuration

Just like `.git`, a project can contain a hidden `.vscode` folder at its root. Where `.git` stores repository history, `.vscode` stores **editor configuration specific to that project** — and unlike your personal VS Code settings, these files are meant to be committed to the repo and shared with the whole team, so everyone's editor behaves the same way inside this specific project.

Four files you'll actually encounter:

### `settings.json`
Workspace-level settings that override your personal (user-level) settings, but only while this folder is open. Common uses: enforcing consistent formatting, tab size, or file associations across the team regardless of anyone's personal preferences.

```json
{
  "editor.formatOnSave": true,
  "editor.tabSize": 4,
  "files.trimTrailingWhitespace": true
}
```

### `extensions.json`
A list of **recommended** extensions for this project. It doesn't force-install anything — when someone opens the workspace for the first time, VS Code prompts them to install the recommended set. This is how a team makes sure everyone has GitLens, the right language extension, etc., without a manual checklist.

```json
{
  "recommendations": [
    "eamodio.gitlens",
    "ms-dotnettools.csdevkit"
  ]
}
```

### `launch.json`
Debugger configurations — what VS Code should actually run when you press `F5` or open the Run and Debug panel (`Ctrl+Shift+D`). Each entry defines things like the program/project to launch, arguments, and environment. Without this file, VS Code doesn't know how to start a debug session for your specific project type; it'll prompt you to generate one (often auto-filled correctly if a relevant language extension is installed).

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Console App",
      "type": "coreclr",
      "request": "launch",
      "program": "${workspaceFolder}/bin/Debug/net8.0/App.dll",
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

`${workspaceFolder}` is a built-in variable resolving to the open folder's absolute path — the same "current directory" concept again, just expressed in VS Code's config syntax instead of PowerShell's.

### `tasks.json`
Defines shell commands you can trigger from **Terminal → Run Task...** or the Command Palette, without hand-typing them into the terminal each time. Useful for build steps, test runs, or anything repetitive.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "shell",
      "command": "dotnet build",
      "group": "build"
    }
  ]
}
```

None of these four files are things you're required to hand-write from scratch regularly — they're usually generated once (often by a language extension, via "Run and Debug" prompts) and then committed so the whole team benefits. Know what each one is for so you're not confused when you see them in a repo, and so you know where to look when something like `F5` "isn't configured."

---

## 7. Profiles — Importing a Whole Setup

A **Profile** is a saved bundle of your personal VS Code setup — extensions, settings, keybindings, even UI theme and layout — that you can export, share, and import as a unit.

Access via the gear icon (bottom left) → **Profiles**, or the Command Palette (`Ctrl+Shift+P`) → `Profiles: Create Profile` / `Profiles: Import Profile`. Exporting produces a `.code-profile` file (JSON under the hood).

Unlike `.vscode/`, a profile isn't scoped to one project by default — it's a personal setup you'd normally carry across everything you open. But nothing stops you from checking the exported `.code-profile` file into the repo itself, and for a team this is often the more reliable distribution method than a gist or shared link: it version-controls the setup alongside the code it's meant for, updates the same way any other file would (a PR that changes the profile), and doesn't depend on an external link staying alive. Someone sets it up once, commits it (for example at `tooling/team.code-profile`), and teammates run `Profiles: Import Profile` → **Import from file...** and point at that path instead of assembling extensions and settings by hand.

---

## 8. Self-Check

1. What's the practical difference between opening a single file and opening a folder as a workspace?
2. If your workspace is `C:\Projects\login-form` and you open the integrated terminal, what will `Get-Location` show without you typing anything first?
3. What does `code .` require to be true about your terminal's current directory before you run it?
4. If you delete a file using `Remove-Item` in the integrated terminal instead of the sidebar, does the sidebar eventually reflect that? Why?
5. What's the practical difference between what `.vscode/extensions.json` does and what a `.code-profile` does, given both can be committed to the same repo?
6. If a teammate presses `F5` and gets prompted to "add a configuration," which `.vscode` file is missing?

If these are solid, you're ready for Git — which is where the "current directory," "relative path," and "integrated terminal" concepts you've now built across three guides all get used at once.
