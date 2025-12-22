export type TaskItem = {
    id: number;
    title: string;
    isDone: boolean;
  };
  const baseUrl = 'https://localhost:7204'

  export async function getHealth() {
    const res = await fetch(baseUrl + '/api/tasks');
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  }
  
  export async function getTasks(): Promise<TaskItem[]> {
    const res = await fetch(baseUrl + '/api/tasks');
    if (!res.ok) throw new Error('Failed to load tasks');
    return res.json();
  }
  
  export async function createTask(title: string): Promise<TaskItem> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  }
  