This guide is for a fresh Windows machine with no programming tools installed. It mirrors the exact setup used by the rest of the team.

Treat the commands and setups here as "black magic" for now if you haven't read the architectural guides. We aren't going to handhold you through version control theory here—you'll learn to swim in Git and GitHub waters by actually doing it. For now, you just need the tools installed.

**Time to complete:** ~20–30 minutes on a clean machine.

---

1. **Install Git:** Restart your terminal after installation.
Download the Git for Windows installer from [git-scm.com/download/win](https://git-scm.com/download/win).

Run the `.exe` file and follow the wizard exactly as follows:

* **Select Components:** Check **Additional icons** -> **On the Desktop**. Leave the rest as default.
* **Choosing the default editor:** Select **Visual Studio Code** from the dropdown (ensure it does *not* say "Insiders").
* **Adjusting the name of the initial branch:** Choose the second option, "main"
* **Adjusting your PATH environment:** Choose **Git from the command line and also from 3rd-party software**.
* **Choosing the SSH executable:** Use bundled OpenSSH.
* **Choosing HTTPS transport backend:** Use the OpenSSL library.
* **Configuring the line ending conversions:** Checkout Windows-style, commit Unix-style line endings.
* **Configuring the terminal emulator:** Use MinTTY.
* **Choose the default behavior of `git pull`:** Default (fast-forward or merge).
* **Choose a credential helper:** Git Credential Manager.
* **Configuring extra options:** Enable file system caching.

Click **Install**. Once finished, open a new PowerShell window and verify:

```powershell
git --version

```


2. **Install Visual Studio Code:**
Download the installer from [code.visualstudio.com](https://code.visualstudio.com/).

Run the installer and walk through the wizard:

* **License Agreement:** Accept it.
* **Select Additional Tasks:**
* Check **Add "Open with Code" action to Windows Explorer file context menu**.
* Check **Add "Open with Code" action to Windows Explorer directory context menu**.
* Check **Register Code as an editor for supported file types**.
* Check **Add to PATH (requires shell restart)**.


* Click **Next**, then **Install**.

Don't worry about extensions yet—you'll import the team's full profile (extensions, settings, formatting rules) in Step 8.


3. **Install nvm for Windows:** Run the installer as Administrator.
This project targets Node.js 22.x. Because Node versions change frequently across different projects, we use a version manager. On Windows, this is `nvm-windows`.

Download `nvm-setup.exe` from the [latest release page](https://github.com/coreybutler/nvm-windows/releases).

Right-click the downloaded file and select **Run as Administrator**.

* **License Agreement:** Accept.
* **Select Destination Location:** Leave the default (`C:\Users\YourUser\AppData\Roaming\nvm`).
* **Set Node.js Symlink:** Leave the default (`C:\Program Files\nodejs`).

Click **Install**. Once done, open a **new** PowerShell window and verify:

```powershell
nvm version

```


4. **Install Node.js 22 with nvm:**
With nvm installed, pulling down the correct version of Node is just two commands. In your PowerShell window, run:

```powershell
nvm install 22
nvm use 22

```

Verify it actually hooked up correctly:

```powershell
node --version
npm --version

```


5. **Allow local scripts to run:** Requires Administrator PowerShell.
Windows blocks unsigned PowerShell scripts by default. This is great for stopping random malware, but it will block our package manager and CLI tools from running.

Open PowerShell **as Administrator** (Right-click Start -> Windows PowerShell (Admin)) and run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser Bypass

```

Press `Y` and `Enter` when prompted. This logically bypasses the restriction for your user account only, not the whole machine. Just keep your usual common sense about not running scripts from sources you don't trust.


6. **Install pnpm:**
Node ships with a tool called Corepack that manages package managers. We just need to turn it on and tell it to use pnpm version 10. In your standard PowerShell window, run:

```powershell
corepack enable
corepack prepare pnpm@10 --activate

```

*(The exact pnpm version here doesn't matter much—the repo's `packageManager` field will force the exact version pnpm actually uses when you run it in the project directory.)*

Verify:

```powershell
pnpm --version

```


7. **Clone the repository:**
Navigate to wherever you want your code to live (e.g., `cd ~\Documents`), then pull down the codebase:

```powershell
git clone https://github.com/site-ilaila-ph/ilaila.git
cd ilaila

```


8. **Import the VS Code profile:**
The repository includes the team's entire VS Code environment configuration.

1. Open VSCode.
Click the settings icon, click profile, and then click profiles. Next to the new profiles option, click the dropdown icon and select import profile. Select the code-profile file, which is located inside the ilaila project under the dev/vscode/ folder (relative to the ilaila folder).


9. **Install dependencies:**
Ensure your terminal is currently inside the `ilaila` folder (the root of the repo), then run:

```powershell
pnpm install

```

This will read the `package.json` lockfiles and download all the required libraries. If this finishes without errors, the fog has officially lifted on your machine setup.


---

## Troubleshooting

If things go wrong, it's usually a PATH issue or a ghost in the machine. Try these first:

### `git` or `pnpm` not recognized after install

Close **all** terminal windows and open a new one. Windows only picks up `PATH` changes in new sessions. If it's still missing, restart your entire computer.

### `pnpm` command not recognized (even after restart)

Run this again:

```powershell
corepack enable

```

Then close and reopen the terminal.

### Node version mismatch

If you get errors about incompatible Node versions during `pnpm install`, confirm you actually switched to Node 22:

```powershell
nvm list
nvm use 22
node --version

```

### `pnpm install` fails or hangs endlessly

Sometimes the package cache gets corrupted. Clear the store and try again:

```powershell
pnpm store prune
pnpm install

```