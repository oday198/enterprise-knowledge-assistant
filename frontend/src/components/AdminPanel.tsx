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
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">Index</h3>
        <p className="mt-1 text-sm text-slate-500">Sync the vector index with stored chunks.</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleRebuild}
          disabled={loading}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Rebuilding..." : "Rebuild index"}
        </button>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}