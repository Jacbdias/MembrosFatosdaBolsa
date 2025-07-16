import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({ // ✅ CORRIGIDO: createTransport (sem "er")
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
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://membros.fatosdobolsa.com';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo ao Fatos da Bolsa</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          margin: 0; 
          padding: 40px 20px;
          line-height: 1.6;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 20px; 
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header { 
          background: #010101;
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .welcome-text {
          color: #2d3748;
          font-size: 16px;
          margin-bottom: 30px;
          text-align: center;
        }
        .welcome-text h2 {
          color: #4a5568;
          font-size: 22px;
          margin: 0 0 15px 0;
          font-weight: 600;
        }
        .credentials { 
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          padding: 30px; 
          border-radius: 15px; 
          margin: 30px 0;
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }
        .credentials::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #2d2d2d, #4bf700);
        }
        .credentials h3 {
          color: #2d3748;
          font-size: 20px;
          margin: 0 0 20px 0;
          font-weight: 700;
          text-align: center;
        }
        .credential-item { 
          margin: 20px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .credential-label {
          color: #4a5568;
          font-weight: 600;
          font-size: 16px;
          min-width: 120px;
        }
        .credential-value {
          background: white;
          padding: 12px 16px;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
          font-family: 'Courier New', monospace;
          font-size: 16px;
          color: #2d3748;
          font-weight: 600;
          flex: 1;
          word-break: break-all;
        }
        .login-button { 
          display: block;
          background: #010101;
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 12px; 
          margin: 30px auto;
          text-align: center;
          font-weight: 700;
          font-size: 18px;
          border: 2px solid #4bf700;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          max-width: 250px;
        }
        .login-button:hover {
          transform: translateY(-2px);
          background: #4bf700;
          color: #010101;
          box-shadow: 0 12px 35px rgba(75, 247, 0, 0.4);
        }
        .info-box { 
          background: linear-gradient(135deg, #fef5e7 0%, #fef3cd 100%);
          border-left: 5px solid #f6ad55;
          padding: 25px; 
          margin: 30px 0;
          border-radius: 8px;
        }
        .info-box h4 {
          color: #c05621;
          margin: 0 0 15px 0;
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .info-list {
          color: #c05621;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
          padding-left: 20px;
        }
        .info-list li {
          margin-bottom: 8px;
        }
        .resources-section {
          background: linear-gradient(135deg, #f9f9f9 0%, #f5f5f5 100%);
          padding: 25px;
          border-radius: 12px;
          margin: 30px 0;
          border-left: 5px solid #4bf700;
        }
        .resources-section h4 {
          color: #010101;
          margin: 0 0 15px 0;
          font-size: 18px;
          font-weight: 700;
        }
        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .resource-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e0e0e0;
        }
        .resource-item strong {
          color: #010101;
          display: block;
          margin-bottom: 5px;
        }
        .resource-item span {
          color: #4a5568;
          font-size: 14px;
        }
        .footer { 
          background: #2d3748;
          color: white;
          padding: 30px;
          text-align: center;
        }
        .footer h4 {
          color: white;
          margin: 0 0 15px 0;
          font-size: 18px;
          font-weight: 600;
        }
        .footer p {
          margin: 8px 0;
          opacity: 0.8;
          font-size: 14px;
        }
        .logo {
          width: 120px;
          height: 120px;
          margin: 0 auto 20px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 50%;
          background: transparent;
        }
        .logo img {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 50%;
          background: transparent;
        }
        @media (max-width: 600px) {
          .container { margin: 0 10px; }
          .content, .header, .footer { padding: 20px; }
          .credential-item { flex-direction: column; align-items: flex-start; }
          .credential-label { min-width: auto; }
          .resources-grid { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">
            <img src="${loginUrl}/assets/avatar-36.png" alt="Fatos da Bolsa Logo" />
          </div>
          <h1>🎉 Bem-vindo ao Fatos da Bolsa!</h1>
          <p>Sua jornada de sucesso nos investimentos começa agora</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <div class="welcome-text">
            <h2>Olá, ${nome}! Tudo bem?</h2>
            <p><strong>Parabéns e seja bem-vindo(a) ao Fatos da Bolsa!</strong></p>
            <p>Estamos muito felizes em ter você conosco.</p>
            <p>Na plataforma você terá acesso a <strong>todos os conteúdos disponíveis</strong> para a sua assinatura.</p>
          </div>
          
          <!-- Credenciais de Acesso -->
          <div class="credentials">
            <h3>🔑 Seus Dados de Acesso</h3>
            
            <div class="credential-item">
              <div class="credential-label">🌐 Área de Membros:</div>
              <div class="credential-value">${loginUrl}/auth/sign-in</div>
            </div>
            
            <div class="credential-item">
              <div class="credential-label">📧 Login:</div>
              <div class="credential-value">${email}</div>
            </div>
            
            <div class="credential-item">
              <div class="credential-label">🔒 Senha:</div>
              <div class="credential-value">${senha}</div>
            </div>
          </div>
          
          <!-- Botão de Acesso -->
          <a href="${loginUrl}/auth/sign-in" class="login-button">
            🚀 Acessar Minha Conta
          </a>
          
          <!-- Recursos Disponíveis -->
          <div class="resources-section">
            <h4>💎 O que você encontrará na plataforma:</h4>
            <div class="resources-grid">
              <div class="resource-item">
                <strong>📊 Análises</strong>
                <span>Relatórios detalhados</span>
              </div>
              <div class="resource-item">
                <strong>📱 Close Friends</strong>
                <span>Conteúdo exclusivo Instagram</span>
              </div>
              <div class="resource-item">
                <strong>📲 Telegram</strong>
                <span>Canais e grupos VIP</span>
              </div>
              <div class="resource-item">
                <strong>📈 Carteiras</strong>
                <span>Recomendações de investimento</span>
              </div>
              <div class="resource-item">
                <strong>🎯 Rentabilidades</strong>
                <span>Acompanhe performance</span>
              </div>
              <div class="resource-item">
                <strong>📚 eBooks</strong>
                <span>Material educativo</span>
              </div>
            </div>
          </div>
          
          <!-- Informações Importantes -->
          <div class="info-box">
            <h4>⚠️ Importante - Primeiros Passos:</h4>
            <ul class="info-list">
              <li><strong>Faça login</strong> usando seu email e a senha temporária acima</li>
              <li><strong>Altere sua senha</strong> no primeiro acesso por segurança</li>
              <li><strong>Complete seu perfil</strong> na área de configurações</li>
              <li><strong>Cadastre seu Instagram</strong> para receber conteúdos do Close Friends</li>
              <li><strong>Acesse nosso bot</strong> no Telegram para entrar nos grupos exclusivos</li>
              <li><strong>Explore todas as seções</strong> disponíveis para sua assinatura</li>
            </ul>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <h4>🤝 Conte conosco para o que precisar!</h4>
          <p><strong>Atenciosamente,</strong></p>
          <p><strong>Equipe Fatos da Bolsa</strong></p>
          <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
            © 2025 Fatos da Bolsa - Todos os direitos reservados<br>
            Este email foi enviado automaticamente, não responda a esta mensagem.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Equipe Fatos da Bolsa" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: '🎉 Bem-vindo ao Fatos da Bolsa - Seu acesso foi liberado!',
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
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .header { background: #010101; padding: 40px 30px; text-align: center; color: white; }
        .content { padding: 40px 30px; text-align: center; }
        .button { display: inline-block; background: #010101; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; margin: 20px 0; font-weight: 700; border: 2px solid #4bf700; }
        .footer { background: #2d3748; color: white; padding: 30px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Redefinir Senha</h1>
        </div>
        <div class="content">
          <h2>Olá, ${nome}!</h2>
          <p>Recebemos uma solicitação para redefinir sua senha no Fatos da Bolsa.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          
          <a href="${resetUrl}" class="button">Redefinir Minha Senha</a>
          
          <p style="color: #718096; font-size: 14px; margin-top: 30px;">
            <strong>⚠️ Atenção:</strong> Este link é válido por apenas 2 horas.<br>
            Se você não solicitou esta alteração, ignore este email.
          </p>
        </div>
        <div class="footer">
          <p><strong>Equipe Fatos da Bolsa</strong></p>
          <p style="font-size: 12px; opacity: 0.7;">© 2025 Fatos da Bolsa</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Equipe Fatos da Bolsa" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: '🔑 Redefinir sua senha - Fatos da Bolsa',
    html: htmlContent
  });
}