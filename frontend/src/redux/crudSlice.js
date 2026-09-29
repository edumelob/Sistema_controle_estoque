import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api, errorMessage } from "../api";

const byName = (a, b) => a.name.localeCompare(b.name, "pt-BR");

/**
 * Fábrica de slice CRUD: evita repetir o mesmo código para produtos e matérias-primas.
 * Os thunks rejeitam com uma mensagem de texto, então `dispatch(...).unwrap()` lança essa mensagem.
 */
export function createCrudSlice(name, path) {
  const safe = (fn) => async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (err) {
      return rejectWithValue(errorMessage(err));
    }
  };

  const fetchAll = createAsyncThunk(`${name}/fetchAll`, safe(async () => (await api.get(path)).data));
  const create = createAsyncThunk(`${name}/create`, safe(async (body) => (await api.post(path, body)).data));
  const update = createAsyncThunk(
    `${name}/update`,
    safe(async ({ id, body }) => (await api.put(`${path}/${id}`, body)).data)
  );
  const remove = createAsyncThunk(
    `${name}/remove`,
    safe(async (id) => {
      await api.delete(`${path}/${id}`);
      return id;
    })
  );

  const slice = createSlice({
    name,
    initialState: { items: [], status: "idle", error: null },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchAll.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(fetchAll.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.items = action.payload;
        })
        .addCase(fetchAll.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload ?? action.error.message;
        })
        .addCase(create.fulfilled, (state, action) => {
          state.items.push(action.payload);
          state.items.sort(byName);
        })
        .addCase(update.fulfilled, (state, action) => {
          const i = state.items.findIndex((x) => x.id === action.payload.id);
          if (i >= 0) state.items[i] = action.payload;
          state.items.sort(byName);
        })
        .addCase(remove.fulfilled, (state, action) => {
          state.items = state.items.filter((x) => x.id !== action.payload);
        });
    },
  });

  return { reducer: slice.reducer, fetchAll, create, update, remove };
}
