from io import BytesIO
from pathlib import Path
from typing import BinaryIO, Union

from pypdf import PdfReader

PdfSource = Union[str, Path, bytes, BinaryIO]


class EmptyPdfError(ValueError):
    """Le PDF ne contient aucun texte exploitable."""


def extract_text_from_pdf(pdf_source: PdfSource) -> str:
    """
    Extrait le texte d'un fichier PDF.

    Args:
        pdf_source: chemin vers le PDF, contenu binaire, ou objet fichier.

    Returns:
        Texte extrait du PDF.

    Raises:
        EmptyPdfError: si aucun texte n'a pu être extrait.
        ValueError: si la source est invalide ou illisible.
    """
    reader = _read_pdf(pdf_source)

    pages_text = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            pages_text.append(page_text.strip())

    text = "\n\n".join(pages_text).strip()
    if not text:
        raise EmptyPdfError(
            "Aucun texte exploitable n'a pu être extrait du PDF. "
            "Le fichier est peut-être vide ou constitué uniquement d'images."
        )

    return text


def _read_pdf(pdf_source: PdfSource) -> PdfReader:
    if isinstance(pdf_source, (str, Path)):
        return PdfReader(str(pdf_source))

    if isinstance(pdf_source, bytes):
        return PdfReader(BytesIO(pdf_source))

    if hasattr(pdf_source, "read"):
        return PdfReader(pdf_source)

    raise ValueError("Source PDF invalide.")
