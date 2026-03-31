from sqlalchemy.orm import Session

from app.db.models import Chunk
from app.schemas.documents import ChunkCreate


class ChunkRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_many(self, payloads: list[ChunkCreate]) -> list[Chunk]:
        chunks = [Chunk(**payload.model_dump()) for payload in payloads]
        self.db.add_all(chunks)
        self.db.commit()

        for chunk in chunks:
            self.db.refresh(chunk)

        return chunks

    def list_by_document(self, document_id: str, workspace_id: str | None = None) -> list[Chunk]:
        query = self.db.query(Chunk).filter(Chunk.document_id == document_id)

        if workspace_id:
            query = query.filter(Chunk.workspace_id == workspace_id)

        return query.order_by(Chunk.chunk_index.asc()).all()

    def list_all(self, workspace_id: str | None = None) -> list[Chunk]:
        query = self.db.query(Chunk)

        if workspace_id:
            query = query.filter(Chunk.workspace_id == workspace_id)

        return query.order_by(Chunk.created_at.asc()).all()

    def count_by_document(self, document_id: str, workspace_id: str | None = None) -> int:
        query = self.db.query(Chunk).filter(Chunk.document_id == document_id)

        if workspace_id:
            query = query.filter(Chunk.workspace_id == workspace_id)

        return query.count()

    def delete_by_document(self, document_id: str, workspace_id: str | None = None) -> None:
        query = self.db.query(Chunk).filter(Chunk.document_id == document_id)

        if workspace_id:
            query = query.filter(Chunk.workspace_id == workspace_id)

        query.delete()
        self.db.commit()