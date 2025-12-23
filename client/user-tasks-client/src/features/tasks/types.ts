export type TaskPriority = 0 | 1 | 2;

export type Task = {
  id: number;
  title: string;
  description: string;
  dueDateUtc: string | null;
  priority: TaskPriority;

  userFullName: string;
  userTelephone: string;
  userEmail: string;

  tags: string[];

  createdAtUtc: string;
};

export type CreateTaskPayload = {
  title: string;
  description: string;
  dueDateUtc: string | null;
  priority: TaskPriority;

  userFullName: string;
  userTelephone: string;
  userEmail: string;

  tags: string[];
};
