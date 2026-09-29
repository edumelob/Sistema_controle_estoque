import { useState } from "react";
import ProductsPage from "./pages/ProductsPage";
import RawMaterialsPage from "./pages/RawMaterialsPage";
import ProductionPage from "./pages/ProductionPage";

const TABS = [
  { id: "products", label: "Produtos", Page: ProductsPage },
  { id: "raw", label: "Matérias-primas", Page: RawMaterialsPage },
  { id: "production", label: "Produção", Page: ProductionPage },
];

export default function App() {
  const [tab, setTab] = useState("production");
  const { Page } = TABS.find((t) => t.id === tab);

  return (
    <div className="app">
      <header className="topbar">
        <h1>Controle de Estoque</h1>
        <nav aria-label="Seções">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={t.id === tab ? "tab active" : "tab"}
              aria-current={t.id === tab ? "page" : undefined}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        <Page />
      </main>
    </div>
  );
}
