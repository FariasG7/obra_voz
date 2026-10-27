import { db } from './db';
import { sql } from '../services/neonClient';

// --- AUTENTICAR UTILIZADOR (ONLINE + OFFLINE FALLBACK) ---
export async function autenticarUtilizador(email, password) {
  const emailLimpo = email.toLowerCase().trim();

  try {
    // Se estiver online, valida diretamente na base de dados do Neon
    if (navigator.onLine) {
      const resultado = await sql`
        SELECT id, nome, email, permissao, password 
        FROM usuarios 
        WHERE email = ${emailLimpo} AND password = ${password}
        LIMIT 1;
      `;

      if (resultado && resultado.length > 0) {
        const usuario = resultado[0];
        
        // Guarda/atualiza na cache local do Dexie para futuras sessões offline
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
    } else {
      // Modo Offline: Procura na base de dados local Dexie
      const usuarioLocal = await db.usuarios.where('email').equals(emailLimpo).first();
      
      if (usuarioLocal) {
        return { sucesso: true, usuario: usuarioLocal };
      } else {
        return { sucesso: false, erro: 'Sem ligação à internet e utilizador não encontrado localmente.' };
      }
    }
  } catch (error) {
    console.error('Erro na autenticação com o Neon, a testar cache local...', error);
    
    // Fallback de segurança para o Dexie caso o Neon falhe temporariamente
    const usuarioLocal = await db.usuarios.where('email').equals(emailLimpo).first();
    if (usuarioLocal) {
      return { sucesso: true, usuario: usuarioLocal };
    }

    return { sucesso: false, erro: 'Erro de ligação ao servidor e utilizador sem cache local.' };
  }
}

// --- CADASTRAR OU ATUALIZAR UTILIZADOR NO INDEXEDDB ---
export async function cadastrarUsuarioLocal(nome, email, permissao) {
  try {
    const emailLimpo = email.toLowerCase().trim();
    
    const usuarioExistente = await db.usuarios.where('email').equals(emailLimpo).first();

    if (usuarioExistente) {
      await db.usuarios.update(usuarioExistente.id, { nome, permissao });
      return { sucesso: true, mensagem: "Permissão atualizada com sucesso!" };
    }

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
