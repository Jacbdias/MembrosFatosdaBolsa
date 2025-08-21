'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Container,
  Paper,
  InputAdornment,
  Alert,
  Fade,
  Skeleton
} from '@mui/material';
import {
  ExpandMore,
  Search,
  HelpOutline,
  Category,
  QuestionAnswer,
  TrendingUp
} from '@mui/icons-material';

// Tipos
interface FAQ {
  id: string;
  content: string;
  faqTitle: string | null;
  faqOrder: number;
  createdAt: string;
  question: {
    id: string;
    title: string;
    content: string;
    category: string;
    createdAt: string;
  };
  admin: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface FAQData {
  faqs: FAQ[];
  groupedFaqs: Record<string, FAQ[]>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const categoryLabels = {
  'SMALL_CAPS': 'Small Caps',
  'MICRO_CAPS': 'Micro Caps',
  'DIVIDENDOS': 'Dividendos',
  'FIIS': 'Fundos Imobiliários',
  'INTERNACIONAL_ETFS': 'ETFs Internacionais',
  'INTERNACIONAL_STOCKS': 'Stocks Internacionais',
  'INTERNACIONAL_DIVIDENDOS': 'Dividendos Internacionais',
  'PROJETO_AMERICA': 'Projeto América',
  'GERAL': 'Geral',
  'TECNICO': 'Análise Técnica',
  'FISCAL': 'Questões Fiscais'
};

export default function PublicFAQ() {
  const [faqData, setFaqData] = useState<FAQData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  // Carregar FAQs
  const loadFAQs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('custom-auth-token');
      const userEmail = localStorage.getItem('user-email');
      
      if (!token || !userEmail) {
        setError('Acesso não autorizado');
        return;
      }

      const params = new URLSearchParams();
      
      if (selectedCategory !== 'ALL') {
        params.append('category', selectedCategory);
      }
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/faq?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Email': userEmail,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFaqData(data);
        setError('');
      } else {
        setError('Erro ao carregar FAQs');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFAQs();
  }, [selectedCategory, searchTerm]);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCategoryColor = (category: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const colors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      'DIVIDENDOS': 'success',
      'FIIS': 'info',
      'SMALL_CAPS': 'primary',
      'MICRO_CAPS': 'secondary',
      'INTERNACIONAL_ETFS': 'warning',
      'INTERNACIONAL_STOCKS': 'error',
      'PROJETO_AMERICA': 'success',
      'GERAL': 'default',
      'TECNICO': 'info',
      'FISCAL': 'warning'
    };
    return colors[category] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Base de Conhecimento - FAQ
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Acesso exclusivo às respostas mais importantes sobre investimentos
        </Typography>

        {/* Estatísticas */}
        {faqData && (
          <Fade in={true}>
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
              <Grid item>
                <Chip 
                  icon={<QuestionAnswer />}
                  label={`${faqData.pagination.total} FAQs`}
                  color="primary"
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip 
                  icon={<Category />}
                  label={`${Object.keys(faqData.groupedFaqs).length} Categorias`}
                  color="secondary"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Fade>
        )}
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Buscar nas FAQs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite sua dúvida ou palavras-chave..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Categoria"
                >
                  <MenuItem value="ALL">Todas as Categorias</MenuItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={100} />
          ))}
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* FAQ Content */}
      {!loading && faqData && (
        <Fade in={true}>
          <Box>
            {Object.keys(faqData.groupedFaqs).length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <HelpOutline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Nenhuma FAQ encontrada
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || selectedCategory !== 'ALL' 
                      ? 'Tente ajustar sua busca ou filtros'
                      : 'Ainda não temos FAQs cadastradas. Volte em breve!'
                    }
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              Object.entries(faqData.groupedFaqs).map(([category, faqs]) => (
                <Box key={category} sx={{ mb: 4 }}>
                  {/* Category Header */}
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h5" component="h2">
                        {categoryLabels[category] || category}
                      </Typography>
                      <Chip 
                        label={`${faqs.length} FAQs`}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: 'inherit' 
                        }}
                      />
                    </Box>
                  </Paper>

                  {/* FAQs in Category */}
                  {faqs.map((faq, index) => (
                    <Accordion
                      key={faq.id}
                      expanded={expandedAccordion === `${category}-${faq.id}`}
                      onChange={handleAccordionChange(`${category}-${faq.id}`)}
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="h6" color="primary" gutterBottom>
                            {faq.faqTitle || faq.question.title}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip 
                              label={categoryLabels[faq.question.category]}
                              size="small"
                              color={getCategoryColor(faq.question.category)}
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              Respondido em {formatDate(faq.createdAt)}
                            </Typography>
                          </Box>

                          {searchTerm && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {faq.question.title}
                            </Typography>
                          )}
                        </Box>
                      </AccordionSummary>
                      
                      <AccordionDetails>
                        <Divider sx={{ mb: 3 }} />
                        
                        {/* Question Details */}
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Pergunta:
                          </Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                            {faq.question.content}
                          </Typography>
                        </Box>

                        {/* Answer */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Resposta:
                          </Typography>
                          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                              {faq.content}
                            </Typography>
                          </Paper>
                        </Box>

                        {/* Author */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Typography variant="caption" color="text.secondary">
                            Respondido por {faq.admin.firstName} {faq.admin.lastName}
                          </Typography>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ))
            )}
          </Box>
        </Fade>
      )}

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 6, py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Não encontrou sua dúvida? Envie uma nova pergunta na Central de Dúvidas.
        </Typography>
      </Box>
    </Box>
  );
}