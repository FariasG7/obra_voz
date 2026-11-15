// src/utils/textFormatter.js

export function formatarEPolirTexto(textoBruto) {
  if (!textoBruto) return '';

  let texto = textoBruto.trim();

  // 1. Corrige espaçamentos antes de pontuação (ex: "olá ." -> "olá.")
  texto = texto.replace(/\s+([.,;:!?])/g, '$1');

  // 2. Garante espaço após pontuação (ex: "fim.Vamos" -> "fim. Vamos")
  texto = texto.replace(/([.,;:!?])(?=[^\s])/g, '$1 ');

  // 3. Coloca a primeira letra da frase em maiúscula
  texto = texto.charAt(0).toUpperCase() + texto.slice(1);

  // 4. Coloca maiúscula após ponto final, interrogação ou exclamação
  texto = texto.replace(/([.!?]\s+)([a-zÀ-ÿ])/g, (match, sep, letra) => sep + letra.toUpperCase());

  // 5. Substituições úteis de termos comuns de obra ditados por voz (opcional e ajustável)
  const termosCorrigidos = {
    'betonagem': 'betonagem',
    'cofragem': 'cofragem',
    'val-de-lobo': 'Vale do Lobo',
    'vale do lobo': 'Vale do Lobo'
  };

  Object.keys(termosCorrigidos).forEach(termo => {
    const regex = new RegExp(`\\b${termo}\\b`, 'gi');
    texto = texto.replace(regex, termosCorrigidos[termo]);
  });

  // 6. Garante que termina com um ponto final se não tiver pontuação no fim
  if (texto.length > 0 && !/[.!?]$/.test(texto)) {
    texto += '.';
  }

  return texto;
}