from sqlalchemy import inspect, text

from app.db.session import engine


def ensure_workspace_schema() -> None:
    with engine.begin() as conn:
        inspector = inspect(conn)
        tables = inspector.get_table_names()

        if "documents" in tables:
            document_columns = {column["name"] for column in inspector.get_columns("documents")}
            if "workspace_id" not in document_columns:
                conn.execute(text("ALTER TABLE documents ADD COLUMN workspace_id VARCHAR(100)"))
                conn.execute(
                    text(
                        "UPDATE documents SET workspace_id = 'legacy-global' "
                        "WHERE workspace_id IS NULL"
                    )
                )

        if "chunks" in tables:
            chunk_columns = {column["name"] for column in inspector.get_columns("chunks")}
            if "workspace_id" not in chunk_columns:
                conn.execute(text("ALTER TABLE chunks ADD COLUMN workspace_id VARCHAR(100)"))
                conn.execute(
                    text(
                        "UPDATE chunks SET workspace_id = 'legacy-global' "
                        "WHERE workspace_id IS NULL"
                    )
                )

        conn.execute(
            text("CREATE INDEX IF NOT EXISTS ix_documents_workspace_id ON documents (workspace_id)")
        )
        conn.execute(
            text("CREATE INDEX IF NOT EXISTS ix_chunks_workspace_id ON chunks (workspace_id)")
        )