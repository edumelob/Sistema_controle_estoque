import { createCrudSlice } from "./crudSlice";

export const products = createCrudSlice("products", "/products");
export default products.reducer;
