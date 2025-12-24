export type TagSuggestion = { id: number; name: string };

const TAGS_ENDPOINT = "http://localhost:5296/api/tags";

async function readErrorMessage(res: Response): Promise<string> {
  // Prefer ProblemDetails-style: { title, status } or { error }
  try {
    const data = await res.json();
    return (
      data?.title ||
      data?.error ||
      (typeof data === "string" ? data : "") ||
      res.statusText
    );
  } catch {
    // fallback (non-JSON)
    try {
      const text = await res.text();
      return text || res.statusText;
    } catch {
      return res.statusText;
    }
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    // some endpoints might return 204 (no content)
    if (res.status === 204) return undefined as unknown as T;
    return (await res.json()) as T;
  }

  const msg = await readErrorMessage(res);
  throw new Error(msg || `Request failed (${res.status})`);
}

/**
 * GET /api/tags?query=...
 */
export async function searchTags(query: string): Promise<TagSuggestion[]> {
  const q = query.trim();
  if (!q) return [];

  const res = await fetch(`${TAGS_ENDPOINT}?query=${encodeURIComponent(q)}`);
  return await handleResponse<TagSuggestion[]>(res);
}

/**
 * GET /api/tags
 */
export async function fetchAllTags(): Promise<TagSuggestion[]> {
  const res = await fetch(TAGS_ENDPOINT);
  return await handleResponse<TagSuggestion[]>(res);
}

/**
 * POST /api/tags  body: { name: string }
 */
export async function createTagApi(name: string): Promise<TagSuggestion> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Tag name is required");

  const res = await fetch(TAGS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: trimmed }),
  });

  return await handleResponse<TagSuggestion>(res);
}
