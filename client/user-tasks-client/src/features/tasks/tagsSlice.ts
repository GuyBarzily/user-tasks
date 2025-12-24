import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createTagApi,
  fetchAllTags,
  type TagSuggestion,
} from "../tasks/tagsApi";

type TagsState = {
  items: TagSuggestion[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: TagsState = {
  items: [],
  status: "idle",
  error: null,
};

// Optional: load all tags (useful later if you want a tag dropdown/catalog)
export const loadTags = createAsyncThunk<TagSuggestion[]>(
  "tags/loadTags",
  async () => {
    return await fetchAllTags();
  }
);

// ✅ create tag thunk
export const createTag = createAsyncThunk<TagSuggestion, string>(
  "tags/createTag",
  async (name: string) => {
    return await createTagApi(name);
  }
);

const tagsSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {
    clearTagsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // load tags
      .addCase(loadTags.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        loadTags.fulfilled,
        (state, action: PayloadAction<TagSuggestion[]>) => {
          state.status = "succeeded";
          state.items = action.payload;
        }
      )
      .addCase(loadTags.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load tags";
      })

      // create tag
      .addCase(createTag.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        createTag.fulfilled,
        (state, action: PayloadAction<TagSuggestion>) => {
          state.status = "succeeded";

          // avoid duplicates (by id OR name)
          const exists =
            state.items.some((t) => t.id === action.payload.id) ||
            state.items.some(
              (t) => t.name.toLowerCase() === action.payload.name.toLowerCase()
            );

          if (!exists) state.items.push(action.payload);
        }
      )
      .addCase(createTag.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to create tag";
      });
  },
});

export const { clearTagsError } = tagsSlice.actions;
export default tagsSlice.reducer;
