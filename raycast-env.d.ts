/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Default Model - The default Claude model to use for prompts */
  "defaultModel": "sonnet" | "opus" | "haiku",
  /** Terminal Application - The terminal app to use for launching Claude Code sessions */
  "terminalApp": "Terminal" | "iTerm" | "Warp" | "kitty" | "Ghostty",
  /** Claude Code Path - Path to the claude CLI binary (leave empty for auto-detection) */
  "claudeCodePath"?: string,
  /** OAuth Token - Long-lived OAuth token from 'claude setup-token' (required for Raycast integration) */
  "oauthToken"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `ask-claude` command */
  export type AskClaude = ExtensionPreferences & {}
  /** Preferences accessible in the `browse-sessions` command */
  export type BrowseSessions = ExtensionPreferences & {}
  /** Preferences accessible in the `launch-project` command */
  export type LaunchProject = ExtensionPreferences & {}
  /** Preferences accessible in the `quick-continue` command */
  export type QuickContinue = ExtensionPreferences & {}
  /** Preferences accessible in the `git-actions` command */
  export type GitActions = ExtensionPreferences & {}
  /** Preferences accessible in the `prompt-library` command */
  export type PromptLibrary = ExtensionPreferences & {}
  /** Preferences accessible in the `transform-selection` command */
  export type TransformSelection = ExtensionPreferences & {}
  /** Preferences accessible in the `menu-bar-monitor` command */
  export type MenuBarMonitor = ExtensionPreferences & {}
  /** Preferences accessible in the `usage-dashboard` command */
  export type UsageDashboard = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `ask-claude` command */
  export type AskClaude = {}
  /** Arguments passed to the `browse-sessions` command */
  export type BrowseSessions = {}
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

