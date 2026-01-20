import {
  Clipboard,
  getSelectedText,
  getFrontmostApplication,
} from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";
import { getGitInfo } from "./project-discovery";

const execPromise = promisify(exec);

export interface CapturedContext {
  selectedText?: string;
  clipboard?: string;
  projectPath?: string;
  currentFile?: string;
  gitBranch?: string;
  gitHasChanges?: boolean;
  frontmostApp?: string;
}

/**
 * Get the currently selected text
 */
async function getSelection(): Promise<string | undefined> {
  try {
    const text = await getSelectedText();
    return text.trim() || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Get clipboard content
 */
async function getClipboardContent(): Promise<string | undefined> {
  try {
    const clipboard = await Clipboard.readText();
    return clipboard?.trim() || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Detect VS Code project from window title and app info
 */
async function detectVSCodeProject(): Promise<{
  projectPath?: string;
  currentFile?: string;
}> {
  try {
    const frontmost = await getFrontmostApplication();

    // Check if VS Code or similar editor is frontmost
    const editors = [
      "Code",
      "Code - Insiders",
      "Cursor",
      "VSCodium",
      "Visual Studio Code",
    ];
    if (!editors.some((e) => frontmost.name.includes(e))) {
      return {};
    }

    // Try to get window title using AppleScript
    const { stdout } = await execPromise(`
      osascript -e '
        tell application "System Events"
          tell process "${frontmost.name}"
            get name of front window
          end tell
        end tell
      '
    `);

    const windowTitle = stdout.trim();
    // VS Code window title format: "filename - folder - VS Code"
    // or "folder - VS Code"
    const parts = windowTitle.split(" - ");

    let currentFile: string | undefined;
    let projectPath: string | undefined;

    if (parts.length >= 2) {
      // Check if first part looks like a file
      if (parts[0].includes(".")) {
        currentFile = parts[0];
        projectPath = await findProjectPath(parts[1]);
      } else {
        projectPath = await findProjectPath(parts[0]);
      }
    }

    return { projectPath, currentFile };
  } catch {
    return {};
  }
}

/**
 * Try to find the full path of a project by name
 */
async function findProjectPath(
  projectName: string,
): Promise<string | undefined> {
  // Common development directories
  const searchDirs = [
    path.join(os.homedir(), "dev"),
    path.join(os.homedir(), "Development"),
    path.join(os.homedir(), "projects"),
    path.join(os.homedir(), "Projects"),
    path.join(os.homedir(), "code"),
    path.join(os.homedir(), "Code"),
    path.join(os.homedir(), "workspace"),
    path.join(os.homedir(), "work"),
    path.join(os.homedir(), "devstuff"),
    path.join(os.homedir(), "repos"),
    path.join(os.homedir(), "Documents"),
    path.join(os.homedir(), "Desktop"),
  ];

  for (const searchDir of searchDirs) {
    const potentialPath = path.join(searchDir, projectName);
    try {
      await fs.promises.access(potentialPath);
      return potentialPath;
    } catch {
      // Not found in this directory
    }
  }

  // Try Claude's known projects
  const claudeProjectsDir = path.join(os.homedir(), ".claude", "projects");
  try {
    const dirs = await fs.promises.readdir(claudeProjectsDir);
    for (const dir of dirs) {
      // Decode the path and check if it ends with the project name
      const decodedPath = "/" + dir.slice(1).replace(/-/g, "/");
      if (
        decodedPath.endsWith(`/${projectName}`) ||
        path.basename(decodedPath) === projectName
      ) {
        try {
          await fs.promises.access(decodedPath);
          return decodedPath;
        } catch {
          // Path doesn't exist on disk anymore
        }
      }
    }
  } catch {
    // Claude projects dir doesn't exist
  }

  return undefined;
}

/**
 * Capture all available context
 */
export async function captureContext(): Promise<CapturedContext> {
  // Run captures in parallel
  const [selectedText, clipboard, vscodeInfo, frontmostApp] = await Promise.all(
    [
      getSelection(),
      getClipboardContent(),
      detectVSCodeProject(),
      getFrontmostApplication().catch(() => null),
    ],
  );

  const context: CapturedContext = {
    selectedText,
    clipboard,
    projectPath: vscodeInfo.projectPath,
    currentFile: vscodeInfo.currentFile,
    frontmostApp: frontmostApp?.name,
  };

  // Get git info if we have a project path
  if (context.projectPath) {
    const gitInfo = await getGitInfo(context.projectPath);
    if (gitInfo) {
      context.gitBranch = gitInfo.branch;
      context.gitHasChanges = gitInfo.hasChanges;
    }
  }

  return context;
}

/**
 * Format captured context as a string for inclusion in prompts
 */
export function formatContextForPrompt(context: CapturedContext): string {
  const parts: string[] = [];

  if (context.projectPath) {
    parts.push(`Project: ${context.projectPath}`);
  }

  if (context.currentFile) {
    parts.push(`Current file: ${context.currentFile}`);
  }

  if (context.gitBranch) {
    parts.push(
      `Git branch: ${context.gitBranch}${context.gitHasChanges ? " (has changes)" : ""}`,
    );
  }

  if (context.selectedText) {
    parts.push(`\nSelected text:\n\`\`\`\n${context.selectedText}\n\`\`\``);
  }

  if (context.clipboard && context.clipboard !== context.selectedText) {
    // Only include clipboard if it's different from selection and looks like code
    if (looksLikeCode(context.clipboard)) {
      parts.push(`\nClipboard (code):\n\`\`\`\n${context.clipboard}\n\`\`\``);
    }
  }

  return parts.join("\n");
}

/**
 * Simple heuristic to check if text looks like code
 */
function looksLikeCode(text: string): boolean {
  const codeIndicators = [
    /function\s+\w+/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /var\s+\w+\s*=/,
    /class\s+\w+/,
    /import\s+.*from/,
    /export\s+(default\s+)?/,
    /def\s+\w+\s*\(/,
    /async\s+(function|def)/,
    /=>\s*{/,
    /\{\s*\n/,
    /^\s*(if|for|while|switch|try)\s*\(/m,
    /<[A-Z]\w+(\s|\/|>)/,
    /^\s*#include/m,
    /^\s*package\s+\w+/m,
    /^\s*impl\s+\w+/m,
    /fn\s+\w+\s*\(/,
  ];

  return codeIndicators.some((regex) => regex.test(text));
}

/**
 * Get selected text or clipboard as code context
 */
export async function getCodeContext(): Promise<string | undefined> {
  const selected = await getSelection();
  if (selected) return selected;

  const clipboard = await getClipboardContent();
  if (clipboard && looksLikeCode(clipboard)) {
    return clipboard;
  }

  return undefined;
}
