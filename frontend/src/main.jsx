import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import { createStore } from "./redux/store";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={createStore()}>
      <App />
    </Provider>
  </React.StrictMode>
);
