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
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">Ask</h3>
        <p className="mt-1 text-sm text-slate-500">Ask across all documents or one selected file.</p>
      </div>

      <div className="space-y-5">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="What is this document about?"
          rows={5}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white"
        />

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Scope</label>
            <select
              value={selectedDocumentId}
              onChange={(event) => setSelectedDocumentId(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none"
            >
              <option value="ALL">All documents</option>
              {documents.map((document) => (
                <option key={document.id} value={document.id}>
                  {document.filename}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Top K</label>
              <select
                value={topK}
                onChange={(event) => setTopK(Number(event.target.value))}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={7}>7</option>
                <option value={10}>10</option>
              </select>
            </div>

            <button
              onClick={handleAsk}
              disabled={loading}
              className="mt-7 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Asking..." : "Ask"}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}