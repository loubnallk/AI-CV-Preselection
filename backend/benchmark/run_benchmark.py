"""Exécute le benchmark matching et enregistre les résultats en JSON."""

import json
import sys
from datetime import UTC, datetime
from pathlib import Path

BENCHMARK_DIR = Path(__file__).parent
sys.path.insert(0, str(BENCHMARK_DIR.parent))

from services.embeddings import MODEL_NAME  # noqa: E402
from services.matching import rank_candidates_from_texts  # noqa: E402
from services.parser import extract_text_from_pdf  # noqa: E402

CV_LABELS = {
    "cv_python_fastapi.pdf": "pertinent",
    "cv_python_django.pdf": "partiellement_pertinent",
    "cv_java_spring.pdf": "partiellement_pertinent",
    "cv_data_analyst.pdf": "partiellement_pertinent",
    "cv_cuisine.pdf": "hors_sujet",
    "cv_long_mixed.pdf": "pertinent",
}


def load_job_offer() -> str:
    return (BENCHMARK_DIR / "job_offer.txt").read_text(encoding="utf-8").strip()


def load_candidates() -> list[dict]:
    candidates = []
    cvs_dir = BENCHMARK_DIR / "fixtures" / "cvs"
    for pdf_path in sorted(cvs_dir.glob("*.pdf")):
        text = extract_text_from_pdf(pdf_path.read_bytes())
        candidates.append(
            {
                "filename": pdf_path.name,
                "label": CV_LABELS.get(pdf_path.name, "unknown"),
                "text": text,
            }
        )
    return candidates


def run_benchmark(output_name: str) -> dict:
    job_text = load_job_offer()
    candidates = load_candidates()
    results = rank_candidates_from_texts(job_text, candidates)

    enriched = []
    for result in results:
        label = CV_LABELS.get(result["filename"], "unknown")
        enriched.append({**result, "label": label})

    payload = {
        "timestamp": datetime.now(UTC).isoformat(),
        "model_name": MODEL_NAME,
        "matching_strategy": "chunk_max_similarity",
        "job_description": job_text,
        "candidate_count": len(enriched),
        "results": enriched,
    }

    output_path = BENCHMARK_DIR / output_name
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Saved {output_path}")
    return payload


def print_summary(payload: dict) -> None:
    print(f"\nModel: {payload['model_name']}")
    print("Ranking:")
    for item in payload["results"]:
        excerpt = item.get("best_match_excerpt", "")
        excerpt_preview = (
            excerpt[:70] + "..." if len(excerpt) > 70 else excerpt
        )
        print(
            f"  #{item['rank']} {item['filename']:22} "
            f"score={item['score']:.4f}  [{item['label']}]"
        )
        if excerpt_preview:
            print(f"      excerpt: {excerpt_preview}")


if __name__ == "__main__":
    name = sys.argv[1] if len(sys.argv) > 1 else "results_latest.json"
    summary = run_benchmark(name)
    print_summary(summary)
