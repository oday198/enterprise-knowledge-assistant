from dataclasses import dataclass


@dataclass
class TextChunk:
    text: str
    token_count: int


def chunk_text(
    text: str, chunk_size: int = 220, chunk_overlap: int = 40
) -> list[TextChunk]:
    words = text.split()
    if not words:
        return []

    chunks: list[TextChunk] = []
    start = 0

    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk_words = words[start:end]
        chunk_value = " ".join(chunk_words).strip()

        if chunk_value:
            chunks.append(TextChunk(text=chunk_value, token_count=len(chunk_words)))

        if end >= len(words):
            break

        start = max(end - chunk_overlap, start + 1)

    return chunks
