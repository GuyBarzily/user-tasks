import { Task, CreateTaskPayload } from "./types";

const API_BASE = "http://localhost:5296/api/tasks";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

export async function fetchTasks(): Promise<Task[]> {
  try {
    const res = await fetch(API_BASE);
    return await handleResponse<Task[]>(res);
  } catch (err) {
    console.error("fetchTasks failed", err);
    throw err; // let Redux / caller handle it
  }
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  try {
    debugger
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return await handleResponse<Task>(res);
  } catch (err) {
    console.error("createTask failed", err);
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
      throw new Error(`Delete failed ${res.status}: ${text || res.statusText}`);
    }
  } catch (err) {
    console.error("deleteTask failed", err);
    throw err;
  }
}
