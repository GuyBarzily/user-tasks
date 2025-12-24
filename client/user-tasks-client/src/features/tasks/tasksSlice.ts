import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Task, CreateTaskPayload, UpdateTaskPayload } from "./types";
import * as api from "./tasksApi";

type TasksState = {
  items: Task[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: TasksState = {
  items: [],
  status: "idle",
  error: null,
};

/* =======================
   Async Thunks
======================= */

export const loadTasks = createAsyncThunk("tasks/loadTasks", async () => {
  return await api.fetchTasks();
});

export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (payload: CreateTaskPayload) => {
    return await api.createTask(payload);
  }
);

export const removeTask = createAsyncThunk(
  "tasks/removeTask",
  async (id: number) => {
    await api.deleteTask(id);
    return id;
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (payload: UpdateTaskPayload) => {
    return await api.updateTaskApi(payload);
  }
);

/* =======================
   Slice
======================= */

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTasksError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load tasks
      .addCase(loadTasks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load tasks";
      })

      // Add task
      .addCase(addTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.items.push(action.payload);
      })

      // Remove task
      .addCase(removeTask.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((task) => task.id !== action.payload);
      })
      .addCase(updateTask.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.status = "succeeded";

        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to update task";
      });
  },
});

export const { clearTasksError } = tasksSlice.actions;
export default tasksSlice.reducer;
