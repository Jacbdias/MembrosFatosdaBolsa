'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Alert
} from '@mui/material';
import { useRouter } from 'next/navigation';

interface PlatformStats {
  name: string;
  slug: string;
  emoji: string;
  color: string;
  totalIntegrations: number;
  activeIntegrations: number;
  totalSales: number;
  status: 'active' | 'inactive' | 'coming-soon';
  description: string;
}

export default function IntegracoesMainPage() {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<PlatformStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlatformsStats();
  }, []);

  const loadPlatformsStats = async () => {
    try {
      // Simular dados das plataformas
      const mockPlatforms: PlatformStats[] = [
        {
          name: 'Hotmart',
          slug: 'hotmart',
          emoji: '🔥',
          color: '#FF6B35',
          totalIntegrations: 5,
          activeIntegrations: 5,
          totalSales: 380,
          status: 'active',
          description: 'Maior plataforma de produtos digitais do Brasil'
        },
        {
          name: 'Kiwify',
          slug: 'kiwify',
          emoji: '🥝',
          color: '#4ECDC4',
          totalIntegrations: 0,
          activeIntegrations: 0,
          totalSales: 0,
          status: 'active',
          description: 'Plataforma moderna para checkout e vendas'
        },
        {
          name: 'Eduzz',
          slug: 'eduzz',
          emoji: '📚',
          color: '#3D5AFE',
          totalIntegrations: 0,
          activeIntegrations: 0,
          totalSales: 0,
          status: 'active',
          description: 'Marketplace de cursos e infoprodutos'
        }
      ];
      
      setPlatforms(mockPlatforms);
    } catch (error) {
      console.error('Erro ao carregar stats das plataformas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformClick = (slug: string) => {
    router.push(`/dashboard/admin/integracoes/${slug}`);
  };

  const getTotalStats = () => {
    return {
      totalIntegrations: platforms.reduce((sum, p) => sum + p.totalIntegrations, 0),
      totalActive: platforms.reduce((sum, p) => sum + p.activeIntegrations, 0),
      totalSales: platforms.reduce((sum, p) => sum + p.totalSales, 0)
    };
  };

  const stats = getTotalStats();

  return (
    <Box sx={{ p: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={5}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1E293B', fontWeight: '700' }}>
          🔗 Central de Integrações
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          Gerencie integrações com múltiplas plataformas de venda
        </Typography>
      </Box>

      {/* Stats Gerais */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', mr: 2, fontSize: '20px' }}>
                  🔗
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total de Integrações
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: '700' }}>
                    {stats.totalIntegrations}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#F0FDF4', color: '#059669', mr: 2, fontSize: '20px' }}>
                  ✅
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Integrações Ativas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: '700' }}>
                    {stats.totalActive}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#FFFBEB', color: '#D97706', mr: 2, fontSize: '20px' }}>
                  💰
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total de Vendas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: '700' }}>
                    {stats.totalSales}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#FAF5FF', color: '#7C3AED', mr: 2, fontSize: '20px' }}>
                  🏪
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Plataformas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: '700' }}>
                    {platforms.filter(p => p.status === 'active').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Informações sobre integrações */}
      <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: '500', mb: 1 }}>
          💡 Como funcionam as integrações:
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          Cada plataforma tem suas próprias integrações independentes. Configure webhooks específicos para cada produto e a venda será processada automaticamente, criando ou atualizando usuários no sistema.
        </Typography>
      </Alert>

      {/* Plataformas */}
      <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: '600', mb: 3 }}>
        Plataformas Disponíveis
      </Typography>

      <Grid container spacing={3}>
        {platforms.map((platform) => (
          <Grid item xs={12} sm={6} md={4} key={platform.slug}>
            <Card 
              sx={{ 
                borderRadius: 3,
                cursor: platform.status === 'active' ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                '&:hover': platform.status === 'active' ? {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px 0 rgba(0, 0, 0, 0.15)'
                } : {},
                opacity: platform.status === 'coming-soon' ? 0.6 : 1
              }}
              onClick={() => platform.status === 'active' && handlePlatformClick(platform.slug)}
            >
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar 
                    sx={{ 
                      bgcolor: `${platform.color}20`, 
                      color: platform.color, 
                      mr: 2, 
                      fontSize: '24px',
                      width: 56,
                      height: 56
                    }}
                  >
                    {platform.emoji}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: '600', color: '#1E293B' }}>
                      {platform.name}
                    </Typography>
                    <Chip
                      label={
                        platform.status === 'active' ? 'Disponível' :
                        platform.status === 'inactive' ? 'Inativo' : 'Em Breve'
                      }
                      size="small"
                      color={
                        platform.status === 'active' ? 'success' :
                        platform.status === 'inactive' ? 'error' : 'default'
                      }
                      sx={{ fontWeight: '500' }}
                    />
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: '#64748B', mb: 3, lineHeight: 1.6 }}>
                  {platform.description}
                </Typography>

                <Grid container spacing={2} mb={3}>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" sx={{ fontWeight: '700', color: platform.color }}>
                        {platform.totalIntegrations}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Total
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" sx={{ fontWeight: '700', color: '#059669' }}>
                        {platform.activeIntegrations}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Ativas
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" sx={{ fontWeight: '700', color: '#D97706' }}>
                        {platform.totalSales}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Vendas
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Button
                  variant={platform.status === 'active' ? 'contained' : 'outlined'}
                  fullWidth
                  disabled={platform.status !== 'active'}
                  sx={{ 
                    bgcolor: platform.status === 'active' ? platform.color : 'transparent',
                    borderColor: platform.color,
                    color: platform.status === 'active' ? '#FFFFFF' : platform.color,
                    '&:hover': platform.status === 'active' ? {
                      bgcolor: platform.color,
                      opacity: 0.9
                    } : {},
                    textTransform: 'none',
                    fontWeight: '600'
                  }}
                  onClick={() => platform.status === 'active' && handlePlatformClick(platform.slug)}
                >
                  {platform.status === 'active' ? 'Gerenciar Integrações' :
                   platform.status === 'inactive' ? 'Indisponível' : 'Em Breve'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Rodapé informativo */}
      <Box mt={6} p={4} sx={{ backgroundColor: '#F1F5F9', borderRadius: 3 }}>
        <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: '600', mb: 2 }}>
          🚀 Próximas Funcionalidades
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              • Sincronização automática de produtos
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              • Relatórios unificados de vendas
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              • Gestão de afiliados integrada
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              • Webhooks com retry automático
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}