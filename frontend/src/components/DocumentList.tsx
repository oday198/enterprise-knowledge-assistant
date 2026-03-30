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
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Documents</h3>
          <p className="mt-1 text-sm text-slate-500">Indexed files in your workspace.</p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
          >
            Refresh
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading documents...</p>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          No documents uploaded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {document.filename}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{document.status}</p>
                </div>

                {onDelete && (
                  <button
                    onClick={() => onDelete(document.id)}
                    disabled={deletingDocumentId === document.id}
                    className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingDocumentId === document.id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}