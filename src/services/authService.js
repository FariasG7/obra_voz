import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_NEON_DATABASE_URL, { disableWarningInBrowsers: true });

export async function autenticarUtilizador(email, senha) {
  try {
    console.log("Tentando autenticar e-mail:", email);
    const resultado = await sql`SELECT * FROM usuarios WHERE email = ${email}`;

    console.log("Resultado bruto do Neon:", resultado);

    if (!resultado || resultado.length === 0) {
      return { sucesso: false, erro: 'Utilizador não encontrado. Verifique os dados ou cadastre-se.' };
    }

    const usuario = resultado[0];
    console.log("Utilizador encontrado no banco:", usuario);

    // Valida usando a coluna 'password'
    if (usuario.password !== senha) {
      return { sucesso: false, erro: 'Senha incorreta.' };
    }

    return { 
      sucesso: true, 
      usuario: { 
        id: usuario.id, 
        email: usuario.email, 
        nome: usuario.nome || 'Guilherme' 
      } 
    };

  } catch (err) {
    console.error('DETALHE DO ERRO NO AUTHSERVICE:', err);
    return { sucesso: false, erro: 'Erro interno ao processar o login.' };
  }
}
