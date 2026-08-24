/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Default Model - The default Claude model to use for prompts */
  "defaultModel": "fable" | "sonnet" | "opus" | "haiku",
  /** Terminal Application - Choose which terminal opens Claude Code. macOS uses each app's native launcher. Windows supports Windows Terminal, PowerShell, Windows PowerShell, and Command Prompt. */
  "terminalApp": "Terminal" | "iTerm" | "Warp" | "kitty" | "Ghostty" | "cmux" | "Windows Terminal" | "PowerShell" | "Windows PowerShell" | "Command Prompt",
  /** Open In - Choose a new window or tab. Windows Terminal supports both. PowerShell and Command Prompt open windows. On macOS, Warp always opens a window and kitty tabs require remote control. */
  "openIn": "window" | "tab",
  /** Claude Code Path - Path to the claude CLI binary (leave empty for auto-detection) */
  "claudeCodePath"?: string,
  /** Claude Config Directory - Claude data directory containing projects and credentials. Leave empty to use CLAUDE_CONFIG_DIR or ~/.claude. */
  "claudeConfigPath"?: string,
  /** Anthropic API Key - Your Anthropic API key for pay-as-you-go billing (console.anthropic.com). Use this OR OAuth Token. */
  "anthropicApiKey"?: string,
  /** OAuth Token (Claude Subscription) - For Claude Pro/Team subscribers: Run 'claude setup-token' in terminal and paste the token here. */
  "oauthToken"?: string,
  /** Subscription Usage OAuth Token - A Claude OAuth access token with the user:profile scope. Used only for api.anthropic.com subscription limits. This is separate from the setup-token prompt credential and Anthropic API key. */
  "subscriptionUsageOAuthToken"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `ask-claude` command */
  export type AskClaude = ExtensionPreferences & {}
  /** Preferences accessible in the `browse-sessions` command */
  export type BrowseSessions = ExtensionPreferences & {}
  /** Preferences accessible in the `deep-search-sessions` command */
  export type DeepSearchSessions = ExtensionPreferences & {}
  /** Preferences accessible in the `launch-project` command */
  export type LaunchProject = ExtensionPreferences & {
  /** Permission Mode - Default permission mode for new sessions launched from this command */
  "permissionMode": "default" | "plan" | "acceptEdits" | "auto" | "bypassPermissions",
  /** Model Override - Override the extension's default model for sessions launched from this command */
  "model": "" | "fable" | "sonnet" | "opus" | "haiku"
}
  /** Preferences accessible in the `quick-continue` command */
  export type QuickContinue = ExtensionPreferences & {}
  /** Preferences accessible in the `manage-worktrees` command */
  export type ManageWorktrees = ExtensionPreferences & {}
  /** Preferences accessible in the `git-actions` command */
  export type GitActions = ExtensionPreferences & {}
  /** Preferences accessible in the `prompt-library` command */
  export type PromptLibrary = ExtensionPreferences & {}
  /** Preferences accessible in the `transform-selection` command */
  export type TransformSelection = ExtensionPreferences & {}
  /** Preferences accessible in the `menu-bar-monitor` command */
  export type MenuBarMonitor = ExtensionPreferences & {
  /** undefined - Display today's spend (USD) next to the menu bar icon. Updates every minute. */
  "showCostInMenuBar": boolean
}
  /** Preferences accessible in the `usage-dashboard` command */
  export type UsageDashboard = ExtensionPreferences & {}
  /** Preferences accessible in the `claude-questions` command */
  export type ClaudeQuestions = ExtensionPreferences & {}
  /** Preferences accessible in the `manage-agents` command */
  export type ManageAgents = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `ask-claude` command */
  export type AskClaude = {}
  /** Arguments passed to the `browse-sessions` command */
  export type BrowseSessions = {}
  /** Arguments passed to the `deep-search-sessions` command */
  export type DeepSearchSessions = {}
  /** Arguments passed to the `launch-project` command */
  export type LaunchProject = {}
  /** Arguments passed to the `quick-continue` command */
  export type QuickContinue = {}
  /** Arguments passed to the `manage-worktrees` command */
  export type ManageWorktrees = {}
  /** Arguments passed to the `git-actions` command */
  export type GitActions = {}
  /** Arguments passed to the `prompt-library` command */
  export type PromptLibrary = {}
  /** Arguments passed to the `transform-selection` command */
  export type TransformSelection = {}
  /** Arguments passed to the `menu-bar-monitor` command */
  export type MenuBarMonitor = {}
  /** Arguments passed to the `usage-dashboard` command */
  export type UsageDashboard = {}
  /** Arguments passed to the `claude-questions` command */
  export type ClaudeQuestions = {}
  /** Arguments passed to the `manage-agents` command */
  export type ManageAgents = {}
}

