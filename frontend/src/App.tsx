import { useEffect, useState } from "react";

import { apiClient } from "./api/client";
import { AdminPanel } from "./components/AdminPanel";
import { DocumentList } from "./components/DocumentList";
import { DocumentUpload } from "./components/DocumentUpload";
import { Layout } from "./components/Layout";
import { QueryPanel } from "./components/QueryPanel";
import { SourcesPanel } from "./components/SourcesPanel";
import type {
  DocumentDeleteResponse,
  DocumentRead,
  DocumentUploadResponse,
  HealthResponse,
  QueryResponse,
} from "./types/api";

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentRead[]>([]);
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const response = await apiClient.get<HealthResponse>("/health");
      setHealth(response.data);
    } catch {
      setError("Failed to connect to backend.");
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await apiClient.get<DocumentRead[]>("/documents");
      setDocuments(response.data);
    } catch {
      setError("Failed to load documents.");
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchDocuments();
  }, []);

  const handleUploadSuccess = (payload: DocumentUploadResponse) => {
    setDocuments((prev) => {
      const exists = prev.some((doc) => doc.id === payload.document.id);
      if (exists) {
        return prev.map((doc) => (doc.id === payload.document.id ? payload.document : doc));
      }
      return [payload.document, ...prev];
    });
  };

  const handleDeleteDocument = async (documentId: string) => {
    const confirmed = window.confirm("Delete this document?");
    if (!confirmed) return;

    setDeletingDocumentId(documentId);

    try {
      await apiClient.delete<DocumentDeleteResponse>(`/documents/${documentId}`);
      setDocuments((prev) => prev.filter((document) => document.id !== documentId));
      setQueryResult(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to delete document.");
    } finally {
      setDeletingDocumentId(null);
    }
  };

  return (
    <Layout>
      <section className="mb-14">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900">
            Ask your documents
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Upload PDFs, search them with AI, and get concise answers backed by sources.
          </p>

          <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {loadingHealth ? "Checking..." : health?.status ?? "offline"}
            </span>

            {documents.length > 0 && (
              <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                {documents.length} document{documents.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </div>
      </section>

      <section className="grid gap-10 xl:grid-cols-12">
        <div className="space-y-8 xl:col-span-3">
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
          <AdminPanel onRebuildSuccess={fetchDocuments} />
        </div>

        <div className="space-y-8 xl:col-span-4">
          <QueryPanel documents={documents} onQuerySuccess={setQueryResult} />
          <DocumentList
            documents={documents}
            loading={loadingDocuments}
            onRefresh={fetchDocuments}
            onDelete={handleDeleteDocument}
            deletingDocumentId={deletingDocumentId}
          />
        </div>

        <div className="xl:col-span-5">
          <SourcesPanel result={queryResult} />
        </div>
      </section>
    </Layout>
  );
}

export default App;