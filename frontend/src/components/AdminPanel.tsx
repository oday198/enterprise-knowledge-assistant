import { useState } from "react";

import { apiClient } from "../api/client";
import type { RebuildIndexResponse } from "../types/api";

type AdminPanelProps = {
  onRebuildSuccess?: () => void;
};

export function AdminPanel({ onRebuildSuccess }: AdminPanelProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRebuild = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiClient.post<RebuildIndexResponse>("/documents/rebuild-index");
      setMessage(
        `${response.data.message} Indexed ${response.data.indexed_chunks}/${response.data.total_chunks} chunks.`
      );
      onRebuildSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Rebuild index failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
      <h2 className="text-lg font-semibold">Index Operations</h2>

      <div className="mt-4 space-y-4">
        <button
          onClick={handleRebuild}
          disabled={loading}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Rebuilding..." : "Rebuild Index"}
        </button>

        {message && <p className="text-sm text-emerald-400">{message}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}