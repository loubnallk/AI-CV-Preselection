"""Genere les PDF de test reproductibles pour le benchmark matching."""

from pathlib import Path

FIXTURES_DIR = Path(__file__).parent / "fixtures" / "cvs"

CV_PROFILES = {
    "cv_python_fastapi.pdf": (
        "pertinent",
        "Developpeur Python senior. 4 ans d'experience en developpement backend "
        "avec FastAPI et Flask. Conception d'APIs REST, PostgreSQL, tests unitaires.",
    ),
    "cv_python_django.pdf": (
        "partiellement_pertinent",
        "Ingenieur logiciel Python. 3 ans d'experience Django et Celery. "
        "Developpement web, bases de donnees MySQL, bonnes pratiques Agile.",
    ),
    "cv_java_spring.pdf": (
        "partiellement_pertinent",
        "Developpeur Java backend. 5 ans d'experience Spring Boot, microservices, "
        "APIs REST, Kubernetes.",
    ),
    "cv_data_analyst.pdf": (
        "partiellement_pertinent",
        "Data Analyst. Python pour l'analyse de donnees, pandas, SQL, "
        "visualisation Tableau. Experience en reporting.",
    ),
    "cv_cuisine.pdf": (
        "hors_sujet",
        "Chef de cuisine. 10 ans d'experience en restauration gastronomique. "
        "Gestion d'equipe, creation de menus, normes HACCP.",
    ),
    "cv_long_mixed.pdf": (
        "pertinent",
        "Experience en communication digitale et gestion de projets marketing.\n\n"
        "Developpeur Python senior. 4 ans d'experience FastAPI, APIs REST, PostgreSQL.",
    ),
}


def _escape_pdf_text(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", r"\(").replace(")", r"\)")


def make_pdf(text: str) -> bytes:
    paragraphs = [part.strip() for part in text.split("\n\n") if part.strip()]
    if not paragraphs:
        paragraphs = [text.strip()]

    lines = ["BT /F1 20 Tf"]
    y_position = 700
    for index, paragraph in enumerate(paragraphs):
        if index == 0:
            lines.append(f"100 {y_position} Td ({_escape_pdf_text(paragraph)}) Tj")
        else:
            lines.append("0 -28 Td")
            lines.append(f"({_escape_pdf_text(paragraph)}) Tj")
    lines.append("ET")
    stream = "\n".join(lines)

    body = f"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length {len(stream)} >> stream
{stream}
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
trailer << /Size 6 /Root 1 0 R >>
startxref
0
%%EOF"""
    return body.encode("latin-1")


def main() -> None:
    FIXTURES_DIR.mkdir(parents=True, exist_ok=True)
    for filename, (label, content) in CV_PROFILES.items():
        path = FIXTURES_DIR / filename
        path.write_bytes(make_pdf(content))
        print(f"Generated {path.name} ({label})")


if __name__ == "__main__":
    main()
