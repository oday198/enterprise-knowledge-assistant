const WORKSPACE_STORAGE_KEY = "eka-workspace-id";

function generateFallbackWorkspaceId(): string {
  return `ws-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getWorkspaceId(): string {
  if (typeof window === "undefined") {
    return "server-workspace";
  }

  let workspaceId = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);

  if (!workspaceId) {
    workspaceId =
      window.crypto?.randomUUID?.() ?? generateFallbackWorkspaceId();

    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
  }

  return workspaceId;
}