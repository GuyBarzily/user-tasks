import { Task, CreateTaskPayload } from "./types";
import { mockFetchTasks, mockCreateTask, mockDeleteTask } from "./mockApi";

// MOCK_FALLBACK: easy removal later -> delete mockApi.ts + remove these fallback branches
const API_BASE = "https://localhost:7204/api/tasks";

export async function fetchTasks(): Promise<Task[]> {
  try {
    const res = await fetch(API_BASE);

    if (!res.ok) {
      // MOCK_FALLBACK
      return Promise.resolve(mockFetchTasks());
    }

    return res.json();
  } catch {
    // MOCK_FALLBACK (server down / cert / CORS)
    return Promise.resolve(mockFetchTasks());
  }
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // MOCK_FALLBACK
      return Promise.resolve(mockCreateTask(payload));
    }

    return res.json();
  } catch {
    // MOCK_FALLBACK
    return Promise.resolve(mockCreateTask(payload));
  }
}

export async function deleteTask(id: number): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });

    if (!res.ok) {
      // MOCK_FALLBACK
      mockDeleteTask(id);
      return;
    }
  } catch {
    // MOCK_FALLBACK
    mockDeleteTask(id);
    return;
  }
}
