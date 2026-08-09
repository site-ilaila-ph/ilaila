# Git & GitHub

Git is a distributed version control system. GitHub is a hosting platform for Git repositories with collaboration tooling (pull requests, issues, code review, CI) layered on top. They are not the same thing — you could use Git for years without ever touching GitHub, and plenty of teams do.

This guide assumes the previous three in this series: you should be comfortable navigating the filesystem, running PowerShell commands, and working inside VS Code with its integrated terminal. Nothing here is simplified past what you'll actually encounter.

---

## 1. What Git Actually Is

Most explanations of Git tell you it "tracks changes to files." That's imprecise, and the imprecision causes confusion later. Git doesn't store diffs as its primary unit — it stores **snapshots**.

Every commit is a full snapshot of every tracked file at that moment. If a file hasn't changed since the last commit, Git doesn't duplicate it — it stores a reference to the identical content it already has. This is why commits are cheap and why Git can compute history operations quickly.

### The object model

A Git repository (the `.git` folder) is a content-addressable database of four object types:

- **Blob** — the contents of a single file. No filename, no metadata, just bytes.
- **Tree** — a directory listing: maps names to blobs or other trees.
- **Commit** — a pointer to a tree (the snapshot), a pointer to its parent commit(s), author, committer, timestamp, and message.
- **Tag** — a named, permanent pointer to a specific commit, usually for releases.

Every object is identified by the SHA-1 hash of its content. Identical content always hashes identically (automatic deduplication); any change to content changes the hash (tampering/corruption is detectable). A commit hash like `a1b2c3d` is not an arbitrary ID — it's a fingerprint of that commit's exact content and history.

### Branches are pointers, not containers

A branch is **not** a copy of your code in its own space. It is a small text file containing a single commit hash — nothing more. `main` just means "the tip of main is commit `a1b2c3d`." Committing creates a new commit object pointing at the previous one, then moves the branch pointer forward.

`HEAD` is a pointer to whichever branch (or specific commit) you currently have checked out. Switching branches is fast because Git isn't copying files — it's changing what HEAD points to and updating your working directory to match that commit's tree.

Once this clicks, branching, merging, rebasing, and detached-HEAD states stop being mysterious — they're all operations on pointers and the commit graph they describe.

---

## 2. The Three Trees

Every Git command moves content between three areas:

1. **Working Directory** — the files on disk you edit. Git compares these against the last commit to determine what's "modified."
2. **Staging Area (Index)** — a snapshot-in-progress, backed by a real file (`.git/index`). You can stage part of a file's changes and leave the rest unstaged.
3. **Repository (`.git`, HEAD)** — committed history. Once committed, a snapshot is addressable by hash permanently, until deliberately rewritten.

```
Working Directory --git add--> Staging Area --git commit--> Repository
       ^                                                        |
       |__________________git checkout / restore________________|
```

The staging area exists so a commit represents one coherent, deliberate change — not "everything that happened to be different when I felt like committing."

---

## 3. Initial Setup

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

`user.name`/`user.email` are not login credentials — they're metadata embedded into every commit (`git log` shows them). `--global` writes to `~/.gitconfig` and applies machine-wide unless a repo-local config overrides it (drop `--global` while inside a repo to set that repo only).

```powershell
git config --list                  # everything currently set, and where it comes from
git config --global core.editor "code --wait"   # use VS Code for commit messages, merge conflicts, interactive rebase
```

`--wait` matters: without it, `git` will move on before you've finished editing, because `code` normally returns immediately.

---

## 4. Getting a Repository

```powershell
git init            # turn the current directory into a new, empty repo
git clone <url>       # copy an existing remote repo, full history included
git clone <url> <folder-name>   # clone into a specific folder name instead of the default
```

`git clone` does three things: pulls the complete commit history, checks out the default branch into your working directory, and configures a remote named `origin` pointing back at the source automatically.

---

## 5. The Core Local Workflow

### Status — your primary reference tool

```powershell
git status
```

Shows current branch, staged changes, unstaged changes, and untracked files. Run it before and after nearly everything — this is not a beginner crutch, it's how you keep ground truth instead of assuming.

### Staging

```powershell
git add <file>          # stage one file
git add <dir>            # stage everything under a directory
git add .                 # stage everything from the current directory down
git add -p                # interactively review and stage individual hunks
git add -A                 # stage all changes repo-wide, including deletions, regardless of current directory
```

`git add -p` matters once you've made two unrelated changes in the same working session and want them as separate commits — it lets you stage (and therefore commit) one logical change at a time instead of everything at once.

### Removing / renaming, tracked by Git

```powershell
git rm <file>              # delete a file AND stage the deletion
git rm --cached <file>       # stop tracking a file, but leave it on disk
git mv <old> <new>            # rename/move a tracked file, staged automatically
```

Deleting a file with `Remove-Item` (or File Explorer) still requires `git add`/`git rm` afterward to stage the deletion — Git doesn't infer intent from a missing file until you tell it.

### Inspecting changes

```powershell
git diff                 # unstaged changes vs the last commit
git diff --staged          # staged changes vs the last commit
git diff <commit1> <commit2>   # differences between any two commits
git diff main..feature/login-form   # differences between two branches
```

`git diff` alone shows nothing for changes you've already staged — a constant early trip-up.

### Committing

```powershell
git commit -m "message"
git commit                     # opens your configured editor for a longer message
git commit -am "message"       # stage all TRACKED modified files and commit in one step (does NOT add new untracked files)
git commit --amend             # replace the most recent commit's content and/or message
```

`commit --amend` rewrites the most recent commit — it does not create a second commit, it replaces the last one, producing a new hash. Never amend a commit that other people have already pulled; you'll create a divergent history that causes real pain for anyone who already based work on the original.

### History

```powershell
git log
git log --oneline
git log --oneline --graph --all      # compact, with branch structure visualized across all branches
git log --stat                        # include per-commit file change summary
git log -p                            # include full diffs per commit
git log --author="name"
git log --since="2 weeks ago"
git log -- <path>                     # history touching a specific file or folder only
```

`q` exits the pager.

### Inspecting individual commits and lines

```powershell
git show <commit>          # full details and diff of a single commit
git blame <file>            # who last modified each line, and in which commit
```

`git blame` is a real diagnostic tool, not a tool for assigning fault despite the name — use it to find the commit (and its message) that introduced a specific line, then `git show` that commit for context.

---

## 6. Branching and Merging

```powershell
git branch                     # list local branches, * marks current
git branch -a                   # include remote-tracking branches too
git branch <name>                # create a branch, don't switch to it
git branch -d <name>              # delete a branch (safe: refuses if unmerged)
git branch -D <name>               # delete a branch (force, discards unmerged commits)
git checkout <name>                 # switch to an existing branch
git checkout -b <name>               # create and switch in one step
git switch <name>                     # modern equivalent of checkout for branches
git switch -c <name>                   # modern equivalent of checkout -b
```

(`switch`/`restore` split `checkout`'s historically overloaded behavior — branches vs. files. Either works; you'll see `checkout` in most existing docs and older codebases.)

### Merging

```powershell
git checkout main
git merge feature/login-form
```

Two possible outcomes:

- **Fast-forward** — if `main` hasn't moved since the branch diverged, the pointer just slides forward. No new commit.
- **Merge commit** — if both branches have diverged, Git creates a commit with two parents combining both histories.

```powershell
git merge --no-ff feature/login-form   # force a merge commit even when a fast-forward is possible, preserving branch history explicitly
```

### Merge conflicts

Happens when both branches changed the same lines differently. Git stops and marks the file:

```
<<<<<<< HEAD
your version
=======
their version
>>>>>>> feature/login-form
```

Edit to the correct resolution, delete the markers, then:

```powershell
git add <file>
git commit
```

`git status` mid-conflict lists exactly which files remain — read it rather than guessing.

### Rebase

```powershell
git checkout feature/login-form
git rebase main
```

Rebasing replays your branch's commits one by one on top of a different base commit — instead of merging two histories together, it rewrites your branch as if it had started from the new base. This produces a linear history with no merge commit, which many teams prefer for readability.

**The rule that matters**: rebasing rewrites commit hashes — every replayed commit is a genuinely new commit object, even though the content looks the same. **Never rebase a branch that others have already pulled and built on.** If you do, their history and yours diverge in a way that's painful to reconcile. Rebase freely on your own unshared branches; use `merge` (or coordinate explicitly) once something's shared.

```powershell
git rebase -i main       # interactive rebase: reorder, squash, reword, or drop commits before they're shared
```

Interactive rebase opens your editor with a list of commits and instructions (`pick`, `squash`, `reword`, `drop`, etc.) — this is how you clean up a messy local commit history into something coherent before pushing.

If a rebase conflicts, Git pauses the same way a merge does. Resolve, then:

```powershell
git add <file>
git rebase --continue
git rebase --abort       # bail out entirely, return to pre-rebase state
```

### Cherry-pick

```powershell
git cherry-pick <commit>
```

Applies a single specific commit from anywhere in the repo's history onto your current branch, as a new commit. Useful for pulling one fix from another branch without merging everything else on it.

---

## 7. Stashing

```powershell
git stash                    # shelve uncommitted changes (staged + unstaged), restore a clean working directory
git stash list                 # see everything currently stashed
git stash pop                   # reapply the most recent stash and remove it from the stash list
git stash apply                  # reapply the most recent stash but keep it in the list
git stash drop                    # discard a stash without applying it
git stash push -m "message"        # stash with a descriptive label
```

Use this when you need to switch branches or pull but aren't ready to commit what you're mid-way through. It is not a substitute for committing — stashes are easy to forget about and aren't part of your real history.

---

## 8. Tags

```powershell
git tag                              # list tags
git tag v1.0.0                        # lightweight tag on current commit
git tag -a v1.0.0 -m "Release 1.0.0"    # annotated tag: includes message, tagger, date — preferred for releases
git push origin v1.0.0                   # tags are NOT pushed automatically — push explicitly
git push origin --tags                    # push all local tags at once
```

Use annotated tags (`-a`) for anything meant to mark an actual release; lightweight tags are fine for quick, personal reference points.

---

## 9. Remotes and Synchronizing with GitHub

A remote is a named URL pointing at another copy of the repository.

```powershell
git remote -v                       # list configured remotes
git remote add origin <url>          # add a remote named "origin"
git remote remove origin              # remove it
```

### Fetch vs. pull

```powershell
git fetch origin                # download new commits/branches, but don't touch your working directory or current branch
git pull origin main              # fetch + merge (or rebase, depending on config) into your current branch, in one step
git pull --rebase origin main      # fetch, then rebase your local commits on top instead of merging
```

`fetch` is non-destructive, safe anytime — it only updates your local knowledge of the remote (visible as `origin/main`, a remote-tracking branch). `pull` actually integrates those changes into your current branch and can trigger a merge, a rebase, or a conflict depending on config and flags. When unsure, `fetch` first and inspect (`git log origin/main`) before pulling.

### Push

```powershell
git push -u origin feature/login-form   # first push of a branch: sets up tracking
git push                                 # subsequent pushes, once tracking is set
git push --force-with-lease               # force-push, but refuses if the remote has commits you haven't seen
git push --force                           # force-push unconditionally — overwrites remote history, can destroy others' work
```

`-u` (`--set-upstream`) links your local branch to that remote branch so future `push`/`pull` calls don't need the branch name repeated. Never `--force` push to a shared branch like `main` without team agreement — it rewrites remote history other people may already be building on. `--force-with-lease` is the safer default when you genuinely need to force-push your own branch after a rebase or amend, since it aborts if someone else pushed in the meantime.

---

## 10. Undoing Things

Git gives you several distinct undo tools, and picking the wrong one loses work. Know the difference precisely.

```powershell
git restore <file>              # discard uncommitted changes in the working directory
git restore --staged <file>     # unstage a file, keep the edits
```

```powershell
git reset --soft <commit>    # move branch pointer, keep changes staged
git reset --mixed <commit>   # move branch pointer, keep changes but unstaged (default mode)
git reset --hard <commit>    # move branch pointer AND discard all changes — destructive
```

`reset` rewrites where your branch pointer sits. Safe on commits that exist only locally. Dangerous on anything already pushed and pulled by someone else — you're erasing history they may have built on.

```powershell
git revert <commit>
```

Creates a **new** commit that undoes a previous commit's changes, without rewriting history. The correct way to undo something already shared — it adds to history instead of erasing it.

**Rule of thumb**: `reset` for local, unshared mistakes. `revert` for anything already pushed. Same principle applies to `--amend` and `rebase`: fine before sharing, risky after.

### The safety net: reflog

```powershell
git reflog
```

Git keeps a log of every place HEAD has pointed, including commits made "unreachable" by a hard reset or a botched rebase. If you think you've lost work, `git reflog` almost always still has the commit hash — `git checkout <hash>` or `git reset --hard <hash>` gets you back. This is usually recoverable for weeks; it's not a permanent undo history, but it's far more forgiving than people assume the first time they panic.

---

## 11. Cleaning Up

```powershell
git clean -n       # dry run: show what WOULD be deleted
git clean -f         # actually delete untracked files
git clean -fd         # also delete untracked directories
```

Removes files Git isn't tracking at all — build artifacts, stray temp files. Always `-n` first; there's no undo for `clean` the way `reflog` covers resets.

---

## 12. Ignoring Files

A `.gitignore` file (plain text, one pattern per line) tells Git which untracked files to never show as "untracked" in `git status` or accidentally stage with `git add .` — build output, dependency folders, secrets, editor cruft.

```
# .gitignore
bin/
obj/
node_modules/
*.log
.env
```

`.gitignore` only affects files Git isn't already tracking. If a file was committed before being added to `.gitignore`, it stays tracked — remove it explicitly with `git rm --cached <file>` first.

---

## 13. Aliases

```powershell
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.lg "log --oneline --graph --all"
```

Now `git st`, `git co`, `git lg` work as shortcuts. Purely a convenience layer over commands you already know — worth setting up once you're typing the same long commands repeatedly, not something to reach for before you actually know what the full command does.

---

## 14. GitHub Collaboration

### Pull Requests

A pull request (PR) proposes merging one branch's commits into another, with review in between. Opening a PR doesn't merge anything by itself — it's a request and a diff view for discussion.

Push a branch to GitHub, and the repo page offers to open a PR against the base branch (commonly `main`). The PR shows every commit and changed line, supports inline comments, and tracks approval status. When merged, GitHub performs the equivalent of a merge (or, depending on repo settings, a squash or rebase) on the server.

### Forks vs. branches

With write access, you work on branches directly inside the repo. Without it (contributing to a project you don't own), you **fork** — create your own full copy under your account — push branches there, and open a PR from your fork back to the original.

### Issues

Track bugs, tasks, and discussion independent of code. Commits and PRs can reference issues (`Fixes #42`) to link them and auto-close on merge.

### Branch protection

Repository owners can configure rules on GitHub — require PR review before merge, require passing status checks, block force-pushes to `main` — enforced server-side, not something any local Git command can override. If a push is rejected for a reason you don't recognize, this is often why.

---

## 15. Command Reference

| Command | Purpose |
|---|---|
| `git status` | Show branch, staged/unstaged/untracked files |
| `git diff` / `git diff --staged` | Show unstaged / staged changes |
| `git add <file>` / `git add .` / `git add -p` | Stage changes (whole file / everything / interactively) |
| `git rm` / `git mv` | Remove / rename a tracked file, staged automatically |
| `git commit -m "msg"` / `--amend` | Record staged changes / replace the last commit |
| `git log --oneline --graph --all` | View commit history |
| `git show <commit>` | Full detail of one commit |
| `git blame <file>` | Who last changed each line |
| `git branch` / `-d` / `-D` | List / delete (safe / force) branches |
| `git checkout -b <name>` / `git switch -c <name>` | Create and switch to a new branch |
| `git merge <branch>` / `--no-ff` | Merge a branch in (optionally forcing a merge commit) |
| `git rebase <branch>` / `-i` | Replay commits on a new base / interactively edit them |
| `git cherry-pick <commit>` | Apply one specific commit onto the current branch |
| `git stash` / `pop` / `list` | Shelve and restore uncommitted work |
| `git tag -a <name> -m "msg"` | Create an annotated tag |
| `git fetch origin` | Download remote history without merging |
| `git pull origin <branch>` / `--rebase` | Fetch and integrate in one step |
| `git push -u origin <branch>` / `--force-with-lease` | Push and set tracking / safely force-push |
| `git restore <file>` / `--staged` | Discard working-directory changes / unstage |
| `git reset --soft/--mixed/--hard <commit>` | Move branch pointer, with varying effects on staging/working dir |
| `git revert <commit>` | Safely undo a shared commit via a new commit |
| `git reflog` | Recover "lost" commits after a bad reset or rebase |
| `git clean -fd` | Delete untracked files/directories |

---

## 16. Team Conventions

Everything above is Git and GitHub as they exist generally. The following is specific to how *this project* uses them — these are team policies, not Git features.

- **No direct commits to `main`.** All work happens on a branch and enters `main` only via a reviewed pull request.
- **Branch naming**: `feature/<short-description>` for new functionality, `fix/<short-description>` for bug fixes (e.g., `feature/login-form`, `fix/header-alignment`).
- **Before branching**, sync local `main` first:
  ```powershell
  git checkout main
  git pull origin main
  git checkout -b feature/login-form
  ```
- **Commit messages** follow a `type: description` format (e.g., `feat: implement login logic`, `fix: correct header padding`).
- **Pull requests** must have the PR template filled out — what changed, why, and any affected dependencies — before requesting review.
- **Merging** only happens after approval from a reviewer.
- **Never force-push to `main`.** If you need to force-push your own feature branch after a rebase, use `--force-with-lease`, never `--force`.
