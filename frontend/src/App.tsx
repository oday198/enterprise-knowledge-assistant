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
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">AI Knowledge Workspace</h2>
        <p className="mt-2 text-slate-400">
          Upload enterprise PDFs, index them with embeddings, and ask grounded questions with source-aware answers.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <h2 className="text-lg font-semibold">System Status</h2>

            {loadingHealth && <p className="mt-4 text-slate-400">Checking backend...</p>}

            {error && <p className="mt-4 text-red-400">{error}</p>}

            {health && (
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>
                  <span className="font-medium text-slate-100">Status:</span> {health.status}
                </p>
                <p>
                  <span className="font-medium text-slate-100">Service:</span> {health.service}
                </p>
                <p>
                  <span className="font-medium text-slate-100">Environment:</span>{" "}
                  {health.environment}
                </p>
              </div>
            )}
          </div>

          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
          <AdminPanel onRebuildSuccess={fetchDocuments} />
        </div>

        <div className="space-y-6 xl:col-span-4">
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