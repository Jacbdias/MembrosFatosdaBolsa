import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Gerar senha segura
export function gerarSenhaSegura(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%';
  let senha = '';
  for (let i = 0; i < 10; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// Hash da senha
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// ✅ VERIFICAR SENHA - CORRIGIDA PARA ACEITAR TEXTO PLANO E HASH
export async function verifyPassword(password: string, storedPassword: string): Promise<boolean> {
  try {
    // Se a senha armazenada não parece ser um hash bcrypt
    if (!storedPassword.startsWith('$2a$') && !storedPassword.startsWith('$2b$') && !storedPassword.startsWith('$2y$')) {
      console.log('🔍 Comparando senha em texto plano (usuário legado)');
      return password === storedPassword;
    }
    
    // Se parece ser um hash, usar bcrypt
    console.log('🔍 Comparando senha com hash bcrypt');
    return await bcrypt.compare(password, storedPassword);
  } catch (error) {
    console.error('❌ Erro na verificação de senha:', error);
    return false;
  }
}

// Gerar token para reset
export function gerarTokenReset(): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 2); // 2 horas
  return { token, expiresAt };
}