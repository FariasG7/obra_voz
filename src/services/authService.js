import { db } from '../db/db';
import { sql } from '../services/neonClient';


// --- AUTENTICAR UTILIZADOR (RESILIENTE COM FALLBACK LOCAL) ---
export async function autenticarUtilizador(email, password) {
  const emailLimpo = email.toLowerCase().trim();

  try {
    // Tenta primeiro o Neon se houver rede e o sql estiver configurado
    if (navigator.onLine && typeof sql === 'function') {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout de ligação')), 4000)
        );

        const queryPromise = sql`
          SELECT id, nome, email, permissao, password 
          FROM usuarios 
          WHERE email = ${emailLimpo} AND password = ${password}
          LIMIT 1;
        `;

        const resultado = await Promise.race([queryPromise, timeoutPromise]);

        if (resultado && resultado.length > 0) {
          const usuario = resultado[0];
          
          await db.usuarios.put({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            permissao: usuario.permissao,
            synced: 1
          });

          return { sucesso: true, usuario };
        }
      } catch (neonErr) {
        console.warn('Neon indisponível, a usar base de dados local Dexie...', neonErr);
      }
    

    // Fallback ou Modo Offline usando o Dexie
    const usuarioLocal = await db.usuarios.where('email').equals(emailLimpo).first();
    
    if (usuarioLocal) {
      // Se a password coincidir (ou se for para teste local livre)
      if (!usuarioLocal.password || usuarioLocal.password === password) {
        return { sucesso: true, usuario: usuarioLocal };
      }
      return { sucesso: false, erro: 'Palavra-passe incorreta (local).' };
    }

    return { sucesso: false, erro: 'Utilizador não encontrado. Verifique os dados ou cadastre-se.' };

  } catch (error) {
    console.error('Erro crítico no serviço de autenticação:', error);
    return { sucesso: false, erro: 'Erro interno ao efetuar login.' };
  }
}



export async function cadastrarUsuarioLocal(nome, email, permissao) {
  try {
    const emailLimpo = email.toLowerCase().trim();
    const usuarioExistente = await db.usuarios.where('email').equals(emailLimpo).first();

    if (usuarioExistente) {
      await db.usuarios.update(usuarioExistente.id, { nome, permissao });
      return { sucesso: true, mensagem: "Permissão atualizada com sucesso!" };
    }

    const id = await db.usuarios.add({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
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

export async function listarUsuariosLocais() {
  try {
    return await db.usuarios.toArray();
  } catch (error) {
    console.error("Erro ao listar utilizadores:", error);
    return [];
  }
}

export async function removerUsuarioLocal(id) {
  try {
    await db.usuarios.delete(id);
    return { sucesso: true };
  } catch (error) {
    console.error("Erro ao remover utilizador:", error);
    return { sucesso: false, erro: "Não foi possível remover." };
  }
}
