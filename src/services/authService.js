import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_NEON_DATABASE_URL, { disableWarningInBrowsers: true });

export async function autenticarUtilizador(email, senha) {
  try {
    const resultado = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (!resultado || resultado.length === 0) {
      return { sucesso: false, erro: 'Utilizador não encontrado. Verifique os dados ou cadastre-se.' };
    }

    const usuario = resultado[0];

    // Valida o campo de senha (verifique se na sua tabela o campo se chama 'senha' ou 'password')
    if (usuario.senha !== senha) {
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
    console.error('Erro no serviço de autenticação:', err);
    return { sucesso: false, erro: 'Erro de conexão com o banco de dados.' };
  }
}
