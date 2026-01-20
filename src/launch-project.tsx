import {
  Action,
  ActionPanel,
  Color,
  Icon,
  List,
  showToast,
  Toast,
  Form,
  popToRoot,
} from "@raycast/api";
import { useState, useEffect } from "react";
import {
  getAllProjects,
  addFavorite,
  removeFavorite,
  addRecentProject,
  getGitInfo,
  Project,
} from "./lib/project-discovery";
import { launchClaudeCode, openTerminalWithCommand } from "./lib/terminal";

export default function LaunchProject() {
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Project[]>([]);
  const [recent, setRecent] = useState<Project[]>([]);
  const [all, setAll] = useState<Project[]>([]);
  const [searchText, setSearchText] = useState("");

  async function loadProjects() {
    setIsLoading(true);
    const projects = await getAllProjects();
    setFavorites(projects.favorites);
    setRecent(projects.recent);
    setAll(projects.all);
    setIsLoading(false);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredFavorites = favorites.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase()),
  );
  const filteredRecent = recent.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase()),
  );
  const filteredAll = all.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search projects..."
      onSearchTextChange={setSearchText}
    >
      {filteredFavorites.length > 0 && (
        <List.Section
          title="Favorites"
          subtitle={`${filteredFavorites.length} projects`}
        >
          {filteredFavorites.map((project) => (
            <ProjectItem
              key={project.path}
              project={project}
              onToggleFavorite={async () => {
                await removeFavorite(project.path);
                loadProjects();
              }}
            />
          ))}
        </List.Section>
      )}

      {filteredRecent.length > 0 && (
        <List.Section
          title="Recent"
          subtitle={`${filteredRecent.length} projects`}
        >
          {filteredRecent.map((project) => (
            <ProjectItem
              key={project.path}
              project={project}
              onToggleFavorite={async () => {
                await addFavorite(project.path);
                loadProjects();
              }}
            />
          ))}
        </List.Section>
      )}

      {filteredAll.length > 0 && (
        <List.Section
          title="All Projects"
          subtitle={`${filteredAll.length} projects`}
        >
          {filteredAll.map((project) => (
            <ProjectItem
              key={project.path}
              project={project}
              onToggleFavorite={async () => {
                await addFavorite(project.path);
                loadProjects();
              }}
            />
          ))}
        </List.Section>
      )}

      {!isLoading &&
        filteredFavorites.length === 0 &&
        filteredRecent.length === 0 &&
        filteredAll.length === 0 && (
          <List.EmptyView
            title="No Projects Found"
            description="Run Claude Code in a project directory to see it here, or open a project in VS Code."
            icon={Icon.Folder}
          />
        )}
    </List>
  );
}

function ProjectItem({
  project,
  onToggleFavorite,
}: {
  project: Project;
  onToggleFavorite: () => void;
}) {
  const [gitInfo, setGitInfo] = useState<{
    branch: string;
    hasChanges: boolean;
    remote?: string;
  } | null>(null);

  useEffect(() => {
    getGitInfo(project.path).then(setGitInfo);
  }, [project.path]);

  const accessories: List.Item.Accessory[] = [];

  if (project.sessionCount && project.sessionCount > 0) {
    accessories.push({
      text: `${project.sessionCount} session${project.sessionCount > 1 ? "s" : ""}`,
      icon: Icon.Message,
    });
  }

  if (gitInfo?.branch) {
    accessories.push({
      tag: {
        value: gitInfo.branch,
        color: gitInfo.hasChanges ? Color.Yellow : Color.Green,
      },
      icon: Icon.ArrowNe,
    });
  }

  if (project.lastAccessed) {
    accessories.push({
      date: project.lastAccessed,
      tooltip: `Last accessed: ${project.lastAccessed.toLocaleString()}`,
    });
  }

  async function handleLaunch() {
    await addRecentProject(project.path);
    await launchClaudeCode({ projectPath: project.path });
    await popToRoot();
  }

  async function handleContinue() {
    await addRecentProject(project.path);
    await launchClaudeCode({
      projectPath: project.path,
      continueSession: true,
    });
    await popToRoot();
  }

  return (
    <List.Item
      title={project.name}
      subtitle={project.path}
      icon={
        project.isFavorite
          ? { source: Icon.Star, tintColor: Color.Yellow }
          : Icon.Folder
      }
      accessories={accessories}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Launch">
            <Action
              title="New Session"
              icon={Icon.Plus}
              onAction={handleLaunch}
            />
            <Action
              title="Continue Last Session"
              icon={Icon.ArrowRight}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
              onAction={handleContinue}
            />
            <Action.Push
              title="Continue with Prompt"
              icon={Icon.Message}
              shortcut={{ modifiers: ["cmd"], key: "p" }}
              target={<ContinueWithPromptForm project={project} />}
            />
          </ActionPanel.Section>

          <ActionPanel.Section title="Open">
            <Action
              title="Open in VS Code"
              icon={Icon.Code}
              shortcut={{ modifiers: ["cmd"], key: "o" }}
              onAction={async () => {
                await openTerminalWithCommand(`code "${project.path}"`);
                await popToRoot();
              }}
            />
            <Action.ShowInFinder path={project.path} />
            <Action
              title="Open in Terminal"
              icon={Icon.Terminal}
              shortcut={{ modifiers: ["cmd", "shift"], key: "t" }}
              onAction={async () => {
                await openTerminalWithCommand(`cd "${project.path}" && $SHELL`);
                await popToRoot();
              }}
            />
          </ActionPanel.Section>

          <ActionPanel.Section title="Organize">
            <Action
              title={
                project.isFavorite
                  ? "Remove from Favorites"
                  : "Add to Favorites"
              }
              icon={project.isFavorite ? Icon.StarDisabled : Icon.Star}
              shortcut={{ modifiers: ["cmd"], key: "f" }}
              onAction={onToggleFavorite}
            />
            <Action.CopyToClipboard
              title="Copy Path"
              content={project.path}
              shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

function ContinueWithPromptForm({ project }: { project: Project }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: { prompt: string }) {
    if (!values.prompt.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Please enter a prompt",
      });
      return;
    }

    setIsLoading(true);
    await addRecentProject(project.path);
    await launchClaudeCode({
      projectPath: project.path,
      continueSession: true,
      prompt: values.prompt,
    });
    await popToRoot();
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Continue with Prompt"
            icon={Icon.Message}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.Description
        title="Project"
        text={`${project.name} (${project.path})`}
      />
      <Form.TextArea
        id="prompt"
        title="Prompt"
        placeholder="Enter your prompt to continue the session..."
        autoFocus
      />
    </Form>
  );
}
