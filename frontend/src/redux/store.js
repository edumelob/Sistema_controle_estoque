import { configureStore } from "@reduxjs/toolkit";
import products from "./productsSlice";
import rawMaterials from "./rawMaterialsSlice";
import production from "./productionSlice";

export const createStore = () => configureStore({ reducer: { products, rawMaterials, production } });
