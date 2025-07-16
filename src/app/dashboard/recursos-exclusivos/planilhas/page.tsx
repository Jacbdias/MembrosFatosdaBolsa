/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { FileSpreadsheet as FileSpreadsheetIcon } from '@phosphor-icons/react/dist/ssr/FileSpreadsheet';
import { Star as StarIcon } from '@phosphor-icons/react/dist/ssr/Star';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';

export default function Page(): React.JSX.Element {
  const [notification, setNotification] = React.useState('');

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDownload = (url: string, name: string) => {
    window.open(url, '_blank');
    showNotification(`Abrindo ${name}...`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header com botão voltar */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowLeftIcon />}
          onClick={() => window.location.href = '/dashboard/recursos-exclusivos'}
          sx={{ color: 'text.secondary' }}
        >
          Voltar
        </Button>
        <Stack spacing={1}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}
          >
            📊 Planilhas Exclusivas
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '1rem'
            }}
          >
            Templates profissionais para controle de carteira, rebalanceamento e análise de investimentos
          </Typography>
        </Stack>
      </Stack>

      {/* Seção de Planilhas */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            mb: 3,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          📋 Planilhas de Rebalanceamento
        </Typography>

        <Grid container spacing={3}>
          {/* Planilha Completa */}
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%',
                border: '2px solid #4CAF50',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <Chip
                label="RECOMENDADA"
                color="success"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }}
              />
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: '#4CAF50',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FileSpreadsheetIcon size={24} color="white" />
                    </Box>
                    <Stack>
                      <Typography variant="h6" fontWeight={600}>
                        Planilha Completa
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Versão avançada com múltiplas funcionalidades
                      </Typography>
                    </Stack>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Planilha profissional com cálculos automáticos de rebalanceamento, 
                    análise de alocação de ativos, controle de dividendos e métricas 
                    avançadas de performance da carteira.
                  </Typography>

                  <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600} color="success.main">
                      ✅ Recursos inclusos:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon size={16} color="#4CAF50" /> Cálculo automático de rebalanceamento
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon size={16} color="#4CAF50" /> Controle de dividendos recebidos
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon size={16} color="#4CAF50" /> Análise de performance por ativo
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon size={16} color="#4CAF50" /> Gráficos e relatórios automáticos
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(
                      'https://docs.google.com/spreadsheets/d/1Vk8xRq9qmtRMle_FK0wo0WP-XM4QX235kCm3UM97WX4/edit#gid=0',
                      'Planilha Completa'
                    )}
                    sx={{
                      backgroundColor: '#4CAF50',
                      '&:hover': {
                        backgroundColor: '#45a049'
                      },
                      py: 1.5,
                      fontWeight: 600
                    }}
                  >
                    Acessar Planilha Completa
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Planilha Simples */}
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: '#2196F3',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FileSpreadsheetIcon size={24} color="white" />
                    </Box>
                    <Stack>
                      <Typography variant="h6" fontWeight={600}>
                        Versão Simplificada
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ideal para iniciantes
                      </Typography>
                    </Stack>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Versão mais simples e intuitiva, perfeita para quem está começando 
                    a organizar seus investimentos. Foco no essencial para controle 
                    básico da carteira.
                  </Typography>

                  <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                      ✅ Recursos inclusos:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon size={16} color="#2196F3" /> Interface simplificada
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon size={16} color="#2196F3" /> Controle básico de ativos
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon size={16} color="#2196F3" /> Cálculos essenciais
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon size={16} color="#2196F3" /> Fácil de usar
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(
                      'https://drive.google.com/drive/folders/1--BazRoImEN-dS1es5_uX5G5Gg35o-Li?usp=share_link',
                      'Planilha Simplificada'
                    )}
                    sx={{
                      borderColor: '#2196F3',
                      color: '#2196F3',
                      '&:hover': {
                        borderColor: '#1976D2',
                        backgroundColor: 'rgba(33, 150, 243, 0.04)'
                      },
                      py: 1.5,
                      fontWeight: 600
                    }}
                  >
                    Acessar Versão Simples
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Seção MyProfit */}
      <Box sx={{ mb: 4 }}>
        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 4, position: 'relative' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <StarIcon size={32} color="#FFD700" />
                    <Typography variant="h5" fontWeight={700}>
                      Recomendação Especial: MyProfit
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ opacity: 0.95, lineHeight: 1.6 }}>
                    Potencialize seu controle de investimentos com a melhor plataforma 
                    do mercado! O MyProfit oferece recursos avançados para análise e 
                    acompanhamento da sua carteira.
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <Chip
                      label="CUPOM EXCLUSIVO"
                      sx={{
                        backgroundColor: '#FFD700',
                        color: '#1a1a1a',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}
                    />
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#FFD700' }}>
                      FATOSDABOLSA - 10% OFF
                    </Typography>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      🎯 Recursos do MyProfit:
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          • Controle automático de carteira
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          • Análise de performance detalhada
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          • Integração com corretoras
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          • Relatórios para Imposto de Renda
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Stack spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem'
                    }}
                  >
                    💼
                  </Box>
                  
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => {
                      window.open('https://myprofitweb.com/promo/fatosdabolsa', '_blank');
                      showNotification('Redirecionando para MyProfit...');
                    }}
                    sx={{
                      backgroundColor: 'white',
                      color: '#667eea',
                      fontWeight: 700,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🚀 Assinar com Desconto
                  </Button>
                  
                  <Typography variant="caption" sx={{ opacity: 0.8, textAlign: 'center' }}>
                    Oferta exclusiva para membros Fatos da Bolsa
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Instruções de Uso */}
      <Card sx={{ border: '1px solid #E0E0E0' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
            📚 Como usar as planilhas
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                  📋 Passo a passo:
                </Typography>
                <Box component="ol" sx={{ pl: 2, '& li': { mb: 1, color: 'text.secondary' } }}>
                  <li>Clique no botão da planilha desejada</li>
                  <li>Faça uma cópia para sua conta Google</li>
                  <li>Preencha seus dados de investimentos</li>
                  <li>Acompanhe as análises automáticas</li>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={600} color="warning.main">
                  ⚠️ Dicas importantes:
                </Typography>
                <Box component="ul" sx={{ pl: 2, '& li': { mb: 1, color: 'text.secondary' } }}>
                  <li>Sempre trabalhe em uma cópia da planilha</li>
                  <li>Mantenha os dados atualizados regularmente</li>
                  <li>Use a planilha simples se for iniciante</li>
                  <li>Consulte nossos materiais educativos</li>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Notificação */}
      {notification && (
        <Box
          sx={{
            position: 'fixed',
            top: 24,
            right: 24,
            backgroundColor: '#4CAF50',
            color: 'white',
            px: 3,
            py: 2,
            borderRadius: 2,
            boxShadow: 3,
            zIndex: 1000,
            animation: 'slideIn 0.3s ease'
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            {notification}
          </Typography>
        </Box>
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </Box>
  );
}