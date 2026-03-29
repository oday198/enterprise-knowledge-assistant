from sqlalchemy.orm import Session

from app.db.models import Chunk
from app.embeddings.openai_embedder import OpenAIEmbedder
from app.vectorstore.faiss_store import FaissVectorStore


class Retriever:
    def __init__(self, db: Session):
        self.db = db
        self.embedder = OpenAIEmbedder()
        self.vector_store = FaissVectorStore()

    def retrieve(
        self,
        question: str,
        top_k: int = 5,
        document_id: str | None = None,
    ) -> list[Chunk]:
        query_vector = self.embedder.embed_query(question)

        search_k = max(top_k * 5, top_k)
        chunk_ids, _ = self.vector_store.search(query_vector, top_k=search_k)

        if not chunk_ids:
            return []

        query = self.db.query(Chunk).filter(Chunk.id.in_(chunk_ids))

        if document_id:
            query = query.filter(Chunk.document_id == document_id)

        chunks = query.all()
        chunk_map = {chunk.id: chunk for chunk in chunks}

        ordered_chunks = [chunk_map[chunk_id] for chunk_id in chunk_ids if chunk_id in chunk_map]
        return ordered_chunks[:top_k]