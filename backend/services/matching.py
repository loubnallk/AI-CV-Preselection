from sentence_transformers.util import cos_sim

from services.chunking import chunk_text
from services.embeddings import get_embedding, get_embeddings
from services.skills_matcher import extract_skills_from_job, match_skills_in_cv

SEMANTIC_WEIGHT = 0.6
KEYWORD_WEIGHT = 0.4


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Calcule la similarite cosinus entre deux vecteurs d'embedding.
    """
    if not vec_a or not vec_b:
        raise ValueError("Les vecteurs ne peuvent pas etre vides.")

    if len(vec_a) != len(vec_b):
        raise ValueError(
            f"Dimensions incompatibles : {len(vec_a)} vs {len(vec_b)}."
        )

    return round(float(cos_sim(vec_a, vec_b)), 4)


def score_cv_against_job(job_embedding: list[float], cv_text: str) -> dict:
    """
    Score semantique d'un CV via le passage le plus proche de l'offre.
    """
    chunks = chunk_text(cv_text)
    if not chunks:
        raise ValueError("Le CV ne contient aucun texte exploitable.")

    chunk_embeddings = get_embeddings(chunks)

    best_score = -1.0
    best_excerpt = chunks[0]
    for chunk, chunk_embedding in zip(chunks, chunk_embeddings):
        score = cosine_similarity(job_embedding, chunk_embedding)
        if score > best_score:
            best_score = score
            best_excerpt = chunk

    return {
        "semantic_score": best_score,
        "best_match_excerpt": best_excerpt,
    }


def _build_hybrid_score(
    semantic_score: float,
    keyword_score: float,
    skills_required: list[str],
) -> dict:
    if not skills_required:
        return {
            "score": semantic_score,
            "score_breakdown": {
                "semantic": semantic_score,
                "keywords": None,
                "weights": {"semantic": 1.0, "keywords": 0.0},
                "fallback": "semantic_only",
            },
        }

    final_score = round(
        (SEMANTIC_WEIGHT * semantic_score) + (KEYWORD_WEIGHT * keyword_score),
        4,
    )
    return {
        "score": final_score,
        "score_breakdown": {
            "semantic": semantic_score,
            "keywords": keyword_score,
            "weights": {"semantic": SEMANTIC_WEIGHT, "keywords": KEYWORD_WEIGHT},
            "fallback": None,
        },
    }


def rank_candidates_from_texts(
    job_text: str,
    candidates: list[dict],
) -> list[dict]:
    """
    Classe les candidats avec un score hybride semantique + competences.
    """
    job_embedding = get_embedding(job_text)
    skills_required = extract_skills_from_job(job_text)

    scored = []
    for candidate in candidates:
        semantic_match = score_cv_against_job(job_embedding, candidate["text"])
        skills_match = match_skills_in_cv(candidate["text"], skills_required)
        hybrid = _build_hybrid_score(
            semantic_match["semantic_score"],
            skills_match["keyword_score"],
            skills_required,
        )

        scored.append(
            {
                "filename": candidate["filename"],
                "score": hybrid["score"],
                "best_match_excerpt": semantic_match["best_match_excerpt"],
                "score_breakdown": hybrid["score_breakdown"],
                "matched_skills": skills_match["matched_skills"],
                "missing_skills": skills_match["missing_skills"],
                "skills_required": skills_required,
            }
        )

    scored.sort(key=lambda item: item["score"], reverse=True)

    for index, item in enumerate(scored, start=1):
        item["rank"] = index

    return scored
