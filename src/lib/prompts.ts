import { LocalStorage } from "@raycast/api";

export type PromptCategory =
  | "planning"
  | "tdd"
  | "review"
  | "refactoring"
  | "debugging"
  | "docs"
  | "advanced";

export interface PromptVariable {
  name: string;
  description: string;
  default?: string;
  type?: "text" | "code" | "selection" | "path";
  /** For code variables: allow user to specify a repository path instead of pasting code */
  allowRepositoryPath?: boolean;
  /** For path variables: whether to allow directory selection (default: true) */
  allowDirectories?: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  description: string;
  prompt: string;
  variables: PromptVariable[];
  systemPrompt?: string;
  model?: "sonnet" | "opus" | "haiku";
  usageCount: number;
  isBuiltIn: boolean;
  icon?: string;
}

const CUSTOM_PROMPTS_KEY = "claudecast-custom-prompts";
const PROMPT_USAGE_KEY = "claudecast-prompt-usage";

// Built-in curated prompts
export const BUILT_IN_PROMPTS: PromptTemplate[] = [
  // Planning & Architecture
  {
    id: "spec-driven-planning",
    name: "Spec-Driven Planning",
    category: "planning",
    description: "Create a detailed spec before writing code",
    prompt: `Before writing any code, create a detailed specification for {{feature}}.{{#if projectPath}}

Create this project in: {{projectPath}}{{/if}}

Include:
1. **Requirements**: What exactly should this feature do?
2. **Edge Cases**: What unusual inputs or states should be handled?
3. **Data Flow**: How does data move through the system?
4. **API Contracts**: What interfaces are needed?
5. **Testing Strategy**: How will we verify this works?

Be thorough but practical. Focus on decisions that will affect implementation.`,
    variables: [
      { name: "feature", description: "The feature to plan", type: "text" },
      {
        name: "projectPath",
        description: "Path to create the new project (optional)",
        type: "path",
        allowDirectories: true,
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    icon: "📋",
  },
  {
    id: "architecture-review",
    name: "Architecture Review",
    category: "planning",
    description: "Review and suggest improvements to component architecture",
    prompt: `Review the architecture of {{component}} and suggest improvements.

Consider:
- **Separation of Concerns**: Is responsibility properly divided?
- **Scalability**: Will this handle growth?
- **Testability**: Can components be tested in isolation?
- **Maintainability**: Is it easy to understand and modify?
- **Dependencies**: Are there problematic couplings?

Provide specific, actionable suggestions with code examples where helpful.`,
    variables: [
      {
        name: "component",
        description: "Component or module to review",
        type: "text",
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    icon: "🏗️",
  },

  // Test-Driven Development
  {
    id: "tdd-kickoff",
    name: "TDD Kickoff",
    category: "tdd",
    description: "Start TDD by writing failing tests first",
    prompt: `We're doing TDD for {{feature}}.

Expected behaviors:
{{behaviors}}

Write comprehensive failing tests based on these expected behaviors.

Rules:
- Do NOT implement the feature yet - only write tests
- Cover happy paths, edge cases, and error conditions
- Use descriptive test names that document behavior
- Group related tests logically

After writing the tests, explain what each test verifies.`,
    variables: [
      { name: "feature", description: "Feature to test", type: "text" },
      {
        name: "behaviors",
        description: "Expected behaviors (one per line)",
        type: "text",
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    icon: "🧪",
  },
  {
    id: "test-coverage-audit",
    name: "Test Coverage Audit",
    category: "tdd",
    description: "Find untested edge cases and write tests for gaps",
    prompt: `Analyze test coverage for the following code:

{{code}}

Identify:
1. **Untested Edge Cases**: Boundary conditions not covered
2. **Error Paths**: Exception handling not tested
3. **Integration Points**: Interactions that need testing
4. **Data Variations**: Input combinations not verified

For each gap, write a test that would catch potential bugs.`,
    variables: [
      {
        name: "code",
        description: "Code to audit",
        type: "code",
        allowRepositoryPath: true,
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    icon: "📊",
  },

  // Code Review & Security
  {
    id: "security-review",
    name: "Security Review",
    category: "review",
    description: "Check for security vulnerabilities",
    prompt: `Perform a security review of this code:

{{code}}

Check for:
- **Injection vulnerabilities**: SQL, command, XSS, template injection
- **Authentication issues**: Broken auth, session problems
- **Data exposure**: Sensitive data in logs, errors, responses
- **Access control**: Missing authorization checks
- **OWASP Top 10**: Common web vulnerabilities

For each issue found:
1. Describe the vulnerability
2. Show the problematic code
3. Demonstrate potential exploitation
4. Provide a secure fix`,
    variables: [
      {
        name: "code",
        description: "Code to review",
        type: "code",
        allowRepositoryPath: true,
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    model: "opus",
    icon: "🔒",
  },
  {
    id: "performance-audit",
    name: "Performance Audit",
    category: "review",
    description: "Analyze code for performance issues",
    prompt: `Analyze this code for performance issues:

{{code}}

Look for:
- **Time Complexity**: Inefficient algorithms, O(n²) operations
- **Memory Usage**: Unnecessary allocations, memory leaks
- **N+1 Queries**: Database access patterns
- **Blocking Operations**: Sync operations that should be async
- **Caching Opportunities**: Repeated expensive computations

For each issue:
1. Identify the problematic code
2. Explain the impact
3. Suggest an optimized solution with code`,
    variables: [
      {
        name: "code",
        description: "Code to audit",
        type: "code",
        allowRepositoryPath: true,
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    icon: "⚡",
  },
  {
    id: "pr-review",
    name: "PR Review",
    category: "review",
    description: "Review a diff as a senior engineer",
    prompt: `Review this diff as a senior engineer:

{{diff}}

Focus on:
- **Correctness**: Does it do what it's supposed to?
- **Edge Cases**: What inputs/states might break this?
- **Naming**: Are names clear and consistent?
- **Potential Bugs**: Race conditions, off-by-one, null refs
- **Simplification**: Can any code be simplified?

Format as inline review comments with file:line references.
Be specific, constructive, and prioritize important issues.`,
    variables: [
      {
        name: "diff",
        description: "Git diff to review",
        type: "code",
        allowRepositoryPath: true,
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    icon: "👀",
  },

  // Refactoring
  {
    id: "extract-abstraction",
    name: "Extract & Abstract",
    category: "refactoring",
    description: "Extract reusable patterns from code",
    prompt: `Refactor this code by extracting reusable patterns:

{{code}}

Guidelines:
- Only create abstractions if there are 3+ similar usages
- Prefer composition over inheritance
- Keep interfaces small and focused
- Name abstractions after their behavior, not implementation

Show the refactored code and explain each extraction.`,
    variables: [
      {
        name: "code",
        description: "Code to refactor",
        type: "code",
        allowRepositoryPath: true,
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    icon: "🔧",
  },
  {
    id: "simplify-complexity",
    name: "Simplify Complexity",
    category: "refactoring",
    description: "Reduce cyclomatic complexity",
    prompt: `This code has high cyclomatic complexity. Refactor to improve readability:

{{code}}

Techniques to consider:
- Early returns to reduce nesting
- Extract complex conditions to named functions
- Replace conditionals with polymorphism where appropriate
- Use guard clauses
- Extract helper functions

Show the simplified code and explain each change. Preserve all behavior.`,
    variables: [
      {
        name: "code",
        description: "Complex code to simplify",
        type: "code",
        allowRepositoryPath: true,
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    icon: "✨",
  },
  {
    id: "type-strengthening",
    name: "Type Strengthening",
    category: "refactoring",
    description: "Make types more precise and safe",
    prompt: `Strengthen the types in this code:

{{code}}

Goals:
- Replace \`any\` with specific types
- Add discriminated unions where appropriate
- Make impossible states unrepresentable
- Add readonly where mutation isn't needed
- Use branded types for type-safe IDs

Show the improved code with explanations for each type change.`,
    variables: [
      {
        name: "code",
        description: "Code to strengthen types",
        type: "code",
        allowRepositoryPath: true,
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    icon: "💪",
  },

  // Debugging
  {
    id: "error-diagnosis",
    name: "Error Diagnosis",
    category: "debugging",
    description: "Diagnose an error and suggest fixes",
    prompt: `Diagnose this error:

{{error}}

Steps:
1. Parse the error message and stack trace
2. Identify the most likely root cause
3. List potential causes ranked by probability
4. Suggest fixes for each potential cause
5. Provide debugging steps to confirm the diagnosis

If you need more context about the codebase to diagnose properly, list what files or information would help.`,
    variables: [
      {
        name: "error",
        description: "Error message and stack trace",
        type: "text",
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    icon: "🔍",
  },
  {
    id: "debug-strategy",
    name: "Debug Strategy",
    category: "debugging",
    description: "Create a systematic debugging plan",
    prompt: `Create a debugging strategy for this symptom:

{{symptom}}

Provide:
1. **Hypothesis**: What could cause this behavior?
2. **Logging Points**: What should we log and where?
3. **Inspection Points**: What state should we examine?
4. **Bisection Approach**: How to narrow down the cause?
5. **Reproduction Steps**: How to consistently trigger the issue?

Be systematic and start with the most likely causes.`,
    variables: [
      {
        name: "symptom",
        description: "The symptom or unexpected behavior",
        type: "text",
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    icon: "🐛",
  },

  // Documentation
  {
    id: "explain-junior",
    name: "Explain for Junior Dev",
    category: "docs",
    description: "Explain code for a junior developer",
    prompt: `Explain this code as if teaching a junior developer:

{{code}}

Cover:
1. **What it does**: The high-level purpose
2. **How it works**: Step-by-step walkthrough
3. **Why it's designed this way**: Design decisions and tradeoffs
4. **Common pitfalls**: Mistakes to avoid when modifying
5. **Related concepts**: What to learn to understand it better

Use simple language and provide examples where helpful.`,
    variables: [
      {
        name: "code",
        description: "Code to explain",
        type: "code",
        allowRepositoryPath: true,
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    model: "haiku",
    icon: "📚",
  },
  {
    id: "api-documentation",
    name: "API Documentation",
    category: "docs",
    description: "Generate API documentation",
    prompt: `Generate comprehensive API documentation for {{endpoint}}:

Include:
- **Description**: What the endpoint does
- **Request Schema**: Parameters, headers, body format
- **Response Schema**: Success and error response formats
- **Error Codes**: Possible errors and their meanings
- **Examples**: Request/response examples
- **Rate Limits**: If applicable
- **Authentication**: Required auth method

Use OpenAPI-style formatting.`,
    variables: [
      {
        name: "endpoint",
        description: "API endpoint to document",
        type: "text",
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    icon: "📖",
  },
  {
    id: "adr-template",
    name: "Architecture Decision Record",
    category: "docs",
    description: "Create an ADR for a technical decision",
    prompt: `Create an Architecture Decision Record for: {{decision}}

Format:
# ADR-XXX: [Title]

## Status
[Proposed/Accepted/Deprecated/Superseded]

## Context
[What is the issue we're seeing that motivates this decision?]

## Decision
[What is the change we're proposing and/or doing?]

## Consequences
[What becomes easier or harder as a result?]

## Alternatives Considered
[What other options were evaluated?]

Be specific and include technical details.`,
    variables: [
      {
        name: "decision",
        description: "The technical decision to document",
        type: "text",
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    icon: "📝",
  },

  // Advanced Multi-Step
  {
    id: "feature-pipeline",
    name: "Feature Pipeline",
    category: "advanced",
    description:
      "Full feature implementation with planning, coding, testing, and review",
    prompt: `Implement {{feature}} using the full development pipeline:{{#if projectPath}}

Create this project in: {{projectPath}}{{/if}}

**Phase 1 - Architect**
- Review requirements and identify edge cases
- Design the implementation approach
- Define interfaces and data structures

**Phase 2 - Builder**
- Implement the feature following the design
- Add error handling and logging
- Keep code clean and well-documented

**Phase 3 - QA**
- Write comprehensive tests
- Cover edge cases and error paths
- Verify the implementation

**Phase 4 - Reviewer**
- Review for bugs and issues
- Check for security concerns
- Suggest improvements

Present each phase's output clearly labeled.`,
    variables: [
      { name: "feature", description: "Feature to implement", type: "text" },
      {
        name: "projectPath",
        description: "Path to create the new project (optional)",
        type: "path",
        allowDirectories: true,
      },
    ],
    isBuiltIn: true,
    usageCount: 0,
    model: "opus",
    icon: "🚀",
  },
  {
    id: "codebase-onboarding",
    name: "Codebase Onboarding Guide",
    category: "advanced",
    description: "Create an onboarding guide for the codebase",
    prompt: `Create an onboarding guide for this codebase.

Explore and document:
1. **Entry Points**: Where does execution start?
2. **Core Abstractions**: What are the key classes/modules?
3. **Data Flow**: How does data move through the system?
4. **Key Files**: What are the most important files to understand?
5. **Patterns**: What patterns are used consistently?
6. **Configuration**: How is the app configured?
7. **Development Setup**: How to run locally?

Format as a guide a new team member could follow.`,
    variables: [],
    isBuiltIn: true,
    usageCount: 0,
    icon: "🗺️",
  },
];

/**
 * Get all prompts (built-in + custom)
 */
export async function getAllPrompts(): Promise<PromptTemplate[]> {
  const customPrompts = await getCustomPrompts();
  const usageCounts = await getUsageCounts();

  // Merge usage counts into built-in prompts
  const builtInWithUsage = BUILT_IN_PROMPTS.map((p) => ({
    ...p,
    usageCount: usageCounts[p.id] || 0,
  }));

  return [...builtInWithUsage, ...customPrompts];
}

/**
 * Get custom user prompts
 */
async function getCustomPrompts(): Promise<PromptTemplate[]> {
  const stored = await LocalStorage.getItem<string>(CUSTOM_PROMPTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save a custom prompt
 */
export async function saveCustomPrompt(
  prompt: Omit<PromptTemplate, "id" | "isBuiltIn">,
): Promise<void> {
  const customs = await getCustomPrompts();
  const newPrompt: PromptTemplate = {
    ...prompt,
    id: `custom-${Date.now()}`,
    isBuiltIn: false,
  };
  customs.push(newPrompt);
  await LocalStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(customs));
}

/**
 * Delete a custom prompt
 */
export async function deleteCustomPrompt(id: string): Promise<void> {
  const customs = await getCustomPrompts();
  const filtered = customs.filter((p) => p.id !== id);
  await LocalStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(filtered));
}

/**
 * Get usage counts
 */
async function getUsageCounts(): Promise<Record<string, number>> {
  const stored = await LocalStorage.getItem<string>(PROMPT_USAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

/**
 * Increment usage count for a prompt
 */
export async function incrementUsageCount(id: string): Promise<void> {
  const counts = await getUsageCounts();
  counts[id] = (counts[id] || 0) + 1;
  await LocalStorage.setItem(PROMPT_USAGE_KEY, JSON.stringify(counts));
}

/**
 * Get prompts by category
 */
export function getPromptsByCategory(
  prompts: PromptTemplate[],
  category: PromptCategory,
): PromptTemplate[] {
  return prompts.filter((p) => p.category === category);
}

/**
 * Get category display info
 */
export function getCategoryInfo(category: PromptCategory): {
  name: string;
  icon: string;
} {
  const info: Record<PromptCategory, { name: string; icon: string }> = {
    planning: { name: "Planning & Architecture", icon: "📋" },
    tdd: { name: "Test-Driven Development", icon: "🧪" },
    review: { name: "Code Review & Security", icon: "👀" },
    refactoring: { name: "Refactoring", icon: "🔧" },
    debugging: { name: "Debugging", icon: "🐛" },
    docs: { name: "Documentation", icon: "📚" },
    advanced: { name: "Advanced Workflows", icon: "🚀" },
  };
  return info[category];
}

/**
 * Substitute variables in a prompt
 */
export function substituteVariables(
  prompt: string,
  variables: Record<string, string>,
): string {
  let result = prompt;

  // Handle {{#if varName}}...{{/if}} conditional blocks
  result = result.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, varName, content) => {
      const value = variables[varName];
      if (value && value.trim()) {
        // Include the content and substitute variables within it
        return content;
      }
      return "";
    },
  );

  // Substitute regular {{varName}} placeholders
  for (const [name, value] of Object.entries(variables)) {
    result = result.replace(
      new RegExp(`\\{\\{${name}\\}\\}`, "g"),
      value || "",
    );
  }
  return result;
}
