from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_workspace_id
from app.core.config import get_settings
from app.db.session import get_db
from app.schemas.query import QueryRequest, QueryResponse
from app.services.rag_service import RAGService

router = APIRouter(prefix="/query", tags=["query"])


@router.post("", response_model=QueryResponse)
def query_documents(
    payload: QueryRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    service = RAGService(db, workspace_id=workspace_id)
    settings = get_settings()
    top_k = payload.top_k or settings.default_top_k

    return service.answer_question(
        question=payload.question,
        top_k=top_k,
        document_id=payload.document_id,
    )