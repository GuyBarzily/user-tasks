export type TagSuggestion = { id: number; name: string };

// MOCK_FALLBACK: easy removal later (delete mock section + replace with real fetch)
const MOCK_TAGS: TagSuggestion[] = [
  { id: 1, name: "backend" },
  { id: 2, name: "frontend" },
  { id: 3, name: "redux" },
  { id: 4, name: "ef" },
  { id: 5, name: "docker" },
  { id: 6, name: "sql" },
  { id: 7, name: "api" },
  { id: 8, name: "testing" },
];

// When server exists, point this to your endpoint, e.g.:
// GET https://localhost:7204/api/tags?query=do
const TAGS_ENDPOINT = "https://localhost:7204/api/tags";

export async function searchTags(query: string): Promise<TagSuggestion[]> {
  const q = query.trim();
  if (q.length < 1) return [];

  // MOCK_FALLBACK
  try {
    const res = await fetch(`${TAGS_ENDPOINT}?query=${encodeURIComponent(q)}`);
    if (!res.ok) {
      return mockSearch(q);
    }
    return res.json();
  } catch {
    return mockSearch(q);
  }
}

function mockSearch(q: string): TagSuggestion[] {
  const lower = q.toLowerCase();
  return MOCK_TAGS.filter((t) => t.name.toLowerCase().includes(lower)).slice(
    0,
    8
  );
}
