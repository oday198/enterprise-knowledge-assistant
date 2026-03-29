from pydantic import BaseModel


class QueryRequest(BaseModel):
    question: str
    top_k: int = 5
    document_id: str | None = None


class QuerySource(BaseModel):
    chunk_id: str
    document_id: str
    filename: str
    page_number: int | None
    chunk_index: int
    text_preview: str


class QueryResponse(BaseModel):
    answer: str
    sources: list[QuerySource]