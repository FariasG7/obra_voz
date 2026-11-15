const MAPA_OBRAS_UUID = {
  "The Residences Vale do Lobo": "a0000000-0000-0000-0000-000000000001",
  "Residencias Vale do Lobo": "a0000000-0000-0000-0000-000000000001",
  "Obra Geral Algarve": "a0000000-0000-0000-0000-000000000002",
  "Edifício Marina Olhão": "a0000000-0000-0000-0000-000000000003",
  "Edificio Marina Olhao": "a0000000-0000-0000-0000-000000000003"
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function prepararParaSync(diarioLocal) {
  const rawId = diarioLocal.obra_id || '';
  
  // Se já for um UUID válido, mantém; caso contrário, converte pelo mapa ou usa o fallback
  const obraIdFormatado = UUID_REGEX.test(rawId)
    ? rawId
    : (MAPA_OBRAS_UUID[rawId] || "a0000000-0000-0000-0000-000000000001");

  return {
    ...diarioLocal,
    obra_id: obraIdFormatado
  };
}
