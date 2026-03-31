from sqlalchemy.orm import Session

from app.embeddings.openai_embedder import OpenAIEmbedder
from app.repositories.chunk_repository import ChunkRepository
from app.vectorstore.faiss_store import FaissVectorStore


class IndexService:
    def __init__(self, db: Session, workspace_id: str):
        self.db = db
        self.workspace_id = workspace_id
        self.chunk_repo = ChunkRepository(db)
        self.embedder = OpenAIEmbedder()
        self.vector_store = FaissVectorStore(workspace_id=workspace_id)

    def rebuild_index(self, batch_size: int = 100) -> dict:
        chunks = self.chunk_repo.list_all(workspace_id=self.workspace_id)
        self.vector_store.reset()

        if not chunks:
            return {
                "total_chunks": 0,
                "indexed_chunks": 0,
                "message": "Index rebuilt. No chunks found.",
            }

        total = len(chunks)
        indexed = 0

        for start in range(0, total, batch_size):
            batch = chunks[start:start + batch_size]
            texts = [chunk.text for chunk in batch]
            ids = [chunk.id for chunk in batch]

            embeddings = self.embedder.embed_texts(texts)
            self.vector_store.add(embeddings, ids)
            indexed += len(batch)

        return {
            "total_chunks": total,
            "indexed_chunks": indexed,
            "message": "Index rebuilt successfully.",
        }