import { useEffect, useState } from "react";

import { apiClient } from "../api/client";
import type { DocumentRead, QueryResponse } from "../types/api";

type QueryPanelProps = {
  documents: DocumentRead[];
  onQuerySuccess: (payload: QueryResponse) => void;
};

export function QueryPanel({ documents, onQuerySuccess }: QueryPanelProps) {
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(5);
  const [selectedDocumentId, setSelectedDocumentId] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDocumentId === "ALL") return;

    const exists = documents.some((document) => document.id === selectedDocumentId);
    if (!exists) {
      setSelectedDocumentId("ALL");
    }
  }, [documents, selectedDocumentId]);

  const handleAsk = async () => {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<QueryResponse>("/query", {
        question,
        top_k: topK,
        document_id: selectedDocumentId === "ALL" ? null : selectedDocumentId,
      });

      onQuerySuccess(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Query failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
      <h2 className="text-lg font-semibold">Ask a Question</h2>

      <div className="mt-4 space-y-4">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask something about the uploaded documents..."
          rows={4}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
        />

        <div className="space-y-3">
          <div>
            <label className="mb-2 block text-sm text-slate-400">Document Scope</label>
            <select
              value={selectedDocumentId}
              onChange={(event) => setSelectedDocumentId(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
            >
              <option value="ALL">All Documents</option>
              {documents.map((document) => (
                <option key={document.id} value={document.id}>
                  {document.filename}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400">Top K</label>
            <select
              value={topK}
              onChange={(event) => setTopK(Number(event.target.value))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={7}>7</option>
              <option value={10}>10</option>
            </select>

            <button
              onClick={handleAsk}
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Asking..." : "Ask"}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}