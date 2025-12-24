import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "../features/tasks/tasksSlice";
import tagsReducer from "../features/tasks/tagsSlice";

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    tags: tagsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
