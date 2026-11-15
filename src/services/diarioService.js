// Exemplo de mapeamento de nomes para os UUIDs reais cadastrados no Neon/PostgreSQL
const MAPA_OBRAS_UUID = {
  "Residencias Vale do Lobo": "a0000000-0000-0000-0000-000000000001",
  "Obra Geral Algarve": "a0000000-0000-0000-0000-000000000002",
  "Edifício Marina Olhão": "a0000000-0000-0000-0000-000000000003"
};

// Na hora de enviar o diário para a nuvem:
function prepararParaSync(diarioLocal) {
  const obraIdFormatado = MAPA_OBRAS_UUID[diarioLocal.obra_id] || "a0000000-0000-0000-0000-000000000001"; // UUID padrão fallback se não encontrar

  return {
    ...diarioLocal,
    obra_id: obraIdFormatado // Agora é um UUID válido exigido pelo PostgreSQL!
  };
}
