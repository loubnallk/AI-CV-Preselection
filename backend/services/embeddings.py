from functools import lru_cache

from sentence_transformers import SentenceTransformer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def get_embedding(text: str) -> list[float]:
    """
    Transforme un texte en vecteur d'embedding.

    Args:
        text: texte à encoder.

    Returns:
        Vecteur d'embedding (384 dimensions pour all-MiniLM-L6-v2).

    Raises:
        ValueError: si le texte est vide ou ne contient que des espaces.
    """
    cleaned_text = text.strip()
    if not cleaned_text:
        raise ValueError("Le texte à encoder ne peut pas être vide.")

    embedding = _get_model().encode(cleaned_text, convert_to_numpy=True)
    return embedding.tolist()
