# Windows Codex Handoff

This file is the execution prompt for a Codex agent running on the Windows desktop. Read `CLAUDE.md`, `SESSION_NOTES.md`, and this file completely before taking action.

## Current Assignment

Finish the Windows setup and acceptance work for ClaudeCast. Do not omit any feature listed in `SESSION_NOTES.md`. The integrated macOS source snapshot has not been transferred yet, so keep the Windows clone on its clean baseline until the Mac agent confirms that the snapshot is ready.

The current release includes these Windows-sensitive areas:

- Native Windows command execution, terminals, project discovery, sessions, charts, shortcuts, Ralph, and agent control.
- Incremental Deep Search indexing.
- AskUserQuestion routing through Raycast.
- Claude subscription limits and forecasts.
- Unified Session Inbox.
- Exact Match Navigation.
- Permission Inbox.
- Worktree Control Center.
- WSL Session Support.

Budget Alerts are outside the approved scope.

## Machine State

| Item                | Current State                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Host                | `192.168.1.26`                                                                                                                                  |
| User                | `blakberrisigma`                                                                                                                                |
| Operating System    | Windows 10 Pro, build 19045, x64                                                                                                                |
| Interactive Session | Console session active                                                                                                                          |
| SSH                 | Key-only access from the Mac is configured                                                                                                      |
| Repository          | `C:\Users\blakberrisigma\projects\claude-cast`                                                                                                  |
| Repository Revision | Clean tracked `origin/main` at `b4e5f3e1739d2eee964640902ee8ea557707c0c1`; this handoff is the only intentional untracked file                  |
| Git                 | 2.42.0.windows.2                                                                                                                                |
| Node                | 22.22.0                                                                                                                                         |
| npm                 | 10.9.4                                                                                                                                          |
| Codex CLI           | 0.149.0, authentication left to the user                                                                                                        |
| Claude Code         | Native 2.1.241 at `C:\Users\blakberrisigma\.local\bin\claude.exe`, authentication left to the user                                              |
| Raycast             | App package 2.0.5.0, healthy and running in the console session                                                                                 |
| Windows Terminal    | App package 1.15.2874.0                                                                                                                         |
| Windows PowerShell  | 5.1.19041.6456                                                                                                                                  |
| PowerShell 7        | 7.3.7 from the official `Microsoft.PowerShell` Winget package; the host's stale Winget catalog offered this version and canceled source refresh |
| WSL                 | Package 2.4.13.0, default version 2                                                                                                             |
| WSL Distributions   | `docker-desktop` remains the default; `Ubuntu` is installed with `--no-launch`, stopped, and awaiting first-launch user creation                |
| Editors             | VS Code, Cursor, and VSCodium were not found                                                                                                    |
| Long Paths          | Enabled in Windows                                                                                                                              |
| Remote Desktop      | Supported by Windows 10 Pro, currently disabled                                                                                                 |

Git for Windows, Node, npm, Codex, Claude Code, Raycast, Windows Terminal, and WSL came from their official distributions or package sources. Do not replace them with mirrors or unofficial installers.

## Start Codex on Windows

Open PowerShell in the logged-in Windows desktop and run:

```powershell
Set-Location 'C:\Users\blakberrisigma\projects\claude-cast'
codex
```

Use this first prompt:

```text
Read CLAUDE.md, SESSION_NOTES.md, and WINDOWS_CODEX_HANDOFF.md completely. Follow every project instruction. Confirm the integrated Mac snapshot has been applied before editing source. Then finish the Windows setup and execute every automated and interactive acceptance item. Do not publish, commit, push, remove a real worktree, stop a real agent, or spend Claude usage without explicit user approval.
```

The user must complete browser-based sign-in when `codex` or `claude` requests it. Do not copy authentication files, session cookies, passwords, or tokens between machines.

## Pre-Transfer Checks

Run these commands in PowerShell before receiving the integrated source:

```powershell
$repositoryPath = 'C:\Users\blakberrisigma\projects\claude-cast'
Set-Location -LiteralPath $repositoryPath
git status --short --branch
git rev-parse HEAD
git remote -v
Get-Command git, node, npm, codex, claude, wt, wsl | Select-Object Name, Source
Get-AppxPackage Raycast.Raycast, Microsoft.WindowsTerminal | Select-Object Name, Version, Status
wsl.exe --status
wsl.exe --list --verbose
```

Expected repository state before transfer:

```text
## main...origin/main
?? WINDOWS_CODEX_HANDOFF.md
b4e5f3e1739d2eee964640902ee8ea557707c0c1
```

Stop if tracked source files are modified or another untracked file appears. Preserve any user-created file and report the conflict before applying the Mac snapshot.

## Safe Mac Snapshot Transfer

Run this section on the Mac only after the Mac agent says the integrated worktree is ready. It captures tracked changes and non-ignored new files in a temporary Git index. It does not modify the real Mac index. `CLAUDE.md` and `SESSION_NOTES.md` remain outside the patch because `.gitignore` excludes them. The Windows handoff is copied separately.

```bash
cd /Users/siraj/dev/projects/claude-cast

git status --short --branch
git diff --check

transfer_directory="$(mktemp -d)"
transfer_index="$transfer_directory/index"
export GIT_INDEX_FILE="$transfer_index"

git read-tree HEAD
git add -A -- . ':(exclude)WINDOWS_CODEX_HANDOFF.md'
git diff --cached --name-status HEAD
```

Inspect the name list. Stop if it contains an environment file, private key, credential export, browser profile, Claude authentication data, Codex authentication data, or an unrelated user file. If the list is correct, run:

```bash
git diff --cached --binary --full-index HEAD | ssh -i /Users/siraj/.ssh/id_ed25519 -o IdentitiesOnly=yes -o BatchMode=yes blakberrisigma@192.168.1.26 "git -C C:/Users/blakberrisigma/projects/claude-cast apply --check --binary -"

git diff --cached --binary --full-index HEAD | ssh -i /Users/siraj/.ssh/id_ed25519 -o IdentitiesOnly=yes -o BatchMode=yes blakberrisigma@192.168.1.26 "git -C C:/Users/blakberrisigma/projects/claude-cast apply --binary -"

unset GIT_INDEX_FILE
rm -r "$transfer_directory"
```

Copy the ignored guidance files separately:

```bash
scp -i /Users/siraj/.ssh/id_ed25519 CLAUDE.md SESSION_NOTES.md WINDOWS_CODEX_HANDOFF.md blakberrisigma@192.168.1.26:C:/Users/blakberrisigma/projects/claude-cast/
```

Verify from the Mac:

```bash
ssh -i /Users/siraj/.ssh/id_ed25519 -o IdentitiesOnly=yes -o BatchMode=yes blakberrisigma@192.168.1.26 "git -C C:/Users/blakberrisigma/projects/claude-cast status --short --branch"
```

Compare the Windows status with the staged name list from the temporary Mac index. Do not run `git reset`, `git clean`, `git checkout`, or any command that discards files.

## Automated Windows Validation

Run from a fresh PowerShell window after the integrated snapshot arrives:

```powershell
$ErrorActionPreference = 'Stop'
$repositoryPath = 'C:\Users\blakberrisigma\projects\claude-cast'
Set-Location -LiteralPath $repositoryPath

node --version
npm --version
git --version
claude --version
codex --version

npm ci
npm test
npx tsc --noEmit
npm run lint
npm run build
git diff --check

Get-ChildItem -LiteralPath (Join-Path $repositoryPath 'dist') -Recurse -File -Filter '*.js' | ForEach-Object {
  node --check $_.FullName
  if ($LASTEXITCODE -ne 0) {
    throw "Bundle Parse Failed: $($_.FullName)"
  }
}
```

Also inspect `package.json` and the built manifest. Confirm Windows remains declared, the menu-bar command is excluded on Windows, every other intended command has a bundle, and every new runtime asset is present in the built artifact. Source-only tests do not prove that hook runners, icons, scripts, or other runtime assets ship.

Run scheduling-sensitive tests in at least three fresh processes:

```powershell
1..3 | ForEach-Object {
  npm test
  if ($LASTEXITCODE -ne 0) {
    throw "Repeated Test Run Failed: $_"
  }
}
```

## Native Windows Acceptance

Launch development mode from the logged-in desktop:

```powershell
Set-Location 'C:\Users\blakberrisigma\projects\claude-cast'
npm run dev
```

Complete these checks in Raycast:

- Confirm every intended Windows command installs and opens. Confirm the menu-bar command stays hidden.
- Test Windows Terminal new-window and existing-window tab launch.
- Test Windows PowerShell 5.1 and the installed PowerShell 7.3.7. Verify the configured fallback when `pwsh.exe` is unavailable.
- Test Command Prompt and the fallback when `wt.exe` is unavailable.
- Confirm background commands do not flash console windows.
- Test native Claude discovery, an explicitly configured Claude executable, and the native installer path outside the original process PATH.
- Keep one Raycast worker running while a test PATH entry changes in the user or machine registry. Confirm the next lookup rereads PATH and finds the new executable without restarting Raycast.
- Test prompt input containing CRLF, Unicode, `%`, `&`, `|`, `^`, `!`, double quotes, trailing backslashes, and at least 100 KB of text.
- Test project paths on another drive, a OneDrive folder, a UNC share, and paths containing Unicode, spaces, ampersands, and parentheses.
- Test a custom Claude configuration directory.
- Test current, missing, and stale session indexes. Include malformed JSONL and JSONL `cwd` fallback.
- Test local VS Code, Insiders, Cursor, and VSCodium storage after installing any editor needed for acceptance. Include drive file URIs, UNC file URIs, and excluded remote URIs.
- Test Browse Sessions, Deep Search Sessions, Quick Continue, resume, fork, Recycle Bin deletion, usage totals, and chart rendering.
- Test Manage Agents list, dispatch form validation, logs, attach, stop, restart, inactive removal, daemon retry, waiting state, and completed state. Ask before dispatching or mutating a real agent.
- Test Ralph planning, Unicode, configured executables, configured Claude directory, stop during a child, failed termination, maximum iterations, fresh-shell resume, Ctrl+C, visible output, and orphan cleanup.
- Test selected text, clipboard paste, Show in Explorer, editor opening, preferences, and every shortcut.

## Incremental Search Index Acceptance

Run the unit and separate-process performance tests, then confirm these cases through Raycast where practical:

- Initial indexing across native Windows and WSL fixture roots.
- An unchanged reopen performs no transcript reads.
- Appended JSONL content appears once.
- A shrink or rewrite drops stale content.
- An interrupted update resumes without duplicate hits.
- Deleted sessions disappear.
- Duplicate session IDs remain deterministic across projects and sources.
- Unicode, malformed JSONL, images, tool blocks, long lines, CRLF, and invalid UTF-8 do not corrupt the index.
- Cancellation during indexing and search does not publish stale results.
- `dir:` and project filters honor case-insensitive Windows identity and case-sensitive Linux identity inside WSL.
- Index files stay under Raycast support storage and never appear in the repository or Claude transcript roots.

## AskUserQuestion Hook Acceptance

- Install the ClaudeCast hook twice and confirm the second install adds no duplicate entry.
- Start with unrelated Claude hook events and matchers. Confirm install and uninstall preserve every unrelated entry.
- Confirm the first settings change creates a backup.
- Submit single-choice, multi-select, and freeform questions.
- Queue simultaneous questions from separate sessions and route each response to the correct tool use.
- Confirm request and reply publication is atomic.
- Test timeout, Raycast unavailable, malformed data, unknown fields, stale files, traversal attempts, and replayed replies.
- Confirm the hook runner works from native Windows and a WSL Claude session without shell-specific quoting.
- Confirm secrets and full credentials never appear in errors, logs, requests, replies, or notifications.

## Subscription Usage Acceptance

- Test valid five-hour and weekly windows plus missing, malformed, expired, and partial windows.
- Test reset display in the Windows timezone.
- Test snapshot deduplication, bounded retention, and stale fallback.
- Test forecasts with enough history, sparse history, flat use, burst use, and a reset boundary.
- Test network timeout and cancellation.
- Confirm the dashboard separates local token cost estimates from server subscription utilization.
- Confirm snapshots, logs, errors, and Markdown contain no credential value.

## Unified Session Inbox Acceptance

`Browse Sessions` and `Deep Search Sessions` must expose source tags for:

- `Claude CLI`.
- `Desktop`.
- `VS Code`.
- `Conductor`.
- `WSL`.

Each record must show its available title, branch, workspace, and archived state. Source identity must survive indexing, filtering, display, detail loading, and every action.

Acceptance cases:

- Load at least one fixture from each source and confirm the source tag remains correct in Browse and Deep Search.
- Show title, branch, workspace, and archived state when present. Missing optional fields must not inherit values from another record.
- Keep identical session IDs as distinct records when their transcript paths differ.
- Keep native Windows and separate WSL distributions distinct, including when session IDs and project names match.
- Exclude data outside the approved source transcript roots.
- Handle stale indexes, deleted sessions, malformed records, inaccessible WSL distributions, and source refresh cancellation.
- Confirm source filters, project filters, recents, resume, fork, detail, and deletion actions target the selected transcript path and source.
- Confirm a refresh cannot publish older results over a newer request.

## Exact Match Navigation Acceptance

- Create two test sessions containing the same phrase and multiple occurrences inside one session.
- Include CRLF, non-ASCII text, an emoji, tool blocks, image blocks, and a long line before the target.
- Confirm every search hit carries a stable message ID plus source byte, record, and message indexes.
- Search the exact phrase and open each result. Confirm `View Details` loads three bounded messages before and three bounded messages after the selected message.
- Confirm the selected message is highlighted as `Matched Message` and navigation does not land on the first session message or a different occurrence.
- Confirm offsets remain correct after incremental append, rewrite, deletion, and index recovery.
- Confirm byte offsets, UTF-16 display indices, and Unicode boundaries do not split a character.
- Confirm native Windows and WSL records with the same session ID navigate to their own transcript.
- Confirm stale result actions fail safely after the source file changes or disappears.
- Confirm only validated local images inside the transcript or project roots are embedded. Reject remote images, traversal, symlink escapes, and local images outside those roots.
- Confirm every referenced-file action validates its target and opens only an allowed local file.

## Permission Inbox Acceptance

The existing command slug remains `claude-questions`. Its command title is `Permission Inbox`.

The inbox must support this mixed request queue:

- `AskUserQuestion`, including single-choice, multi-select, and freeform replies.
- `PermissionRequest`, including allow and deny replies with a reason.
- `ExitPlanMode`, including approve, deny, and defer replies.
- `Notification` with `agent_needs_input`, which queues the matching agent request.
- `Notification` with `agent_completed`, which cleans up the matching queued request.

Acceptance cases:

- Queue concurrent mixed requests from native Windows and WSL sessions.
- Keep session, project, source, distribution, tool-use, event type, and request identity through display and reply.
- Route every AskUserQuestion answer, permission allow or deny reason, and plan approve, deny, or defer reply to the correct waiting process.
- Confirm `agent_needs_input` queues the matching agent once and `agent_completed` removes only that agent's queued request.
- Confirm notifications are not duplicated when Claude native notifications and ClaudeCast hooks report the same event.
- Reject malformed, stale, replayed, unknown-field, and traversal input.
- Publish mixed request and response files atomically with private permissions.
- Preserve unrelated Claude settings and hooks during install, reinstall, and uninstall.
- Confirm Raycast unavailable and closed-window behavior returns a bounded failure to Claude.

## Worktree Control Center Acceptance

The command title is `Manage Worktrees`. It must show these sections:

- `Needs Attention`.
- `Agent Worktrees`.
- `Clean Worktrees`.
- `Main Worktrees`.

The implementation must parse the official NUL-delimited output from:

```powershell
git worktree list --porcelain -z
```

Each published record must retain:

- Repository root and repository name.
- Worktree path.
- HEAD.
- Branch or detached state.
- Bare state.
- Locked state and lock reason.
- Prunable state and prune reason.
- Clean status counts.
- Bounded diff summary.
- Last activity.
- Matching Claude agents.

The command actions are:

- `Launch Claude in Worktree`.
- `Show Worktree in File Browser`.
- `Lock Worktree` and `Unlock Worktree`.
- `Remove Clean Worktree`.
- `Prune Missing Worktrees`.
- `Refresh`.
- `Copy Path` and `Copy Branch`.

Create a disposable repository under `$env:TEMP` with a main worktree and these secondary worktrees:

- Clean branch worktree.
- Dirty worktree.
- Locked worktree.
- Detached HEAD worktree.
- Missing worktree that Git reports as prunable.
- Paths containing spaces, Unicode, ampersands, and parentheses.

Confirm list parsing preserves paths, HEAD values, branches, detached state, lock reasons, and prunable reasons. Confirm refresh remains deterministic.

Confirm discovery uses one global four-process Git limit, including nested repository details. Start overlapping refreshes and confirm cancellation stops stale discovery without exceeding that limit or publishing old results.

Start discovery from a linked worktree only and confirm every record retains the stable main repository root. Confirm agent working directories seed discovery before project history appears. Modify an existing nested file and confirm `Last Activity` advances. Confirm missing or slow paths are checked asynchronously without blocking Raycast rendering.

Removal must reject:

- The main worktree.
- Every bare worktree.
- Every locked worktree.
- Every prunable worktree.
- Every worktree with missing status.
- Every dirty worktree.

There is no force-removal path. Confirm a clean secondary worktree can be removed only after the intended confirmation. Confirm the action uses the selected repository and never infers a broader deletion target. Confirm stale UI state cannot remove a different worktree after refresh.

Before `Prune Missing Worktrees` asks for confirmation, it must show the exact output from:

```powershell
git worktree prune --dry-run --verbose --expire now
```

Confirm cancellation makes no change. Confirm approval prunes only records Git identified in the displayed dry-run output.

Confirm the dry-run preview captures Git's stderr report, shows the complete bounded candidate set, and performs a parity recheck immediately before pruning. Change the missing-worktree set after the first preview and confirm the action aborts instead of pruning a record the user did not review.

Test new and resumed Claude sessions in secondary worktrees. Confirm project identity, favorites, recents, session history, and agent state do not collapse the main repository and its worktrees into an unsafe removal target.

## WSL Session Support Acceptance

Discovery must begin with:

```powershell
wsl.exe --list --quiet
```

For each returned distribution, query its Linux `$HOME` inside that distribution. Read only the real path contained by `<home>/.claude/projects`, regardless of `CLAUDE_CONFIG_DIR`. Retain the distribution name in every project, session, search hit, index record, action, and cache key. A distribution without that root should yield no sessions and no fatal error.

Ubuntu is installed from the official WSL distribution source with `--no-launch`. It has not completed first-launch initialization, and `docker-desktop` remains the default distribution.

The user must complete this desktop step:

1. Open PowerShell in the logged-in Windows desktop.
2. Run `wsl.exe -d Ubuntu`.
3. Wait for distribution initialization.
4. Enter the requested new UNIX username.
5. Enter and confirm a new Linux password. The password prompt does not echo characters.
6. Run `exit` after reaching the Ubuntu shell.
7. Confirm `wsl.exe --status` still reports `docker-desktop` as the default. If first launch changed it, stop and report the change before altering the default.

After initialization, install Claude Code inside Ubuntu from Anthropic's official Linux installer and let the user authenticate there. Do not copy the Windows Claude installation or authentication files into WSL.

Use this launch contract or an equivalent Windows Terminal argument array:

```powershell
wsl.exe -d <Distribution> --cd <LinuxCwd> -- claude --resume <SessionId>
```

Acceptance cases:

- Discovery across two distributions with different Linux home paths.
- A stopped distribution that starts on demand.
- A distribution name and project path containing spaces or Unicode where supported, including long Unicode-only UTF-16 distribution output.
- Duplicate session IDs across native Windows and separate WSL distributions.
- Missing, inaccessible, stale, and malformed WSL transcript roots.
- Native Windows case-insensitive identity alongside Linux case-sensitive identity.
- Browse Sessions, Deep Search Sessions, Quick Continue, Launch Project, Exact Match Navigation, resume, fork, new session, Permission Inbox, AskUserQuestion routing, and usage scans in WSL.
- Correct `wsl.exe` argument boundaries for prompts, session IDs, distribution names, and Linux paths.
- A prompt of at least 100 KB reaches Claude through a private temporary file and preserves CRLF, Unicode, `%`, `&`, `|`, `^`, `!`, quotes, dollar signs, and trailing backslashes.
- No scan of `/mnt/c`, other Linux home content, Docker data, `CLAUDE_CONFIG_DIR`, symlink escapes, or paths outside the real `<home>/.claude/projects` root.
- Process cancellation and timeout terminate only the intended WSL process tree.

Do not treat `docker-desktop` as proof that user-distribution acceptance passed.

## Interactive Access Needed

SSH can run filesystem, Git, Node, test, build, and PowerShell checks. It cannot confirm Raycast rendering, focus, clipboard, selected text, File Explorer, terminal windows and tabs, browser sign-in, or visual navigation.

Choose one interactive path:

1. Run Codex in the active Windows console and let it guide the user through each visual check.
2. Enable Windows Remote Desktop and its firewall rules, then connect from a Mac RDP client. Windows 10 Pro supports hosting, but Remote Desktop is currently disabled and no Mac RDP client was found. Enabling it changes machine exposure and may lock the console session, so obtain explicit user approval first.

## Official References

- Claude Code Installation: https://code.claude.com/docs/en/installation
- Claude Code Hooks: https://code.claude.com/docs/en/hooks
- Codex CLI: https://developers.openai.com/codex/cli
- Git Worktree: https://git-scm.com/docs/git-worktree.html
- WSL Installation: https://learn.microsoft.com/en-us/windows/wsl/install
- Windows Terminal Arguments: https://learn.microsoft.com/en-us/windows/terminal/command-line-arguments
- Raycast For Windows: https://www.raycast.com/windows
- Raycast WSL Session Reference: https://github.com/raycast/extensions/pull/28748

## Completion Report

Report:

- Exact tool versions and authentication state without exposing credentials.
- Mac snapshot identity and Windows `git status` after transfer.
- Every validation command with pass or fail.
- Every UI matrix item with pass, fail, blocked, or pending.
- Reproduction steps and captured output for each failure.
- Any source or test changes made on Windows.
- Any remaining need for user sign-in, WSL restart, editor installation, PowerShell 7 installation, Remote Desktop, or visual confirmation.

Do not commit, push, publish, dispatch a paid agent, remove a real worktree, or alter a real Claude hook until the user approves that action.
