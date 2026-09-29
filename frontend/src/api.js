import axios from "axios";

export const api = axios.create({ baseURL: "/api" });

/** Converte qualquer erro do axios numa mensagem amigável em português. */
export function errorMessage(err) {
  const data = err?.response?.data;
  if (data?.message) return data.message;
  if (Array.isArray(data?.violations) && data.violations.length > 0) {
    return data.violations.map((v) => v.message).join(" • ");
  }
  if (err?.response) return `Erro ${err.response.status} ao comunicar com o servidor.`;
  return "Não foi possível conectar ao servidor.";
}
