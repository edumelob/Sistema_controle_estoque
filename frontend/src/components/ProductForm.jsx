import { useState } from "react";

const toMessage = (err) => (typeof err === "string" ? err : err?.message ?? "Erro inesperado.");

export default function ProductForm({ initial, rawMaterials, onSubmit, onCancel }) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [lines, setLines] = useState(
    (initial?.materials ?? []).map((m) => ({
      rawMaterialId: String(m.rawMaterialId),
      quantityRequired: String(m.quantityRequired),
    }))
  );
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const updateLine = (index, patch) =>
    setLines((current) => current.map((l, i) => (i === index ? { ...l, ...patch } : l)));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (lines.some((l) => !l.rawMaterialId || !l.quantityRequired)) {
      setError("Preencha todas as linhas da composição ou remova as vazias.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        code,
        name,
        price: Number(price),
        materials: lines.map((l) => ({
          rawMaterialId: Number(l.rawMaterialId),
          quantityRequired: Number(l.quantityRequired),
        })),
      });
    } catch (err) {
      setError(toMessage(err));
      setSaving(false);
    }
  }

  const chosen = new Set(lines.map((l) => l.rawMaterialId));

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="banner error" role="alert">{error}</div>}

      <div className="row">
        <label>
          Código
          <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={50} required />
        </label>
        <label>
          Preço (R$)
          <input type="number" step="0.01" min="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </label>
      </div>
      <label>
        Nome
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} required />
      </label>

      <fieldset>
        <legend>Composição (matérias-primas por unidade)</legend>
        {lines.length === 0 && <p className="muted">Nenhuma matéria-prima associada ainda.</p>}
        {lines.map((line, i) => (
          <div className="row material-row" key={i}>
            <select
              aria-label={`Matéria-prima ${i + 1}`}
              value={line.rawMaterialId}
              onChange={(e) => updateLine(i, { rawMaterialId: e.target.value })}
            >
              <option value="">Selecione…</option>
              {rawMaterials.map((rm) => (
                <option key={rm.id} value={rm.id} disabled={chosen.has(String(rm.id)) && String(rm.id) !== line.rawMaterialId}>
                  {rm.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Qtd."
              aria-label={`Quantidade ${i + 1}`}
              value={line.quantityRequired}
              onChange={(e) => updateLine(i, { quantityRequired: e.target.value })}
            />
            <button type="button" className="btn small danger" onClick={() => setLines((c) => c.filter((_, idx) => idx !== i))}>
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn small"
          onClick={() => setLines((c) => [...c, { rawMaterialId: "", quantityRequired: "" }])}
          disabled={rawMaterials.length === 0}
        >
          + Adicionar matéria-prima
        </button>
        {rawMaterials.length === 0 && <p className="muted">Cadastre matérias-primas primeiro para montar a composição.</p>}
      </fieldset>

      <div className="actions">
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn primary" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
      </div>
    </form>
  );
}
