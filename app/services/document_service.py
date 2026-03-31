import logging

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.constants import (
    DOCUMENT_STATUS_FAILED,
    DOCUMENT_STATUS_INDEXED,
    DOCUMENT_STATUS_PROCESSING,
)
from app.core.exceptions import (
    ExternalServiceAppException,
    NotFoundAppException,
    ValidationAppException,
)
from app.embeddings.openai_embedder import OpenAIEmbedder
from app.ingestion.chunker import chunk_text
from app.ingestion.pdf_parser import extract_pdf_pages
from app.ingestion.text_cleaner import clean_text
from app.repositories.chunk_repository import ChunkRepository
from app.repositories.document_repository import DocumentRepository
from app.schemas.documents import ChunkCreate, DocumentCreate
from app.storage.file_store import LocalFileStore
from app.utils.hashing import hash_bytes
from app.vectorstore.faiss_store import FaissVectorStore

logger = logging.getLogger(__name__)


class DocumentService:
    def __init__(self, db: Session, workspace_id: str):
        self.db = db
        self.workspace_id = workspace_id
        self.settings = get_settings()
        self.document_repo = DocumentRepository(db)
        self.chunk_repo = ChunkRepository(db)
        self.file_store = LocalFileStore()
        self.embedder = OpenAIEmbedder()
        self.vector_store = FaissVectorStore(workspace_id=workspace_id)

    async def upload_pdf(self, file: UploadFile) -> dict:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise ValidationAppException("Only PDF files are supported.")

        content = await file.read()
        if not content:
            raise ValidationAppException("Uploaded file is empty.")

        content_hash = hash_bytes(content)
        existing_document = self.document_repo.get_by_content_hash(
            content_hash,
            workspace_id=self.workspace_id,
        )

        if existing_document:
            logger.info(
                "document_duplicate_detected",
                extra={
                    "document_id": existing_document.id,
                    "workspace_id": self.workspace_id,
                    "uploaded_filename": file.filename,
                },
            )
            return {
                "document": existing_document,
                "chunk_count": self.chunk_repo.count_by_document(
                    existing_document.id,
                    workspace_id=self.workspace_id,
                ),
            }

        storage_path = self.file_store.save_bytes(content, file.filename)

        document = self.document_repo.create(
            DocumentCreate(
                workspace_id=self.workspace_id,
                filename=file.filename,
                storage_path=str(storage_path),
                content_hash=content_hash,
                status=DOCUMENT_STATUS_PROCESSING,
            )
        )

        logger.info(
            "document_upload_started",
            extra={
                "document_id": document.id,
                "workspace_id": self.workspace_id,
                "uploaded_filename": file.filename,
            },
        )

        try:
            pages = extract_pdf_pages(storage_path)

            chunk_payloads: list[ChunkCreate] = []
            chunk_texts: list[str] = []
            chunk_index = 0

            for page in pages:
                cleaned_text = clean_text(page.text)
                if not cleaned_text:
                    continue

                page_chunks = chunk_text(
                    cleaned_text,
                    chunk_size=self.settings.chunk_size,
                    chunk_overlap=self.settings.chunk_overlap,
                )

                for chunk in page_chunks:
                    chunk_payloads.append(
                        ChunkCreate(
                            document_id=document.id,
                            workspace_id=self.workspace_id,
                            chunk_index=chunk_index,
                            page_number=page.page_number,
                            text=chunk.text,
                            token_count=chunk.token_count,
                            embedding_id=None,
                        )
                    )
                    chunk_texts.append(chunk.text)
                    chunk_index += 1

            created_chunks = []
            if chunk_payloads:
                created_chunks = self.chunk_repo.create_many(chunk_payloads)

                try:
                    embeddings = self.embedder.embed_texts(chunk_texts)
                except Exception as exc:
                    raise ExternalServiceAppException("Embedding generation failed.") from exc

                vector_ids = [chunk.id for chunk in created_chunks]
                self.vector_store.add(embeddings, vector_ids)

            document = self.document_repo.update_status(
                document.id,
                DOCUMENT_STATUS_INDEXED,
                workspace_id=self.workspace_id,
            )

            logger.info(
                "document_upload_completed",
                extra={
                    "document_id": document.id,
                    "workspace_id": self.workspace_id,
                    "chunk_count": len(created_chunks),
                },
            )

            return {
                "document": document,
                "chunk_count": len(created_chunks),
            }

        except Exception:
            self.document_repo.update_status(
                document.id,
                DOCUMENT_STATUS_FAILED,
                workspace_id=self.workspace_id,
            )
            logger.exception(
                "document_upload_failed",
                extra={"document_id": document.id, "workspace_id": self.workspace_id},
            )
            raise

    def delete_document(self, document_id: str) -> dict:
        document = self.document_repo.get_by_id(document_id, workspace_id=self.workspace_id)
        if not document:
            raise NotFoundAppException("Document not found.")

        deleted_chunk_count = self.chunk_repo.count_by_document(
            document_id,
            workspace_id=self.workspace_id,
        )
        storage_path = document.storage_path

        self.document_repo.delete(document_id, workspace_id=self.workspace_id)
        self.file_store.delete_file(storage_path)

        return {
            "document_id": document_id,
            "deleted_chunk_count": deleted_chunk_count,
            "message": "Document deleted. Rebuild index to fully sync FAISS.",
        }