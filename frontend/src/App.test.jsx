import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { api } from "./api";
import { createStore } from "./redux/store";

vi.mock("./api", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  errorMessage: (err) => err?.response?.data?.message ?? "erro",
}));

const RAW = [
  { id: 1, code: "MP-1", name: "Madeira", stockQuantity: 10 },
  { id: 2, code: "MP-2", name: "Parafuso", stockQuantity: 0 },
];
const PRODUCTS = [
  { id: 1, code: "PR-1", name: "Mesa", price: 100, materials: [{ rawMaterialId: 1, rawMaterialName: "Madeira", quantityRequired: 2 }] },
];
const PRODUCTION = {
  totalValue: 500,
  lines: [{ productId: 1, code: "PR-1", name: "Mesa", unitPrice: 100, quantity: 5, totalValue: 500, limitingMaterial: "Madeira" }],
};

function renderApp() {
  return render(
    <Provider store={createStore()}>
      <App />
    </Provider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockImplementation(async (url) => ({
    data: url === "/production" ? PRODUCTION : url === "/products" ? PRODUCTS : RAW,
  }));
});

describe("App", () => {
  it("mostra a sugestão de produção na tela inicial", async () => {
    renderApp();
    expect(await screen.findByText("PR-1 — Mesa")).toBeInTheDocument();
    expect(screen.getByText(/Limitado por: Madeira/)).toBeInTheDocument();
    expect(screen.getAllByText(/500,00/).length).toBeGreaterThan(0);
  });

  it("lista produtos com a composição", async () => {
    renderApp();
    await userEvent.click(screen.getByRole("button", { name: "Produtos" }));
    expect(await screen.findByText("Mesa")).toBeInTheDocument();
    expect(screen.getByText("Madeira × 2")).toBeInTheDocument();
  });

  it("avisa quando a matéria-prima está sem estoque", async () => {
    renderApp();
    await userEvent.click(screen.getByRole("button", { name: "Matérias-primas" }));
    expect(await screen.findByText("Parafuso")).toBeInTheDocument();
    expect(screen.getByText("Sem estoque")).toBeInTheDocument();
  });

  it("cria uma matéria-prima enviando os dados para a API", async () => {
    api.post.mockResolvedValue({ data: { id: 3, code: "MP-3", name: "Cola", stockQuantity: 7 } });
    renderApp();
    await userEvent.click(screen.getByRole("button", { name: "Matérias-primas" }));
    await screen.findByText("Parafuso");

    await userEvent.click(screen.getByRole("button", { name: "Nova matéria-prima" }));
    const dialog = screen.getByRole("dialog");
    await userEvent.type(within(dialog).getByLabelText("Código"), "MP-3");
    await userEvent.type(within(dialog).getByLabelText("Nome"), "Cola");
    await userEvent.type(within(dialog).getByLabelText("Estoque"), "7");
    await userEvent.click(within(dialog).getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/raw-materials", { code: "MP-3", name: "Cola", stockQuantity: 7 })
    );
    expect(await screen.findByText("Cola")).toBeInTheDocument();
  });

  it("mostra o erro do servidor ao falhar uma exclusão", async () => {
    api.delete.mockRejectedValue({ response: { data: { message: "Matéria-prima em uso" } } });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderApp();
    await userEvent.click(screen.getByRole("button", { name: "Matérias-primas" }));
    await screen.findByText("Madeira");

    await userEvent.click(screen.getAllByRole("button", { name: "Excluir" })[0]);
    expect(await screen.findByRole("alert")).toHaveTextContent("Matéria-prima em uso");
  });
});
