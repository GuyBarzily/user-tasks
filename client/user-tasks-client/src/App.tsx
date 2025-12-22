import React, { useEffect, useState } from 'react';
import { createTask, getHealth, getTasks, TaskItem } from './services/tasksService'

function App() {
  const [health, setHealth] = useState<any>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        setError('');
        setHealth(await getHealth());
        setTasks(await getTasks());
      } catch (e: any) {
        setError(e?.message ?? 'Something went wrong');
      }
    })();
  }, []);

  const onAdd = async () => {
    try {
      setError('');
      const created = await createTask(title);
      setTasks(prev => [...prev, created]);
      setTitle('');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to add');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'Arial' }}>
      <h1>User Tasks</h1>

      {error && <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>}

      <div style={{ marginBottom: 12 }}>
        <strong>Health:</strong> {health ? JSON.stringify(health) : 'Loading...'}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task title"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={onAdd} disabled={!title.trim()} style={{ padding: '8px 12px' }}>
          Add
        </button>
      </div>

      <ul>
        {tasks.map(t => (
          <li key={t.id}>
            #{t.id} — {t.title} {t.isDone ? '✅' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
