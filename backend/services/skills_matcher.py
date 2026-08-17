import json
import re
from functools import lru_cache
from pathlib import Path

from services.text_normalizer import normalize_text

SKILLS_DICTIONARY_PATH = Path(__file__).resolve().parent.parent / "data" / "skills_dictionary.json"


@lru_cache(maxsize=1)
def _load_skills_dictionary() -> tuple[dict, ...]:
    with SKILLS_DICTIONARY_PATH.open(encoding="utf-8") as handle:
        raw_entries = json.load(handle)
    return tuple(raw_entries)


def _contains_term(text: str, term: str) -> bool:
    normalized_term = term.lower().strip()
    if not normalized_term:
        return False

    if len(normalized_term) <= 4 or normalized_term.isalpha() is False:
        pattern = rf"(?<![a-z0-9]){re.escape(normalized_term)}(?![a-z0-9])"
        return re.search(pattern, text) is not None

    return normalized_term in text


def _skill_present(text: str, skill_entry: dict) -> bool:
    candidates = [skill_entry["name"], *skill_entry.get("aliases", [])]
    return any(_contains_term(text, candidate) for candidate in candidates)


def extract_skills_from_job(job_text: str) -> list[str]:
    """
    Retourne les competences du dictionnaire detectees dans l'offre.
    """
    normalized_job = normalize_text(job_text).lower()
    if not normalized_job:
        return []

    detected = []
    for skill_entry in _load_skills_dictionary():
        if _skill_present(normalized_job, skill_entry):
            detected.append(skill_entry["name"])

    return detected


def match_skills_in_cv(cv_text: str, skills_required: list[str]) -> dict:
    """
    Compare les competences requises avec le contenu du CV.
    """
    normalized_cv = normalize_text(cv_text).lower()
    dictionary = {entry["name"]: entry for entry in _load_skills_dictionary()}

    matched_skills = []
    missing_skills = []

    for skill_name in skills_required:
        skill_entry = dictionary.get(skill_name)
        if not skill_entry:
            missing_skills.append(skill_name)
            continue

        if _skill_present(normalized_cv, skill_entry):
            matched_skills.append(skill_name)
        else:
            missing_skills.append(skill_name)

    if not skills_required:
        keyword_score = 0.0
    else:
        keyword_score = round(len(matched_skills) / len(skills_required), 4)

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "keyword_score": keyword_score,
    }
