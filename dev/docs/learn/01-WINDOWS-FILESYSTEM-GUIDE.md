# The Windows File System

Before touching Git, VS Code, or a terminal, you need an accurate mental model of how Windows actually organizes files. Most confusion later — "why can't it find my file," "why did git add the wrong thing" — traces back to a shaky model here, not to the tool you're blaming.

---

## 1. The File System Is a Tree, Not a Desktop

Every file on your computer lives at exactly one location in a hierarchy that starts at a **drive** and branches into **directories** (folders) containing files and more directories. File Explorer's icons and windows are just one visual representation of this tree — the tree itself is the actual, underlying structure, and it exists whether or not you ever open Explorer.

```
C:\
├── Users\
│   └── yourname\
│       ├── Desktop\
│       ├── Documents\
│       ├── Downloads\
│       └── Projects\
│           └── login-form\
│               ├── index.html
│               └── src\
│                   └── app.js
├── Program Files\
└── Windows\
```

"Folder" and "directory" mean the same thing. Windows UI says folder; nearly every technical tool, error message, and piece of documentation says directory. You need to recognize both as the same concept.

---

## 2. Drives

Windows assigns a **drive letter** to each storage volume: `C:` is almost always your main internal drive. A USB stick or external drive might show up as `D:`, `E:`, etc. The drive letter is the root of its own tree — `C:\` and `D:\` are two separate hierarchies, not subfolders of each other.

You'll rarely deal with more than `C:\` in normal project work, but understand that a path starting with a drive letter (`C:\Users\yourname\Projects`) is unambiguous no matter where you currently are — it always means the same location.

---

## 3. Paths: Absolute vs. Relative

A **path** is the address of a file or folder within the tree.

**Absolute path** — starts from the drive root, unambiguous regardless of context:
```
C:\Users\yourname\Projects\login-form\src\app.js
```

**Relative path** — starts from wherever you currently "are" (your current directory, whether that's a terminal's working directory or a File Explorer window). Same file, if you're already standing in `C:\Users\yourname\Projects\login-form`:
```
src\app.js
```

Two relative-path symbols you need memorized, not looked up each time:

- `.` — the current directory
- `..` — the parent directory (one level up)

So from `src\`, the path `..\index.html` means "go up one level, then find `index.html`." You'll write paths like `..\..\assets\logo.png` regularly once you're working across nested project folders.

**Backslash vs. forward slash**: Windows paths natively use `\` (backslash). Most command-line tools that originated on Unix — including Git — accept and often display `/` (forward slash) instead, and Windows itself has gotten more tolerant of `/` over time. Don't be thrown when you see paths written both ways; in practice, on Windows, either works in most modern tools, but backslash is the native convention and forward slash is the "everyone else's tools" convention.

---

## 4. File Extensions Are Not Optional Labels

A file's extension (`.txt`, `.js`, `.docx`) isn't decoration — it's part of the actual filename, and it's what Windows and most programs use to decide how to open the file.

**Critical setting**: Windows hides known file extensions by default. A file you see as `report` might actually be `report.docx` — the `.docx` is just not displayed. This causes two common problems:

1. Renaming what you think is `report` to `report_final` actually produces `report_final.docx` (fine) — but if you *add* an extension manually thinking there wasn't one, you can end up with `report.docx.docx`.
2. Malicious files disguise themselves this way too — `invoice.pdf.exe` displays as `invoice.pdf` with extensions hidden, but it's an executable, not a PDF.

**Turn this off.** In File Explorer: **View → Show → File name extensions** (or, in the ribbon-based older layout, **View tab → check "File name extensions"**). Do this before you start any project work — you need to see real filenames, always.

---

## 5. Hidden Files and Folders

Separately from extensions, Windows lets individual files and folders be flagged **hidden**, and won't show them in Explorer by default. System files use this heavily. So do developer tools: Git stores its entire history in a folder literally named `.git` inside your project — and because it starts with a dot, many tools (and Explorer, once you enable dotfile visibility) treat it as hidden by convention.

To see hidden items: **View → Show → Hidden items** (in File Explorer's ribbon).

You don't need hidden files visible for everyday use, but you do need to know they exist — "I can't find the `.git` folder, it's not there" is almost always a visibility setting, not a missing folder.

---

## 6. Where You Actually Are

Every terminal window, and every File Explorer window, has a **current directory** — the location relative paths are resolved against. This is the single most important concept for the terminal work that comes next: nearly every mistake beginners make with command-line tools is not knowing, or not checking, where they currently are before running a command.

In File Explorer, the address bar at the top of any window shows your current path. Click into it (or press `Ctrl+L`) to see and edit it as text rather than as clickable breadcrumbs.

---

## 7. Changing Where You Are: `cd`

Everything in Section 6 was conceptual — here's the one command that acts on it. Open PowerShell (search "PowerShell" in the Start menu) and you'll land in a prompt showing your current directory, something like:

```
PS C:\Users\yourname>
```

That's the same "current directory" concept from Explorer's address bar, just in text form. `cd` (change directory) moves you somewhere else in the tree:

```powershell
cd Projects              # move into a subfolder of where you are (relative)
cd C:\Users\yourname     # jump straight to an absolute path
cd ..                    # move up one level to the parent
cd ..\..                 # move up two levels
```

Notice these are the exact same path rules from Section 3 — `cd` doesn't introduce new syntax, it just consumes the paths you already know how to write. Type `cd` with no argument and PowerShell returns you to your user profile folder.

This is deliberately the *only* command introduced here. Everything else — listing files, creating folders, copying, deleting — comes in the next guide. But `cd` earns an early introduction because it's not really a "command" in the same sense as the others; it's the live version of the current-directory concept, and having it in your hands makes the rest of this material something you can test interactively instead of just read.

---

## 8. Special Folders Worth Knowing By Name

| Folder | What it is |
|---|---|
| `C:\Users\<you>\` | Your user profile root — most personal folders live under here |
| `C:\Users\<you>\Desktop` | Files shown on your desktop |
| `C:\Users\<you>\Documents` | Default save location for many apps |
| `C:\Users\<you>\Downloads` | Default browser download location |
| `C:\Users\<you>\AppData` | Hidden by default — where installed apps store settings/config, not user documents. You'll encounter this occasionally, rarely need to touch it manually. |
| `C:\Program Files` | Where installed applications live |

You'll also see paths reference `%USERPROFILE%` — this is an **environment variable**, a named shortcut the system substitutes for your actual profile path (`C:\Users\yourname`). You'll meet these properly once we get to the command line, but recognize the `%NAME%` syntax as "a stand-in for a real path" when you see it in documentation.

---

## 9. Self-Check

Before moving on to the command line, you should be able to answer these without opening anything:

1. What's the difference between an absolute and a relative path?
2. If you're standing in `C:\Users\yourname\Projects\login-form\src`, what does `..\index.html` refer to?
3. Why might a file you're looking at in Explorer not show its true extension?
4. What is `.git`, visibility-wise, and why might you not see it in Explorer by default?
5. What does "current directory" mean, and why does it matter for relative paths?
6. If your prompt reads `PS C:\Users\yourname\Projects>` and you run `cd ..`, what does your prompt read afterward?

If any of these are shaky, re-read that section before continuing — everything from here on either depends on your current directory or takes a path as an argument.
