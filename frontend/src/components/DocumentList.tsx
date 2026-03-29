import type { DocumentRead } from "../types/api";

type DocumentListProps = {
  documents: DocumentRead[];
  loading?: boolean;
  onRefresh?: () => void;
  onDelete?: (documentId: string) => void;
  deletingDocumentId?: string | null;
};

export function DocumentList({
  documents,
  loading = false,
  onRefresh,
  onDelete,
  deletingDocumentId = null,
}: DocumentListProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Indexed Documents</h2>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            Refresh
          </button>
        )}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-slate-400">Loading documents...</p>
      ) : documents.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-sm text-slate-400">
          No documents uploaded yet. Upload a PDF to start indexing and querying.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-100">{document.filename}</p>
                  <p className="mt-3 text-xs text-slate-500 break-all">
                    ID: {document.id}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300">
                    {document.status}
                  </span>

                  {onDelete && (
                    <button
                      onClick={() => onDelete(document.id)}
                      disabled={deletingDocumentId === document.id}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingDocumentId === document.id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}