const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const integer = new Intl.NumberFormat("pt-BR");

export const formatMoney = (value) => currency.format(Number(value ?? 0));
export const formatInt = (value) => integer.format(Number(value ?? 0));
