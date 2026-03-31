const WORKSPACE_STORAGE_KEY = "eka-workspace-id";

export function getWorkspaceId(): string {
  if (typeof window === "undefined") {
    return "server-workspace";
  }

  let workspaceId = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);

  if (!workspaceId) {
    workspaceId = crypto.randomUUID();
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
  }

  return workspaceId;
}