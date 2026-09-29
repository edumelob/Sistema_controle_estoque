import { createCrudSlice } from "./crudSlice";

export const rawMaterials = createCrudSlice("rawMaterials", "/raw-materials");
export default rawMaterials.reducer;
