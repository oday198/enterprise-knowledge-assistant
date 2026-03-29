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

    def list_by_document(self, document_id: str) -> list[Chunk]:
        return (
            self.db.query(Chunk)
            .filter(Chunk.document_id == document_id)
            .order_by(Chunk.chunk_index.asc())
            .all()
        )

    def list_all(self) -> list[Chunk]:
        return self.db.query(Chunk).order_by(Chunk.created_at.asc()).all()

    def count_by_document(self, document_id: str) -> int:
        return self.db.query(Chunk).filter(Chunk.document_id == document_id).count()

    def delete_by_document(self, document_id: str) -> None:
        self.db.query(Chunk).filter(Chunk.document_id == document_id).delete()
        self.db.commit()
