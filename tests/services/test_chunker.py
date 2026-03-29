from app.ingestion.chunker import chunk_text


def test_chunk_text_returns_chunks():
    text = " ".join([f"word{i}" for i in range(500)])
    chunks = chunk_text(text, chunk_size=100, chunk_overlap=20)

    assert len(chunks) > 1
    assert all(chunk.text for chunk in chunks)
    assert all(chunk.token_count > 0 for chunk in chunks)
