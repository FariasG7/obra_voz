import { db } from './db';
import { sql } from '../services/neonClient';




// --- AUTENTICAR UTILIZADOR (ONLINE COM TIMEOUT + OFFLINE FALLBACK) ---
export async function autenticarUtilizador(email, password) {
  const emailLimpo = email.toLowerCase().trim();

  // Timeout de segurança (5 segundos) para evitar que a app fique pendurada
  const consultarNeonComTimeout = async () => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout de ligação')), 5000)
    );

    const queryPromise = sql`
      SELECT id, nome, email, permissao, password 
      FROM usuarios 
      WHERE email = ${emailLimpo} AND password = ${password}
      LIMIT 1;
    `;

    return Promise.race([queryPromise, timeoutPromise]);
  };

  try {
    if (navigator.onLine) {
      try {
        const resultado = await consultarNeonComTimeout();

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
        } else {
          return { sucesso: false, erro: 'Email ou palavra-passe incorretos.' };
        }
      } catch (neonErr) {
        console.warn('Neon indisponível ou timeout, a verificar base local...', neonErr);
        
        // Fallback local se o Neon falhar
        const usuarioLocal = await db.usuarios.where('email').equals(emailLimpo).first();
        if (usuarioLocal) {
          return { sucesso: true, usuario: usuarioLocal };
        }
        return { sucesso: false, erro: 'Utilizador não encontrado ou sem ligação ao servidor.' };
      }
    } else {
      // Modo Offline puro
      const usuarioLocal = await db.usuarios.where('email').equals(emailLimpo).first();
      if (usuarioLocal) {
        return { sucesso: true, usuario: usuarioLocal };
      } else {
        return { sucesso: false, erro: 'Sem ligação à internet e utilizador não encontrado localmente.' };
      }
    }
  } catch (error) {
    console.error('Erro geral na autenticação:', error);
    return { sucesso: false, erro: 'Erro ao tentar efetuar login.' };
  }
}



// --- CADASTRAR OU ATUALIZAR UTILIZADOR NO INDEXEDDB ---

export async function cadastrarUsuarioLocal(nome, email, permissao) {
  try {
    const emailLimpo = email.toLowerCase().trim();
    
    // Verifica se o e-mail já existe
    const usuarioExistente = await db.usuarios.where('email').equals(emailLimpo).first();

    if (usuarioExistente) {
      await db.usuarios.update(usuarioExistente.id, { nome, permissao });
      return { sucesso: true, mensagem: "Permissão atualizada com sucesso!" };
    }

    // Adiciona novo utilizador com ID gerado
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
