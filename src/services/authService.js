// src/services/authService.js
import { db } from '../db/db';
import { sql } from '../services/neonClient';

// --- AUTENTICAR UTILIZADOR (ONLINE COM TIMEOUT + OFFLINE FALLBACK) ---
export async function autenticarUtilizador(email, password) {
  const emailLimpo = email.toLowerCase().trim();

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
        
        const usuarioLocal = await db.usuarios.where('email').equals(emailLimpo).first();
        if (usuarioLocal) {
          return { sucesso: true, usuario: usuarioLocal };
        }
        return { sucesso: false, erro: 'Utilizador não encontrado ou sem ligação ao servidor.' };
      }
    } else {
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
