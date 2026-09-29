import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { rawMaterials } from "../redux/rawMaterialsSlice";
import { formatInt } from "../format";
import Modal from "../components/Modal";
import RawMaterialForm from "../components/RawMaterialForm";
import { Empty, ErrorBanner } from "../components/Feedback";

export default function RawMaterialsPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.rawMaterials);
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState(null);

  const load = () => dispatch(rawMaterials.fetchAll());
  useEffect(() => {
    load();
  }, [dispatch]);

  const isEdit = editing && editing.id;

  async function save(body) {
    const action = isEdit ? rawMaterials.update({ id: editing.id, body }) : rawMaterials.create(body);
    await dispatch(action).unwrap();
    setEditing(null);
  }

  async function remove(item) {
    if (!window.confirm(`Excluir a matéria-prima "${item.name}"?`)) return;
    setActionError(null);
    try {
      await dispatch(rawMaterials.remove(item.id)).unwrap();
    } catch (msg) {
      setActionError(String(msg));
    }
  }

  return (
    <section>
      <div className="section-header">
        <h2>Matérias-primas</h2>
        <button className="btn primary" onClick={() => setEditing({})}>Nova matéria-prima</button>
      </div>

      <ErrorBanner message={error} onRetry={load} />
      <ErrorBanner message={actionError} />

      {status === "loading" && items.length === 0 && <Empty>Carregando…</Empty>}
      {status !== "loading" && items.length === 0 && !error && <Empty>Nenhuma matéria-prima cadastrada.</Empty>}

      {items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th className="num">Estoque</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.code}</td>
                  <td>{r.name}</td>
                  <td className="num">
                    {formatInt(r.stockQuantity)} {r.stockQuantity === 0 && <span className="badge danger">Sem estoque</span>}
                  </td>
                  <td className="actions-cell">
                    <button className="btn small" onClick={() => setEditing(r)}>Editar</button>
                    <button className="btn small danger" onClick={() => remove(r)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={isEdit ? "Editar matéria-prima" : "Nova matéria-prima"} onClose={() => setEditing(null)}>
          <RawMaterialForm initial={isEdit ? editing : null} onSubmit={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </section>
  );
}
