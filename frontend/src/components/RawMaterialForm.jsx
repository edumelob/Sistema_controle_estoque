import { useState } from "react";

const toMessage = (err) => (typeof err === "string" ? err : err?.message ?? "Erro inesperado.");

export default function RawMaterialForm({ initial, onSubmit, onCancel }) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [stock, setStock] = useState(initial?.stockQuantity ?? "");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({ code, name, stockQuantity: Number(stock) });
    } catch (err) {
      setError(toMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="banner error" role="alert">{error}</div>}
      <div className="row">
        <label>
          Código
          <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={50} required />
        </label>
        <label>
          Estoque
          <input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </label>
      </div>
      <label>
        Nome
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} required />
      </label>
      <div className="actions">
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn primary" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
      </div>
    </form>
  );
}
