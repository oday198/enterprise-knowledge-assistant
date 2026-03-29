from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader


@dataclass
class ParsedPage:
    page_number: int
    text: str


def extract_pdf_pages(file_path: Path) -> list[ParsedPage]:
    reader = PdfReader(str(file_path))
    pages: list[ParsedPage] = []

    for idx, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        pages.append(ParsedPage(page_number=idx, text=text))

    return pages
