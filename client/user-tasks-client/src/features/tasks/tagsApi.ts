export type TagSuggestion = { id: number; name: string };

// MOCK_FALLBACK
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

let nextMockTagId = 100;

const TAGS_ENDPOINT = "https://localhost:7204/api/tags";

export async function searchTags(query: string): Promise<TagSuggestion[]> {
  const q = query.trim();
  if (q.length < 1) return [];

  try {
    const res = await fetch(`${TAGS_ENDPOINT}?query=${encodeURIComponent(q)}`);
    if (!res.ok) return mockSearch(q);
    return res.json();
  } catch {
    return mockSearch(q);
  }
}

// ✅ optional (if later you want to load all tags)
export async function fetchAllTags(): Promise<TagSuggestion[]> {
  try {
    const res = await fetch(`${TAGS_ENDPOINT}`);
    if (!res.ok) return [...MOCK_TAGS];
    return res.json();
  } catch {
    return [...MOCK_TAGS];
  }
}

// ✅ create tag
export async function createTagApi(name: string): Promise<TagSuggestion> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Tag name is required");

  try {
    const res = await fetch(TAGS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    if (!res.ok) {
      // MOCK_FALLBACK
      return mockCreate(trimmed);
    }

    return res.json();
  } catch {
    return mockCreate(trimmed);
  }
}

function mockSearch(q: string): TagSuggestion[] {
  const lower = q.toLowerCase();
  return MOCK_TAGS.filter((t) => t.name.toLowerCase().includes(lower)).slice(
    0,
    8
  );
}

// ✅ mock create
function mockCreate(name: string): TagSuggestion {
  const exists = MOCK_TAGS.some(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    // return existing (simulate unique index on name)
    return MOCK_TAGS.find((t) => t.name.toLowerCase() === name.toLowerCase())!;
  }

  const created: TagSuggestion = { id: nextMockTagId++, name };
  MOCK_TAGS.push(created);
  return created;
}
