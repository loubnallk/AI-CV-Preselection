from services.text_normalizer import normalize_text

MIN_CHUNK_SIZE = 40


def chunk_text(text: str) -> list[str]:
    """
    Decoupe un texte en fragments pour le matching par passage.

    Strategie :
    1. decoupage par paragraphes (double saut de ligne)
    2. fusion des fragments trop courts avec le precedent
    3. repli sur le texte entier si aucun paragraphe detecte
    """
    normalized = normalize_text(text)
    if not normalized:
        return []

    paragraphs = [part.strip() for part in normalized.split("\n\n") if part.strip()]
    if len(paragraphs) <= 1 and "\n" in normalized:
        line_parts = [line.strip() for line in normalized.split("\n") if line.strip()]
        if len(line_parts) > 1:
            paragraphs = line_parts
    if not paragraphs:
        paragraphs = [normalized]

    chunks: list[str] = []
    for paragraph in paragraphs:
        if len(paragraph) >= MIN_CHUNK_SIZE:
            chunks.append(paragraph)
        elif chunks:
            chunks[-1] = f"{chunks[-1]} {paragraph}".strip()
        else:
            chunks.append(paragraph)

    return chunks if chunks else [normalized]
