from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pypdf.errors import PdfReadError

from services.matching import rank_candidates_from_texts
from services.parser import EmptyPdfError, extract_text_from_pdf

app = FastAPI(title="AI CV Preselection API")


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is running"}


@app.post("/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    text = await _extract_uploaded_pdf_text(file)

    return {
        "filename": file.filename,
        "text": text,
        "character_count": len(text),
    }


@app.post("/analyze")
async def analyze(
    job_description: str = Form(...),
    cvs: list[UploadFile] = File(...),
):
    cleaned_job_description = job_description.strip()
    if not cleaned_job_description:
        raise HTTPException(
            status_code=400,
            detail="La description de l'offre ne peut pas être vide.",
        )

    if not cvs:
        raise HTTPException(
            status_code=400,
            detail="Au moins un CV PDF est requis.",
        )

    candidates = []
    for cv in cvs:
        filename = cv.filename or "cv.pdf"
        try:
            text = await _extract_uploaded_pdf_text(cv)
        except HTTPException as exc:
            raise HTTPException(
                status_code=exc.status_code,
                detail=f"{filename} — {exc.detail}",
            ) from exc

        candidates.append({"filename": filename, "text": text})

    results = rank_candidates_from_texts(cleaned_job_description, candidates)

    return {
        "job_description": cleaned_job_description,
        "candidate_count": len(results),
        "results": results,
    }


async def _extract_uploaded_pdf_text(file: UploadFile) -> str:
    if not _is_pdf(file):
        raise HTTPException(
            status_code=400,
            detail="Le fichier doit être un PDF (.pdf).",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Le fichier est vide.")

    if not content.startswith(b"%PDF"):
        raise HTTPException(
            status_code=400,
            detail="Le fichier n'est pas un PDF valide.",
        )

    try:
        return extract_text_from_pdf(content)
    except EmptyPdfError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except PdfReadError as exc:
        raise HTTPException(
            status_code=400,
            detail="Le fichier PDF est illisible ou corrompu.",
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _is_pdf(file: UploadFile) -> bool:
    if file.content_type == "application/pdf":
        return True
    if file.filename and file.filename.lower().endswith(".pdf"):
        return True
    return False
