# Enterprise Knowledge Assistant

Production-style Retrieval-Augmented Generation (RAG) system for enterprise document search and question answering.

## Overview

This project ingests PDF documents, extracts and chunks text, generates embeddings with OpenAI, stores vectors in FAISS, and answers user questions through a FastAPI backend using retrieval-augmented generation.

## Features

- PDF upload and ingestion
- Text extraction and chunking
- OpenAI embeddings
- FAISS vector search
- OpenAI LLM answer generation
- Source-aware responses
- Document metadata tracking with SQLite + SQLAlchemy
- Duplicate document detection
- Rebuildable vector index
- Dockerized backend
- Structured logging
- Health and readiness endpoints
- Request ID middleware

## Tech Stack

- Python 3.11
- FastAPI
- SQLAlchemy
- SQLite
- FAISS
- OpenAI API
- PyPDF
- Docker
- Pytest

## Architecture
```text
Client
  ↓
FastAPI API
  ├─ Document ingestion service
  │  ├─ PDF parsing
  │  ├─ Text cleaning
  │  ├─ Chunking
  │  ├─ Embeddings
  │  └─ FAISS indexing
  │
  └─ Query service
     ├─ Query embedding
     ├─ Vector retrieval
     ├─ Prompt building
     └─ LLM generation

Storage
  ├─ Raw PDF files
  ├─ SQLite metadata DB
  └─ FAISS index
```

## Project Structure

- `app/`
- `data/`
- `scripts/`
- `tests/`

## API Endpoints

- `GET /api/v1/health`
- `GET /api/v1/health/ready`
- `GET /api/v1/documents`
- `GET /api/v1/documents/{document_id}`
- `POST /api/v1/documents/upload`
- `DELETE /api/v1/documents/{document_id}`
- `POST /api/v1/documents/rebuild-index`
- `POST /api/v1/query`

## Example Query Request
```json
{
  "question": "What is this document about?",
  "top_k": 5
}
```

## Example Query Response
```json
{
  "answer": "The document discusses ...",
  "sources": [
    {
      "chunk_id": "chunk-id",
      "document_id": "doc-id",
      "filename": "sample.pdf",
      "page_number": 1,
      "chunk_index": 0,
      "text_preview": "..."
    }
  ]
}
```

## Local Setup

1. Create environment
```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies
```bash
pip install -e ".[dev]"
```

3. Configure environment — Copy `.env.example` to `.env` and set `OPENAI_API_KEY`

4. Run app
```bash
uvicorn app.main:app --reload
```

5. Open docs: `http://127.0.0.1:8000/docs`

## Docker
```bash
docker compose up --build
```

## Tests
```bash
pytest -q
```

## Notes

- Uses `text-embedding-3-small` for embeddings
- Uses `gpt-4o-mini` for answer generation
- Duplicate PDFs are detected by content hash
- FAISS index can be rebuilt from stored chunk metadata

## Future Improvements

- Async/background ingestion
- Authentication
- Rate limiting
- Reranking
- Better observability
- Cloud storage and managed DB
- Frontend UI

## Deployment

Recommended deployment: AWS EC2 with Docker Compose.

Why this deployment fits the project:
- SQLite metadata database
- FAISS local vector index
- Raw PDF file storage on disk
- Full-stack Dockerized architecture

High-level deployment flow:
1. Launch Ubuntu EC2 instance
2. Install Docker and Docker Compose
3. Clone repository
4. Create `.env` from production template
5. Run `docker compose up --build -d`
6. Expose ports 3000 and 8000 or configure a reverse proxy

Frontend:
- `http://<EC2_PUBLIC_IP>:3000`

Backend docs:
- `http://<EC2_PUBLIC_IP>:8000/docs`

## Author

**Oday Soueidan**

- LinkedIn: `https://www.linkedin.com/in/odaysoueidan`
- GitHub: `https://github.com/oday198`