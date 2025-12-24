import { useEffect, useState } from "react";
import { Card, Button } from "react-bootstrap";

import PageContainer from "./shared/components/PageContainer";
import LoadingBox from "./shared/components/LoadingBox";
import ErrorBox from "./shared/components/ErrorBox";

import TaskForm from "./features/tasks/components/TaskForm";
import TaskList from "./features/tasks/components/TaskList";
import TaskFilters from "./features/tasks/components/TaskFilters";
import TaskEditModal from "./features/tasks/components/TaskEditModal";

import { useAppDispatch, useAppSelector } from "./app/hooks";
import { loadTasks, addTask, removeTask, clearTasksError, updateTask } from "./features/tasks/tasksSlice";


import type { CreateTaskPayload, UpdateTaskPayload, Task } from "./features/tasks/types";
import TagCreateModal from "./features/tasks/components/TagCreateModal";
import { createTag } from "./features/tasks/tagsSlice";

export default function App() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.tasks);
  const tagsState = useAppSelector((s) => s.tags);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showTagModal, setShowTagModal] = useState(false);

  useEffect(() => {
    dispatch(loadTasks());
  }, [dispatch]);

  const onCreate = (payload: CreateTaskPayload) => dispatch(addTask(payload));
  const onDelete = (id: number) => dispatch(removeTask(id));

  const onRetry = () => {
    dispatch(clearTasksError());
    dispatch(loadTasks());
  };

  const onOpenEdit = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const onCloseEdit = () => {
    setShowEditModal(false);
    setEditingTask(null);
  };

  const onSubmitEdit = (payload: UpdateTaskPayload) => {
    dispatch(updateTask(payload));
    onCloseEdit();
  };

  const onOpenAddTag = () => setShowTagModal(true);
  const onCloseAddTag = () => setShowTagModal(false);

  const onSubmitAddTag = async (name: string) => {
    await dispatch(createTag(name));
    onCloseAddTag();
  };

  return (
    <PageContainer title="User Tasks" subtitle="React + Redux Toolkit + .NET + SQL Server">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <TaskForm
            onSubmit={onCreate}
            onAddTagClick={onOpenAddTag}
            isSubmitting={status === "loading"}
          />

          {error && (
            <div className="mt-3">
              <ErrorBox message={error} />
              <Button variant="outline-secondary" size="sm" className="mt-2" onClick={onRetry}>
                Retry
              </Button>
            </div>
          )}

          <div className="mt-4">
            <TaskFilters total={items.length} />

            {status === "loading" ? (
              <LoadingBox text="Loading tasks..." />
            ) : (
              <TaskList tasks={items} onDelete={onDelete} onUpdate={onOpenEdit} />
            )}
          </div>
        </Card.Body>
      </Card>

      <TaskEditModal
        show={showEditModal}
        task={editingTask}
        onClose={onCloseEdit}
        onSubmit={onSubmitEdit}
      />

      <TagCreateModal
        show={showTagModal}
        onClose={onCloseAddTag}
        onSubmit={onSubmitAddTag}
        isSubmitting={tagsState.status === "loading"}
      />
    </PageContainer>
  );
}
