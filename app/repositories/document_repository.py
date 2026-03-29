from sqlalchemy.orm import Session

from app.core.constants import DOCUMENT_STATUS_FAILED
from app.db.models import Document
from app.schemas.documents import DocumentCreate


class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, payload: DocumentCreate) -> Document:
        document = Document(**payload.model_dump())
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def get_by_id(self, document_id: str) -> Document | None:
        return self.db.query(Document).filter(Document.id == document_id).first()

    def get_by_content_hash(self, content_hash: str) -> Document | None:
        return (
            self.db.query(Document)
            .filter(
                Document.content_hash == content_hash,
                Document.status != DOCUMENT_STATUS_FAILED,
            )
            .order_by(Document.created_at.desc())
            .first()
        )

    def list_all(self) -> list[Document]:
        return self.db.query(Document).order_by(Document.created_at.desc()).all()

    def update_status(self, document_id: str, status: str) -> Document | None:
        document = self.get_by_id(document_id)
        if not document:
            return None
        document.status = status
        self.db.commit()
        self.db.refresh(document)
        return document

    def delete(self, document_id: str) -> Document | None:
        document = self.get_by_id(document_id)
        if not document:
            return None
        self.db.delete(document)
        self.db.commit()
        return document