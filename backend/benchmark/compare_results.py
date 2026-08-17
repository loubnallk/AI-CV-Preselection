"""Compare deux fichiers de résultats benchmark (baseline vs step1)."""

import json
import sys
from pathlib import Path

BENCHMARK_DIR = Path(__file__).parent


def load(name: str) -> dict:
    return json.loads((BENCHMARK_DIR / name).read_text(encoding="utf-8"))


def main() -> None:
    reference_name = sys.argv[1] if len(sys.argv) > 1 else "step2_results.json"
    current_name = sys.argv[2] if len(sys.argv) > 2 else "step3_results.json"

    reference = load(reference_name)
    current = load(current_name)

    print("=== COMPARAISON BENCHMARK ===")
    print(f"Reference : {reference['model_name']} ({reference.get('matching_strategy', 'full_document')})")
    print(f"Current   : {current['model_name']} ({current.get('matching_strategy', 'full_document')})")
    print()

    by_file = {r["filename"]: r for r in reference["results"]}
    current_by_file = {r["filename"]: r for r in current["results"]}

    print(f"{'CV':22} {'Label':22} {'Rang A':>7} {'Rang B':>7} {'Score A':>9} {'Score B':>9} {'Delta':>8}")
    print("-" * 88)

    for filename in sorted(by_file.keys()):
        a = by_file[filename]
        b = current_by_file.get(filename)
        if not b:
            print(f"{filename:22} present in reference only")
            continue
        delta = round(b["score"] - a["score"], 4)
        print(
            f"{filename:22} {a['label']:22} {a['rank']:7} {b['rank']:7} "
            f"{a['score']:9.4f} {b['score']:9.4f} {delta:+8.4f}"
        )

    for filename in sorted(current_by_file.keys()):
        if filename in by_file:
            continue
        b = current_by_file[filename]
        label = b.get("label", "new")
        print(
            f"{filename:22} {label:22} {'—':>7} {b['rank']:7} "
            f"{'—':>9} {b['score']:9.4f} {'new':>8}"
        )

    print()
    print("Classement reference:", " > ".join(r["filename"] for r in reference["results"]))
    print("Classement current  :", " > ".join(r["filename"] for r in current["results"]))
    rank_changed = [r["filename"] for r in reference["results"]] != [
        r["filename"] for r in current["results"]
    ]
    print(f"Ordre modifié : {'oui' if rank_changed else 'non'}")


if __name__ == "__main__":
    main()
