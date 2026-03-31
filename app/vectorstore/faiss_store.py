from pathlib import Path

import faiss
import numpy as np

from app.core.config import get_settings
from app.vectorstore.base import VectorStore


class FaissVectorStore(VectorStore):
    def __init__(self, workspace_id: str | None = None):
        settings = get_settings()
        self.root_index_dir = Path(settings.faiss_index_dir)
        self.root_index_dir.mkdir(parents=True, exist_ok=True)

        self.workspace_id = workspace_id or "global"
        self.index_dir = self.root_index_dir / self.workspace_id
        self.index_dir.mkdir(parents=True, exist_ok=True)

        self.index_path = self.index_dir / "index.faiss"
        self.ids_path = self.index_dir / "ids.npy"

        self.dimension = None
        self.index = None
        self.ids: list[str] = []

        self._load()

    def _load(self) -> None:
        if self.index_path.exists() and self.ids_path.exists():
            self.index = faiss.read_index(str(self.index_path))
            self.ids = np.load(self.ids_path, allow_pickle=True).tolist()
            self.dimension = self.index.d

    def _initialize_index(self, dimension: int) -> None:
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)

    def add(self, vectors: list[list[float]], ids: list[str]) -> None:
        if not vectors:
            return

        np_vectors = np.array(vectors, dtype="float32")
        faiss.normalize_L2(np_vectors)

        if self.index is None:
            self._initialize_index(np_vectors.shape[1])

        self.index.add(np_vectors)
        self.ids.extend(ids)
        self.save()

    def search(self, query_vector: list[float], top_k: int = 5) -> tuple[list[str], list[float]]:
        if self.index is None or self.index.ntotal == 0:
            return [], []

        query = np.array([query_vector], dtype="float32")
        faiss.normalize_L2(query)

        scores, indices = self.index.search(query, top_k)

        matched_ids = []
        matched_scores = []

        for idx, score in zip(indices[0], scores[0]):
            if idx == -1 or idx >= len(self.ids):
                continue
            matched_ids.append(self.ids[idx])
            matched_scores.append(float(score))

        return matched_ids, matched_scores

    def save(self) -> None:
        if self.index is None:
            return

        faiss.write_index(self.index, str(self.index_path))
        np.save(self.ids_path, np.array(self.ids, dtype=object))

    def reset(self) -> None:
        self.index = None
        self.ids = []
        self.dimension = None

        if self.index_path.exists():
            self.index_path.unlink()

        if self.ids_path.exists():
            self.ids_path.unlink()