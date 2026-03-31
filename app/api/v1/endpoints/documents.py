from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_workspace_id
from app.db.session import get_db
from app.repositories.chunk_repository import ChunkRepository
from app.repositories.document_repository import DocumentRepository
from app.schemas.documents import (
    DocumentDeleteResponse,
    DocumentDetailResponse,
    DocumentIngestionResponse,
    DocumentRead,
    RebuildIndexResponse,
)
from app.services.document_service import DocumentService
from app.services.index_service import IndexService

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=list[DocumentRead])
def list_documents(
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    repo = DocumentRepository(db)
    return repo.list_all(workspace_id=workspace_id)


@router.post("/rebuild-index", response_model=RebuildIndexResponse)
def rebuild_index(
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    service = IndexService(db, workspace_id=workspace_id)
    return service.rebuild_index()


@router.post("/upload", response_model=DocumentIngestionResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    service = DocumentService(db, workspace_id=workspace_id)
    return await service.upload_pdf(file)


@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    document_repo = DocumentRepository(db)
    chunk_repo = ChunkRepository(db)

    document = document_repo.get_by_id(document_id, workspace_id=workspace_id)
    if not document:
        from app.core.exceptions import NotFoundAppException
        raise NotFoundAppException("Document not found.")

    chunks = chunk_repo.list_by_document(document_id, workspace_id=workspace_id)
    return {
        "document": document,
        "chunks": chunks,
    }


@router.delete("/{document_id}", response_model=DocumentDeleteResponse)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    service = DocumentService(db, workspace_id=workspace_id)
    return service.delete_document(document_id)