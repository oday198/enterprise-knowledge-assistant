from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentCreate(BaseModel):
    filename: str
    storage_path: str
    content_hash: str | None = None
    status: str = "uploaded"


class DocumentRead(BaseModel):
    id: str
    filename: str
    storage_path: str
    content_hash: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChunkCreate(BaseModel):
    document_id: str
    chunk_index: int
    page_number: int | None = None
    text: str
    token_count: int | None = None
    embedding_id: str | None = None


class ChunkRead(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    page_number: int | None
    text: str
    token_count: int | None
    embedding_id: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentIngestionResponse(BaseModel):
    document: DocumentRead
    chunk_count: int


class DocumentDetailResponse(BaseModel):
    document: DocumentRead
    chunks: list[ChunkRead]


class DocumentDeleteResponse(BaseModel):
    document_id: str
    deleted_chunk_count: int
    message: str


class RebuildIndexResponse(BaseModel):
    total_chunks: int
    indexed_chunks: int
    message: str