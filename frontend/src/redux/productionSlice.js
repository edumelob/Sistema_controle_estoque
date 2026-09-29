import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api, errorMessage } from "../api";

export const fetchProduction = createAsyncThunk("production/fetch", async (_, { rejectWithValue }) => {
  try {
    return (await api.get("/production")).data;
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

const slice = createSlice({
  name: "production",
  initialState: { lines: [], totalValue: 0, status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProduction.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProduction.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lines = action.payload.lines;
        state.totalValue = action.payload.totalValue;
      })
      .addCase(fetchProduction.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export default slice.reducer;
