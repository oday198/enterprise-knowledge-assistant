from app.db.session import SessionLocal
from app.embeddings.openai_embedder import OpenAIEmbedder
from app.repositories.chunk_repository import ChunkRepository
from app.vectorstore.faiss_store import FaissVectorStore

BATCH_SIZE = 100


def main():
    db = SessionLocal()

    try:
        chunk_repo = ChunkRepository(db)
        chunks = chunk_repo.list_all()

        if not chunks:
            print("No chunks found. Nothing to index.")
            return

        embedder = OpenAIEmbedder()
        vector_store = FaissVectorStore()
        vector_store.reset()

        total = len(chunks)
        print(f"Rebuilding index for {total} chunks...")

        for start in range(0, total, BATCH_SIZE):
            batch = chunks[start : start + BATCH_SIZE]
            texts = [chunk.text for chunk in batch]
            ids = [chunk.id for chunk in batch]

            embeddings = embedder.embed_texts(texts)
            vector_store.add(embeddings, ids)

            print(f"Indexed {min(start + BATCH_SIZE, total)}/{total}")

        print("Index rebuild complete.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
