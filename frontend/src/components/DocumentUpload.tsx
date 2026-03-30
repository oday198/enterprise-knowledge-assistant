import { useState } from "react";

import { apiClient } from "../api/client";
import type { DocumentUploadResponse } from "../types/api";

type DocumentUploadProps = {
  onUploadSuccess: (payload: DocumentUploadResponse) => void;
};

export function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await apiClient.post<DocumentUploadResponse>(
        "/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onUploadSuccess(response.data);
      setMessage(
        `Uploaded successfully. Status: ${response.data.document.status}. Chunks: ${response.data.chunk_count}`
      );
      setSelectedFile(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">Upload</h3>
        <p className="mt-1 text-sm text-slate-500">Add a PDF to the workspace.</p>
      </div>

      <div className="space-y-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={(event) => {
            const file = event.target.files?.[0] || null;
            setSelectedFile(file);
          }}
          className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Upload document"}
        </button>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}