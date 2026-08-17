from functools import lru_cache

from sentence_transformers import SentenceTransformer

from services.text_normalizer import normalize_text

MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"


@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def get_embedding(text: str) -> list[float]:
    """
    Transforme un texte en vecteur d'embedding.

    Args:
        text: texte à encoder.

    Returns:
        Vecteur d'embedding (384 dimensions pour paraphrase-multilingual-MiniLM-L12-v2).

    Raises:
        ValueError: si le texte est vide ou ne contient que des espaces.
    """
    cleaned_text = normalize_text(text)
    if not cleaned_text:
        raise ValueError("Le texte à encoder ne peut pas être vide.")

    embedding = _get_model().encode(cleaned_text, convert_to_numpy=True)
    return embedding.tolist()


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Transforme plusieurs textes en vecteurs d'embedding (encodage batch).

    Args:
        texts: liste de textes a encoder.

    Returns:
        Liste de vecteurs d'embedding.

    Raises:
        ValueError: si la liste est vide ou si tous les textes sont vides.
    """
    cleaned_texts = [normalize_text(text) for text in texts]
    cleaned_texts = [text for text in cleaned_texts if text]
    if not cleaned_texts:
        raise ValueError("Au moins un texte non vide est requis.")

    embeddings = _get_model().encode(cleaned_texts, convert_to_numpy=True)
    return [embedding.tolist() for embedding in embeddings]
