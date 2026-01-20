import { LocalStorage } from "@raycast/api";
import { listAllSessions, SessionMetadata } from "./session-parser";

export interface UsageStats {
  totalSessions: number;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  sessionsByProject: Record<string, { count: number; cost: number }>;
  topSessions: SessionMetadata[];
}

export interface DailyStats {
  date: string;
  sessions: number;
  cost: number;
  inputTokens: number;
  outputTokens: number;
}

const STATS_CACHE_KEY = "claudecast-stats-cache";
const STATS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CachedStats {
  stats: UsageStats;
  timestamp: number;
}

/**
 * Get usage statistics for today
 */
export async function getTodayStats(): Promise<UsageStats> {
  const allSessions = await listAllSessions();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySessions = allSessions.filter((s) => s.lastModified >= today);

  return calculateStats(todaySessions);
}

/**
 * Get usage statistics for this week
 */
export async function getWeekStats(): Promise<UsageStats> {
  const allSessions = await listAllSessions();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const weekSessions = allSessions.filter((s) => s.lastModified >= weekAgo);

  return calculateStats(weekSessions);
}

/**
 * Get usage statistics for this month
 */
export async function getMonthStats(): Promise<UsageStats> {
  const allSessions = await listAllSessions();

  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  monthAgo.setHours(0, 0, 0, 0);

  const monthSessions = allSessions.filter((s) => s.lastModified >= monthAgo);

  return calculateStats(monthSessions);
}

/**
 * Get all-time usage statistics (cached)
 */
export async function getAllTimeStats(): Promise<UsageStats> {
  // Check cache
  const cached = await LocalStorage.getItem<string>(STATS_CACHE_KEY);
  if (cached) {
    const cachedStats: CachedStats = JSON.parse(cached);
    if (Date.now() - cachedStats.timestamp < STATS_CACHE_TTL) {
      return cachedStats.stats;
    }
  }

  // Calculate fresh stats
  const allSessions = await listAllSessions();
  const stats = calculateStats(allSessions);

  // Cache the result
  await LocalStorage.setItem(
    STATS_CACHE_KEY,
    JSON.stringify({
      stats,
      timestamp: Date.now(),
    }),
  );

  return stats;
}

/**
 * Get daily stats for the last N days
 */
export async function getDailyStats(days: number = 7): Promise<DailyStats[]> {
  const allSessions = await listAllSessions();

  const dailyStats: DailyStats[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const daySessions = allSessions.filter(
      (s) => s.lastModified >= date && s.lastModified < nextDate,
    );

    const stats = calculateStats(daySessions);

    dailyStats.push({
      date: date.toISOString().split("T")[0],
      sessions: stats.totalSessions,
      cost: stats.totalCost,
      inputTokens: stats.totalInputTokens,
      outputTokens: stats.totalOutputTokens,
    });
  }

  return dailyStats.reverse();
}

/**
 * Calculate stats from a list of sessions
 */
function calculateStats(sessions: SessionMetadata[]): UsageStats {
  let totalCost = 0;
  const totalInputTokens = 0;
  const totalOutputTokens = 0;
  const sessionsByProject: Record<string, { count: number; cost: number }> = {};

  for (const session of sessions) {
    totalCost += session.cost || 0;

    // Group by project
    if (!sessionsByProject[session.projectName]) {
      sessionsByProject[session.projectName] = { count: 0, cost: 0 };
    }
    sessionsByProject[session.projectName].count++;
    sessionsByProject[session.projectName].cost += session.cost || 0;
  }

  // Sort sessions by cost to get top expensive ones
  const topSessions = [...sessions]
    .filter((s) => s.cost > 0)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  return {
    totalSessions: sessions.length,
    totalCost,
    totalInputTokens,
    totalOutputTokens,
    sessionsByProject,
    topSessions,
  };
}

/**
 * Format cost as currency string
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${cost.toFixed(4)}`;
  }
  return `$${cost.toFixed(2)}`;
}

/**
 * Format token count
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Generate ASCII bar chart for daily costs
 */
export function generateCostChart(dailyStats: DailyStats[]): string {
  const maxCost = Math.max(...dailyStats.map((d) => d.cost), 0.01);
  const barWidth = 20;

  let chart = "```\n";
  chart += "Daily Cost (last 7 days)\n";
  chart += "─".repeat(35) + "\n";

  for (const day of dailyStats) {
    const date = day.date.slice(5); // MM-DD
    const barLength = Math.round((day.cost / maxCost) * barWidth);
    const bar = "█".repeat(barLength) + "░".repeat(barWidth - barLength);
    chart += `${date} │${bar}│ ${formatCost(day.cost)}\n`;
  }

  chart += "```";
  return chart;
}

/**
 * Generate project breakdown table
 */
export function generateProjectTable(
  sessionsByProject: Record<string, { count: number; cost: number }>,
): string {
  const sorted = Object.entries(sessionsByProject)
    .sort(([, a], [, b]) => b.cost - a.cost)
    .slice(0, 10);

  if (sorted.length === 0) {
    return "No project data available.";
  }

  let table = "| Project | Sessions | Cost |\n";
  table += "|---------|----------|------|\n";

  for (const [project, stats] of sorted) {
    table += `| ${project} | ${stats.count} | ${formatCost(stats.cost)} |\n`;
  }

  return table;
}

/**
 * Check if there's an active Claude Code process
 */
export async function isClaudeActive(): Promise<boolean> {
  try {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execPromise = promisify(exec);

    const { stdout } = await execPromise("pgrep -x claude || true");
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}
