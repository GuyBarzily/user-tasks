import { Task, CreateTaskPayload, UpdateTaskPayload } from "./types";

const API_BASE = "http://localhost:5296/api/tasks";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();

  let message = `Request failed (${res.status})`;

  try {
    const data = await res.json();
    message = data?.title || data?.error || message;
  } catch {}

  throw new Error(message);
}

export async function fetchTasks(): Promise<Task[]> {
  try {
    const res = await fetch(API_BASE);
    return await handleResponse<Task[]>(res);
  } catch (err) {
    console.error("fetchTasks failed", err);
    // return Promise.resolve(mockFetchTasks());
    throw err;
  }
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return await handleResponse<Task>(res);
  } catch (err) {
    console.error("createTask failed", err);
    // return Promise.resolve(mockCreateTask(payload));
    throw err;
  }
}

export async function deleteTask(id: number): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const text = await res.text();
      // mockDeleteTask(id);
      throw new Error(`Delete failed ${res.status}: ${text || res.statusText}`);
    }
  } catch (err) {
    console.error("deleteTask failed", err);
    throw err;
  }
}

export async function updateTaskApi(payload: UpdateTaskPayload): Promise<Task> {
  const res = await fetch(`${API_BASE}/${payload.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update failed ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}
