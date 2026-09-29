import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { products } from "../redux/productsSlice";
import { rawMaterials } from "../redux/rawMaterialsSlice";
import { formatInt, formatMoney } from "../format";
import Modal from "../components/Modal";
import ProductForm from "../components/ProductForm";
import { Empty, ErrorBanner } from "../components/Feedback";

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.products);
  const materials = useSelector((s) => s.rawMaterials.items);
  const [editing, setEditing] = useState(null); // null = fechado | {} = novo | produto = edição
  const [actionError, setActionError] = useState(null);

  const load = () => {
    dispatch(products.fetchAll());
    dispatch(rawMaterials.fetchAll());
  };
  useEffect(load, [dispatch]);

  const isEdit = editing && editing.id;

  async function save(body) {
    const action = isEdit ? products.update({ id: editing.id, body }) : products.create(body);
    await dispatch(action).unwrap();
    setEditing(null);
  }

  async function remove(product) {
    if (!window.confirm(`Excluir o produto "${product.name}"?`)) return;
    setActionError(null);
    try {
      await dispatch(products.remove(product.id)).unwrap();
    } catch (msg) {
      setActionError(String(msg));
    }
  }

  return (
    <section>
      <div className="section-header">
        <h2>Produtos</h2>
        <button className="btn primary" onClick={() => setEditing({})}>Novo produto</button>
      </div>

      <ErrorBanner message={error} onRetry={load} />
      <ErrorBanner message={actionError} />

      {status === "loading" && items.length === 0 && <Empty>Carregando…</Empty>}
      {status !== "loading" && items.length === 0 && !error && <Empty>Nenhum produto cadastrado.</Empty>}

      {items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th className="num">Preço</th>
                <th>Composição</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.code}</td>
                  <td>{p.name}</td>
                  <td className="num">{formatMoney(p.price)}</td>
                  <td>
                    {p.materials.length === 0 ? (
                      <span className="badge warn">Sem composição</span>
                    ) : (
                      p.materials.map((m) => (
                        <span className="chip" key={m.rawMaterialId}>
                          {m.rawMaterialName} × {formatInt(m.quantityRequired)}
                        </span>
                      ))
                    )}
                  </td>
                  <td className="actions-cell">
                    <button className="btn small" onClick={() => setEditing(p)}>Editar</button>
                    <button className="btn small danger" onClick={() => remove(p)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={isEdit ? "Editar produto" : "Novo produto"} onClose={() => setEditing(null)}>
          <ProductForm
            initial={isEdit ? editing : null}
            rawMaterials={materials}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </section>
  );
}
