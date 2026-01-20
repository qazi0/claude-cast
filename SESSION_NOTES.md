# ClaudeCast Session Notes - January 20, 2025

## What is ClaudeCast?

ClaudeCast is a **Raycast extension** that bridges Claude Code's powerful agentic CLI with Raycast's instant-access UI. It provides 9 features for Claude Code users who want quick access without opening a terminal.

**Location:** `/Users/siraj/devstuff/claude-cast`

## Features Implemented

### Phase 1 (MVP)
1. **Ask Claude Code** (`ask-claude.tsx`) - Quick prompts with VS Code context capture
2. **Project Launcher** (`launch-project.tsx`) - Browse and launch projects with favorites
3. **Session Browser** (`browse-sessions.tsx`) - Find and resume conversations
4. **Quick Continue** (`quick-continue.tsx`) - One-keystroke session continuation
5. **Git Actions** (`git-actions.tsx`) - Review staged changes, write commit messages

### Phase 2 (Power User)
6. **Prompt Library** (`prompt-library.tsx`) - 17 curated agentic workflow prompts
7. **Transform Selection** (`transform-selection.tsx`) - Code transformations from any app
8. **Menu Bar Monitor** (`menu-bar-monitor.tsx`) - Real-time status and quick access
9. **Usage Dashboard** (`usage-dashboard.tsx`) - Cost and usage metrics

---

## Session Accomplishments

### 1. Fixed ESLint Errors (20 errors)
Removed unused imports/variables across all files:
- `ask-claude.tsx`: Removed unused `prompt` prop
- `git-actions.tsx`: Removed `Clipboard`, fixed `isExecuting`
- `launch-project.tsx`: Removed `path` import, `useNavigation`
- `lib/claude-cli.ts`: Fixed unused `data` parameter
- `lib/usage-stats.ts`: Removed `fs`, `path`, `environment`
- `menu-bar-monitor.tsx`: Removed `open`, `formatTokens`, `getMostRecentSession`
- `prompt-library.tsx`: Removed `saveCustomPrompt`
- `quick-continue.tsx`: Removed `popToRoot`
- `transform-selection.tsx`: Removed `popToRoot`
- `usage-dashboard.tsx`: Removed `List`, `popToRoot`, `formatTokens`, `launchClaudeCode`, `SessionMetadata`

### 2. Fixed Icon Size
- Resized `assets/command-icon.png` from 256x256 to 512x512 (Raycast requirement)

### 3. Fixed Claude CLI Hanging Issue
**Problem:** Claude CLI calls from Raycast would hang indefinitely.

**Root Cause:** `spawn()` by default inherits stdin from parent. When running in Raycast (no TTY), Claude CLI waited for stdin to close.

**Fix:** Added `stdio: ["ignore", "pipe", "pipe"]` to close stdin while keeping stdout/stderr as pipes.

```typescript
const child = spawn(claudePath, args, {
  cwd: options.cwd || os.homedir(),
  env,
  stdio: ["ignore", "pipe", "pipe"], // Close stdin to prevent CLI from waiting
});
```

### 4. Fixed `--verbose` Flag Issue
**Problem:** With `--verbose`, Claude CLI outputs a JSON array instead of newline-delimited JSON.

**Fix:** Removed `--verbose` flag from CLI arguments.

### 5. Fixed Path Detection
**Problem:** `which claude` doesn't work in Raycast's sandboxed environment.

**Fix:** Check common paths first (`/opt/homebrew/bin/claude`, `/usr/local/bin/claude`) before falling back to `which`.

### 6. Added OAuth Token Support
**Problem:** Claude Code uses macOS Keychain for OAuth auth, but Raycast's sandbox can't access it.

**Solution:**
1. User runs `claude setup-token` to generate a long-lived OAuth token
2. Added `oauthToken` preference field in `package.json`
3. Pass token as `CLAUDE_CODE_OAUTH_TOKEN` environment variable to CLI

### 7. Updated Prompt Library Architecture
**Change:** Default action now opens terminal with Claude Code session (better for agentic workflows) instead of showing results in Raycast.

- **"Run in Terminal"** (default) - Opens Claude Code in terminal with prompt
- **"Quick Execute in Raycast"** (Cmd+E) - Runs via API, shows result in Raycast

### 8. Added Timeout
Added 2-minute timeout to prevent infinite hangs if CLI doesn't respond.

---

## Directory Structure

```
/Users/siraj/devstuff/claude-cast/
├── package.json              # Raycast extension config, preferences, commands
├── tsconfig.json             # TypeScript config
├── README.md                 # Documentation
├── SESSION_NOTES.md          # This file
├── assets/
│   └── command-icon.png      # Extension icon (512x512)
└── src/
    ├── ask-claude.tsx        # Quick prompt command
    ├── browse-sessions.tsx   # Session browser command
    ├── launch-project.tsx    # Project launcher command
    ├── quick-continue.tsx    # Quick continue (no-view command)
    ├── git-actions.tsx       # Git-aware actions command
    ├── prompt-library.tsx    # Prompt library command
    ├── transform-selection.tsx # Transform selection command
    ├── menu-bar-monitor.tsx  # Menu bar status command
    ├── usage-dashboard.tsx   # Usage dashboard command
    └── lib/
        ├── claude-cli.ts     # Claude CLI integration (executePrompt, getClaudePath)
        ├── session-parser.ts # JSONL session file parsing
        ├── project-discovery.ts # Project detection from Claude/VS Code
        ├── context-capture.ts # VS Code context and clipboard capture
        ├── terminal.ts       # Terminal app launchers (Terminal, iTerm, Warp, Kitty, Ghostty)
        ├── prompts.ts        # 17 built-in prompt templates
        └── usage-stats.ts    # Usage statistics calculations
```

---

## Key Files Explained

### `src/lib/claude-cli.ts`
Core Claude CLI integration. Key functions:
- `getClaudePath()` - Finds Claude CLI binary
- `executePrompt()` - Runs Claude with `-p` flag, returns JSON response
- `executePromptStreaming()` - Streaming version (not heavily used)
- `isClaudeInstalled()` - Checks if CLI exists

**Critical implementation details:**
```typescript
// Must close stdin to prevent hanging
stdio: ["ignore", "pipe", "pipe"]

// Must pass OAuth token for Raycast environment
env.CLAUDE_CODE_OAUTH_TOKEN = preferences.oauthToken;

// Check common paths first (which doesn't work in sandbox)
const commonPaths = [
  "/opt/homebrew/bin/claude",
  "/usr/local/bin/claude",
  ...
];
```

### `src/lib/terminal.ts`
Launches Claude Code in terminal apps. Key function:
- `launchClaudeCode()` - Opens terminal with `claude` command
- Supports: Terminal.app, iTerm, Warp, Kitty, Ghostty

**Important:** For interactive sessions, DON'T use `-p` flag. Just pass prompt as positional argument.

### `package.json`
Contains extension metadata and **preferences**:
- `defaultModel` - sonnet/opus/haiku
- `terminalApp` - Which terminal to use
- `claudeCodePath` - Custom path to Claude CLI
- `oauthToken` - **Required** for API features in Raycast

---

## How to Run/Test

```bash
cd /Users/siraj/devstuff/claude-cast

# Install dependencies (if needed)
npm install

# Run linter
npm run lint

# Build
npm run build

# Start dev server
npm run dev
```

Then in Raycast:
1. Search for any ClaudeCast command
2. Configure OAuth token in extension preferences (Cmd+,)

---

## User Setup Required

For API-calling features (Transform Selection, Ask Claude, Git Actions) to work:

1. **Generate OAuth token:**
   ```bash
   claude setup-token
   ```

2. **Add token to Raycast:**
   - Open Raycast → Search "ClaudeCast" → Cmd+, → Paste token in "OAuth Token" field

---

## Current Status

| Check | Status |
|-------|--------|
| `npm run lint` | PASSING |
| `npm run build` | PASSING |
| Transform Selection | WORKING (with OAuth token) |
| Prompt Library | WORKING (opens terminal) |
| Browse Sessions | WORKING |
| Launch Project | WORKING |
| Quick Continue | WORKING |
| Git Actions | WORKING (with OAuth token) |
| Ask Claude Code | WORKING (with OAuth token) |
| Menu Bar Monitor | WORKING |
| Usage Dashboard | WORKING |

---

## Potential Future Work

1. **Auto-detect OAuth token** - Check if `~/.claude/` has a stored token file
2. **Better error messages** - Show "Please configure OAuth token" instead of API errors
3. **Streaming responses** - Show incremental results in Raycast
4. **Session preview** - Show conversation content in session browser
5. **Raycast Store submission** - Create screenshots, finalize README

---

## Key Technical Learnings

1. **Raycast runs in a sandboxed environment** - Can't access Keychain, `which` may not work
2. **Node.js `spawn()` inherits stdin by default** - Must explicitly close it with `stdio: ["ignore", "pipe", "pipe"]`
3. **Claude CLI `--verbose` changes output format** - Don't use it for programmatic parsing
4. **Claude CLI `-p` flag is for non-interactive mode** - For interactive terminal sessions, pass prompt as positional argument
5. **OAuth tokens are required for sandboxed environments** - `claude setup-token` creates a long-lived token

---

## Commands Reference

```bash
# Claude CLI in print mode (what Raycast uses)
claude -p "prompt" --output-format json --model haiku

# Claude CLI interactive with initial prompt (what terminal launcher uses)
claude "initial prompt"

# Generate OAuth token
claude setup-token

# Check Claude version
claude --version
```
