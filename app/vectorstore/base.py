from abc import ABC, abstractmethod


class VectorStore(ABC):
    @abstractmethod
    def add(self, vectors: list[list[float]], ids: list[str]) -> None:
        pass

    @abstractmethod
    def search(
        self, query_vector: list[float], top_k: int = 5
    ) -> tuple[list[str], list[float]]:
        pass

    @abstractmethod
    def save(self) -> None:
        pass

    @abstractmethod
    def reset(self) -> None:
        pass
