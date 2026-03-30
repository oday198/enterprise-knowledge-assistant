import type { QueryResponse } from "../types/api";

type SourcesPanelProps = {
  result: QueryResponse | null;
};

export function SourcesPanel({ result }: SourcesPanelProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Answer</h3>

        {!result ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
            Your answer will appear here.
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <p className="whitespace-pre-wrap text-[15px] leading-8 text-slate-700">
              {result.answer}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Sources</h3>

        {!result || result.sources.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
            Relevant source excerpts will appear here.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {result.sources.map((source) => (
              <div
                key={source.chunk_id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">{source.filename}</p>
                  <span className="text-xs text-slate-400">·</span>
                  <p className="text-xs text-slate-500">
                    Page {source.page_number ?? "-"}, Chunk {source.chunk_index}
                  </p>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-700">
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