export interface AnalyzeResult {
  filename: string;
  score: number;
  rank: number;
}

export interface AnalyzeResponse {
  job_description: string;
  candidate_count: number;
  results: AnalyzeResult[];
}

function parseErrorDetail(payload: unknown): string {
  if (
    payload &&
    typeof payload === "object" &&
    "detail" in payload &&
    typeof payload.detail === "string"
  ) {
    return payload.detail;
  }

  return "Une erreur est survenue lors de l'analyse.";
}

export async function analyzeCvs(
  jobDescription: string,
  cvs: File[],
): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("job_description", jobDescription);
  cvs.forEach((file) => formData.append("cvs", file));

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(parseErrorDetail(payload));
  }

  return response.json();
}
