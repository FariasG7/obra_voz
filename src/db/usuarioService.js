import { db } from './db';

// --- CADASTRAR OU ATUALIZAR UTILIZADOR NO INDEXEDDB ---
export async function cadastrarUsuarioLocal(nome, email, permissao) {
  try {
    const emailLimpo = email.toLowerCase().trim();
    
    // Verifica se o e-mail já existe no banco
    const usuarioExistente = await db.usuarios.where('email').equals(emailLimpo).first();

    if (usuarioExistente) {
      // Atualiza a permissão caso já exista
      await db.usuarios.update(usuarioExistente.id, { nome, permissao });
      return { sucesso: true, mensagem: "Permissão atualizada com sucesso!" };
    }

    // Adiciona novo utilizador
    const id = await db.usuarios.add({
      nome,
      email: emailLimpo,
      permissao,
      criadoEm: new Date()
    });

    return { sucesso: true, id, mensagem: "Utilizador autorizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao cadastrar utilizador no Dexie:", error);
    return { sucesso: false, erro: "Erro ao guardar no banco local." };
  }
}

// --- LISTAR TODOS OS UTILIZADORES AUTORIZADOS ---
export async function listarUsuariosLocais() {
  try {
    return await db.usuarios.toArray();
  } catch (error) {
    console.error("Erro ao listar utilizadores:", error);
    return [];
  }
}

// --- REMOVER PERMISSÃO DE UM UTILIZADOR ---
export async function removerUsuarioLocal(id) {
  try {
    await db.usuarios.delete(id);
    return { sucesso: true };
  } catch (error) {
    console.error("Erro ao remover utilizador:", error);
    return { sucesso: false, erro: "Não foi possível remover." };
  }
}
