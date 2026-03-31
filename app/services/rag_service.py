import logging

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import (
    ExternalServiceAppException,
    NotFoundAppException,
    ValidationAppException,
)
from app.db.models import Document
from app.llm.openai_client import OpenAIChatClient
from app.llm.prompt_builder import build_rag_prompts
from app.retrieval.retriever import Retriever
from app.schemas.query import QueryResponse, QuerySource

logger = logging.getLogger(__name__)


class RAGService:
    def __init__(self, db: Session, workspace_id: str):
        self.db = db
        self.workspace_id = workspace_id
        self.settings = get_settings()
        self.retriever = Retriever(db, workspace_id=workspace_id)
        self.llm = OpenAIChatClient()

    def answer_question(
        self,
        question: str,
        top_k: int = 5,
        document_id: str | None = None,
    ) -> QueryResponse:
        if not question.strip():
            raise ValidationAppException("Question must not be empty.")

        if top_k < 1 or top_k > self.settings.max_top_k:
            raise ValidationAppException(
                f"top_k must be between 1 and {self.settings.max_top_k}."
            )

        if document_id:
            selected_document = (
                self.db.query(Document)
                .filter(
                    Document.id == document_id,
                    Document.workspace_id == self.workspace_id,
                )
                .first()
            )
            if not selected_document:
                raise NotFoundAppException("Selected document not found.")

        chunks = self.retriever.retrieve(
            question=question,
            top_k=top_k,
            document_id=document_id,
        )

        if not chunks:
            return QueryResponse(
                answer="The information is not available in the selected document(s).",
                sources=[],
            )

        document_ids = list({chunk.document_id for chunk in chunks})
        documents = (
            self.db.query(Document)
            .filter(
                Document.id.in_(document_ids),
                Document.workspace_id == self.workspace_id,
            )
            .all()
        )
        document_map = {doc.id: doc for doc in documents}

        context_blocks = []
        sources = []

        for chunk in chunks:
            document = document_map.get(chunk.document_id)
            filename = document.filename if document else "unknown"

            label = (
                f"[filename={filename} doc={chunk.document_id} "
                f"page={chunk.page_number} chunk={chunk.chunk_index}]"
            )
            context_blocks.append(f"{label}\n{chunk.text}")

            sources.append(
                QuerySource(
                    chunk_id=chunk.id,
                    document_id=chunk.document_id,
                    filename=filename,
                    page_number=chunk.page_number,
                    chunk_index=chunk.chunk_index,
                    text_preview=chunk.text[:200],
                )
            )

        system_prompt, user_prompt = build_rag_prompts(
            question=question,
            context_blocks=context_blocks,
        )

        try:
            answer = self.llm.generate(system_prompt=system_prompt, user_prompt=user_prompt)
        except Exception as exc:
            logger.exception("rag_generation_failed")
            raise ExternalServiceAppException("LLM response generation failed.") from exc

        logger.info(
            "rag_query_completed",
            extra={
                "workspace_id": self.workspace_id,
                "top_k": top_k,
                "source_count": len(sources),
                "document_id": document_id,
            },
        )

        return QueryResponse(
            answer=answer,
            sources=sources,
        )