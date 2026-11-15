import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_NEON_DATABASE_URL, { disableWarningInBrowsers: true });

export async function autenticarUtilizador(email, senha) {
  try {
    const resultado = await sql`SELECT * FROM usuarios WHERE email = ${email}`;

    if (!resultado || resultado.length === 0) {
      return { sucesso: false, erro: 'Utilizador não encontrado. Verifique os dados ou cadastre-se.' };
    }

    const usuario = resultado[0];

    if (usuario.password !== senha) {
      return { sucesso: false, erro: 'Senha incorreta.' };
    }

    return { 
      sucesso: true, 
      usuario: { 
        id: String(usuario.id), // Garante que o ID UUID seja tratado como string de forma segura
        email: usuario.email, 
        nome: usuario.nome || 'Guilherme',
        permissao: usuario.permissao || 'user'
      } 
    };

  } catch (err) {
    console.error('DETALHE DO ERRO NO AUTHSERVICE:', err);
    return { sucesso: false, erro: 'Erro interno ao processar o login.' };
  }
}
