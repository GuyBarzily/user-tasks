import type { Task, CreateTaskPayload, Tag } from "./types";

/**
 * Mock storage (in-memory).
 * Easy to remove later: delete this file + remove the imports/usages in tasksApi.ts
 */

// ✅ mock tag catalog (simulates tags table)
const mockTags: Tag[] = [
  { id: 1, name: "frontend" },
  { id: 2, name: "redux" },
  { id: 3, name: "backend" },
  { id: 4, name: "ef" },
  { id: 5, name: "docker" },
];

const tagsById = new Map<number, Tag>(mockTags.map((t) => [t.id, t]));

let mockTasks: Task[] = [
  {
    id: 1,
    title: "Mock: interview assignment",
    description: "Build tasks app UI without backend",
    dueDateUtc: new Date(Date.now() + 86400000).toISOString(),
    priority: 2,
    userFullName: "Guy Barzily",
    userTelephone: "+972-50-1234567",
    userEmail: "guy@example.com",
    tags: [tagsById.get(1)!, tagsById.get(2)!], // ✅ Tag[]
    createdAtUtc: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Mock: connect API later",
    description: "Switch mock fallback off when server is ready",
    dueDateUtc: null,
    priority: 1,
    userFullName: "",
    userTelephone: "",
    userEmail: "",
    tags: [tagsById.get(3)!, tagsById.get(4)!, tagsById.get(5)!], // ✅ Tag[]
    createdAtUtc: new Date().toISOString(),
  },
];

let nextId = 3;

export function mockFetchTasks(): Task[] {
  return [...mockTasks].sort((a, b) => a.id - b.id);
}

export function mockCreateTask(payload: CreateTaskPayload): Task {
  const tags: Tag[] = payload.tags
    .map((id) => tagsById.get(id))
    .filter(Boolean) as Tag[];

  const task: Task = {
    id: nextId++,
    title: payload.title.trim(),
    description: payload.description ?? "",
    dueDateUtc: payload.dueDateUtc ?? null,
    priority: payload.priority ?? 2,
    userFullName: payload.userFullName ?? "",
    userTelephone: payload.userTelephone ?? "",
    userEmail: payload.userEmail ?? "",
    tags, // ✅ Tag[]
    createdAtUtc: new Date().toISOString(),
  };

  mockTasks = [...mockTasks, task];
  return task;
}

export function mockDeleteTask(id: number): void {
  mockTasks = mockTasks.filter((t) => t.id !== id);
}
