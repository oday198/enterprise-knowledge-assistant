export type HealthResponse = {
  status: string;
  service: string;
  environment?: string;
};

export type DocumentRead = {
  id: string;
  filename: string;
  storage_path: string;
  content_hash?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type DocumentUploadResponse = {
  document: DocumentRead;
  chunk_count: number;
};

export type DocumentDeleteResponse = {
  document_id: string;
  deleted_chunk_count: number;
  message: string;
};

export type RebuildIndexResponse = {
  total_chunks: number;
  indexed_chunks: number;
  message: string;
};

export type QuerySource = {
  chunk_id: string;
  document_id: string;
  filename: string;
  page_number?: number | null;
  chunk_index: number;
  text_preview: string;
};

export type QueryResponse = {
  answer: string;
  sources: QuerySource[];
};