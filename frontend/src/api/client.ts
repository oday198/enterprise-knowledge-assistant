import axios from "axios";

import { getWorkspaceId } from "../lib/workspace";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers["X-Workspace-ID"] = getWorkspaceId();
  return config;
});