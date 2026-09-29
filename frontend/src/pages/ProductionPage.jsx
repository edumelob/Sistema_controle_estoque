import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduction } from "../redux/productionSlice";
import { formatInt, formatMoney } from "../format";
import { Empty, ErrorBanner } from "../components/Feedback";

function note(line) {
  if (line.limitingMaterial == null) return <span className="badge warn">Sem composição</span>;
  if (line.quantity === 0) return <span className="badge danger">Sem estoque de {line.limitingMaterial}</span>;
  return <span className="muted">Limitado por: {line.limitingMaterial}</span>;
}

export default function ProductionPage() {
  const dispatch = useDispatch();
  const { lines, totalValue, status, error } = useSelector((s) => s.production);

  const load = () => dispatch(fetchProduction());
  useEffect(() => {
    load();
  }, [dispatch]);

  const producing = lines.filter((l) => l.quantity > 0).length;

  return (
    <section>
      <div className="section-header">
        <h2>Sugestão de produção</h2>
        <button className="btn" onClick={load} disabled={status === "loading"}>Recalcular</button>
      </div>

      <p className="muted intro">
        Com o estoque atual, os produtos de maior preço unitário são produzidos primeiro; o que sobra de
        matéria-prima vai para os próximos da lista.
      </p>

      <ErrorBanner message={error} onRetry={load} />

      {lines.length > 0 && (
        <div className="cards">
          <div className="card">
            <span className="card-label">Valor total estimado</span>
            <strong className="card-value">{formatMoney(totalValue)}</strong>
          </div>
          <div className="card">
            <span className="card-label">Produtos que podem ser produzidos</span>
            <strong className="card-value">{producing} de {lines.length}</strong>
          </div>
        </div>
      )}

      {status !== "loading" && lines.length === 0 && !error && (
        <Empty>Cadastre produtos e matérias-primas para ver a sugestão de produção.</Empty>
      )}

      {lines.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Produto</th>
                <th className="num">Preço unit.</th>
                <th className="num">Qtd. sugerida</th>
                <th className="num">Valor total</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={l.productId}>
                  <td>{i + 1}</td>
                  <td>{l.code} — {l.name}</td>
                  <td className="num">{formatMoney(l.unitPrice)}</td>
                  <td className="num"><strong>{formatInt(l.quantity)}</strong></td>
                  <td className="num">{formatMoney(l.totalValue)}</td>
                  <td>{note(l)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
