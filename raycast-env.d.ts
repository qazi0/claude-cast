/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Default Model - The default Claude model to use for prompts */
  "defaultModel": "sonnet" | "opus" | "haiku",
  /** Terminal Application - Choose which terminal opens new Claude Code sessions. Each app uses its native AppleScript or CLI so launches are reliable across macOS updates. */
  "terminalApp": "Terminal" | "iTerm" | "Warp" | "kitty" | "Ghostty" | "cmux",
  /** Open In - Choose whether new Claude Code sessions open in a new terminal window or a new tab in the front window. Per-terminal notes: kitty New Tab requires `allow_remote_control yes` and a `listen_on` socket in `kitty.conf` (otherwise falls back to a new window). Warp always opens a new window regardless of this setting. */
  "openIn": "window" | "tab",
  /** Claude Code Path - Path to the claude CLI binary (leave empty for auto-detection) */
  "claudeCodePath"?: string,
  /** Anthropic API Key - Your Anthropic API key for pay-as-you-go billing (console.anthropic.com). Use this OR OAuth Token. */
  "anthropicApiKey"?: string,
  /** OAuth Token (Claude Subscription) - For Claude Pro/Team subscribers: Run 'claude setup-token' in terminal and paste the token here. */
  "oauthToken"?: string
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
  "model": "" | "sonnet" | "opus" | "haiku"
}
  /** Preferences accessible in the `quick-continue` command */
  export type QuickContinue = ExtensionPreferences & {}
  /** Preferences accessible in the `git-actions` command */
  export type GitActions = ExtensionPreferences & {}
  /** Preferences accessible in the `prompt-library` command */
  export type PromptLibrary = ExtensionPreferences & {}
  /** Preferences accessible in the `transform-selection` command */
  export type TransformSelection = ExtensionPreferences & {}
  /** Preferences accessible in the `menu-bar-monitor` command */
  export type MenuBarMonitor = ExtensionPreferences & {
  /** undefined - Display today's spend (USD) next to the menu bar icon. Updates every 30 seconds. */
  "showCostInMenuBar": boolean
}
  /** Preferences accessible in the `usage-dashboard` command */
  export type UsageDashboard = ExtensionPreferences & {}
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
}

