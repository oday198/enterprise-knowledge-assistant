import type { QueryResponse } from "../types/api";

type SourcesPanelProps = {
  result: QueryResponse | null;
};

export function SourcesPanel({ result }: SourcesPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Answer</h2>

        {!result ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-sm text-slate-400">
            Ask a question to generate an answer from the indexed documents.
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
              {result.answer}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Sources</h2>

        {!result || result.sources.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-sm text-slate-400">
            No sources available yet.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {result.sources.map((source) => (
              <div
                key={source.chunk_id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <p className="text-sm font-medium text-slate-100">
                  {source.filename}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Page: {source.page_number ?? "-"} | Chunk: {source.chunk_index}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {source.text_preview}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}