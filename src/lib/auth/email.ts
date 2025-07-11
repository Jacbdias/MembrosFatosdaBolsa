import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function enviarEmailCredenciais(
  email: string, 
  nome: string, 
  senha: string
): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .credentials { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .credential-item { margin: 10px 0; font-size: 16px; }
        .password { font-family: monospace; font-size: 18px; font-weight: bold; color: #3b82f6; background: white; padding: 10px; border-radius: 4px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: #1e293b;">🎉 Sua conta foi criada!</h1>
          <p style="color: #64748b;">Bem-vindo(a), ${nome}!</p>
        </div>
        
        <p>Sua conta foi criada com sucesso! Use os dados abaixo para fazer login:</p>
        
        <div class="credentials">
          <div class="credential-item">
            <strong>📧 Email:</strong> ${email}
          </div>
          <div class="credential-item">
            <strong>🔑 Senha:</strong>
            <div class="password">${senha}</div>
          </div>
        </div>
        
        <div class="warning">
          <strong>⚠️ Importante:</strong> Por segurança, você será solicitado a alterar sua senha no primeiro acesso.
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/sign-in" class="button">
            🌐 Fazer Login
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          Se você não solicitou esta conta, ignore este email.
        </p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Membros Fatos da Bolsa" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: '🎉 Sua conta foi criada - Acesso liberado!',
    html: htmlContent
  });
}

export async function enviarEmailResetSenha(
  email: string, 
  nome: string, 
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 style="color: #1e293b;">🔑 Redefinir Senha</h1>
        <p>Olá, ${nome}!</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Redefinir Senha</a>
        </div>
        
        <div class="warning">
          <strong>⚠️ Atenção:</strong> Este link é válido por apenas 2 horas.
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          Se você não solicitou esta alteração, ignore este email. Sua senha atual permanecerá inalterada.
        </p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Membros Fatos da Bolsa" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: '🔑 Redefinir sua senha',
    html: htmlContent
  });
}