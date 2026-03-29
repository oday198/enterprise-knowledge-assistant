from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "Enterprise Knowledge Assistant"
    app_env: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"
    log_level: str = "INFO"

    backend_cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    openai_api_key: str | None = None
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"

    chunk_size: int = 220
    chunk_overlap: int = 40
    default_top_k: int = 5
    max_top_k: int = 10

    data_dir: Path = ROOT_DIR / "data"
    raw_docs_dir: Path = ROOT_DIR / "data" / "raw"
    processed_docs_dir: Path = ROOT_DIR / "data" / "processed"
    faiss_index_dir: Path = ROOT_DIR / "data" / "faiss"

    metadata_db_url: str = f"sqlite:///{(ROOT_DIR / 'data' / 'app.db').as_posix()}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    def ensure_directories(self) -> None:
        for path in (
            self.data_dir,
            self.raw_docs_dir,
            self.processed_docs_dir,
            self.faiss_index_dir,
        ):
            path.mkdir(parents=True, exist_ok=True)

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()