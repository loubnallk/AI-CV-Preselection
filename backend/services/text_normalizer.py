import re


def normalize_text(text: str) -> str:
    """
    Apply light normalization before embedding encoding.

    - strip leading/trailing whitespace
    - collapse repeated spaces and tabs
    - limit excessive blank lines
    """
    cleaned = text.strip()
    if not cleaned:
        return cleaned

    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()
