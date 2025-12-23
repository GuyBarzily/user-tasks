import { useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';

import PageContainer from './shared/components/PageContainer';
import LoadingBox from './shared/components/LoadingBox';
import ErrorBox from './shared/components/ErrorBox';

import TaskForm from './features/tasks/components/TaskForm';
import TaskList from './features/tasks/components/TaskList';
import TaskFilters from './features/tasks/components/TaskFilters';

import { useAppDispatch, useAppSelector } from './app/hooks';
import {
  loadTasks,
  addTask,
  removeTask,
  clearTasksError,
} from './features/tasks/tasksSlice';

import type { CreateTaskPayload } from './features/tasks/types';

export default function App() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.tasks);

  useEffect(() => {
    dispatch(loadTasks());
  }, [dispatch]);

  const onCreate = (payload: CreateTaskPayload) => {
    dispatch(addTask(payload));
  };

  const onDelete = (id: number) => {
    dispatch(removeTask(id));
  };

  const onRetry = () => {
    dispatch(clearTasksError());
    dispatch(loadTasks());
  };

  return (
    <PageContainer
      title="User Tasks"
      subtitle="React + Redux Toolkit + .NET + SQL Server"
    >
      <Card className="shadow-sm border-0">
        <Card.Body>
          <TaskForm onSubmit={onCreate} isSubmitting={status === 'loading'} />

          {error && (
            <div className="mt-3">
              <ErrorBox message={error} />
              <Button
                variant="outline-secondary"
                size="sm"
                className="mt-2"
                onClick={onRetry}
              >
                Retry
              </Button>
            </div>
          )}

          <div className="mt-4">
            <TaskFilters total={items.length} />

            {status === 'loading' ? (
              <LoadingBox text="Loading tasks..." />
            ) : (
              <TaskList tasks={items} onDelete={onDelete} />
            )}
          </div>
        </Card.Body>
      </Card>
    </PageContainer>
  );
}
