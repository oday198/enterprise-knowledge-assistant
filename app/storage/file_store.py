from pathlib import Path
from uuid import uuid4

from app.core.config import get_settings


class LocalFileStore:
    def __init__(self, base_dir: Path | None = None):
        settings = get_settings()
        self.base_dir = base_dir or settings.raw_docs_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_bytes(self, data: bytes, original_filename: str) -> Path:
        suffix = Path(original_filename).suffix.lower() or ".pdf"
        filename = f"{uuid4()}{suffix}"
        file_path = self.base_dir / filename
        file_path.write_bytes(data)
        return file_path

    def delete_file(self, file_path: str | Path) -> None:
        path = Path(file_path)
        if path.exists() and path.is_file():
            path.unlink()