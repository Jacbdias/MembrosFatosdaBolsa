'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  CircularProgress,
  Alert,
  Fab,
  Grid,
  Paper,
  Stack,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Add, 
  ExpandMore, 
  ChatBubbleOutline, 
  Schedule, 
  CheckCircle, 
  Close,
  Category,
  Person,
  AccessTime,
  QuestionAnswer,
  Visibility,
  VisibilityOff,
  TrendingUp,
  Assignment
} from '@mui/icons-material';

// Tipos
interface Question {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'NOVA' | 'RESPONDIDA' | 'FECHADA';
  createdAt: string;
  answers: Answer[];
  readByAdmin: boolean;
}

interface Answer {
  id: string;
  content: string;
  createdAt: string;
  admin: {
    firstName: string;
    lastName: string;
  };
  readByUser: boolean;
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

const statusLabels = {
  'NOVA': 'Aguardando Resposta',
  'RESPONDIDA': 'Respondida',
  'FECHADA': 'Fechada'
};

const statusColors = {
  'NOVA': 'warning',
  'RESPONDIDA': 'success',
  'FECHADA': 'default'
} as const;

const categoryColors = {
  'SMALL_CAPS': '#f8fafc',
  'MICRO_CAPS': '#f8fafc',
  'DIVIDENDOS': '#f8fafc',
  'FIIS': '#f8fafc',
  'INTERNACIONAL_ETFS': '#f8fafc',
  'INTERNACIONAL_STOCKS': '#f8fafc',
  'INTERNACIONAL_DIVIDENDOS': '#f8fafc',
  'PROJETO_AMERICA': '#f8fafc',
  'GERAL': '#f8fafc',
  'TECNICO': '#f8fafc',
  'FISCAL': '#f8fafc'
};

export default function CentralDuvidas() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    category: 'GERAL'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Carregar perguntas reais da API
  const loadQuestions = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const userEmail = localStorage.getItem('user-email');
      
      const response = await fetch('/api/questions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Email': userEmail,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      } else {
        setError('Erro ao carregar suas dúvidas');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // Criar nova pergunta
  const handleSubmitQuestion = async () => {
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      setError('Título e conteúdo são obrigatórios');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('custom-auth-token');
      const userEmail = localStorage.getItem('user-email');
      
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Email': userEmail,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newQuestion)
      });

      if (response.ok) {
        setSuccess('Dúvida enviada com sucesso! Você receberá uma resposta em breve.');
        setOpenDialog(false);
        setNewQuestion({ title: '', content: '', category: 'GERAL' });
        loadQuestions();
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao enviar dúvida');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setSubmitting(false);
    }
  };

  // Fechar dúvida
  const handleCloseQuestion = async (questionId: string) => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const userEmail = localStorage.getItem('user-email');
      
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Email': userEmail,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'FECHADA' })
      });

      if (response.ok) {
        setSuccess('Dúvida marcada como resolvida!');
        loadQuestions();
      }
    } catch (err) {
      setError('Erro ao fechar dúvida');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateRelative = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return 'Ontem';
    return formatDate(dateString);
  };

  const hasUnreadAnswers = (question: Question) => {
    return question.answers.some(answer => !answer.readByUser);
  };

  const getQuestionIcon = (status: string) => {
    switch (status) {
      case 'NOVA':
        return <Schedule color="warning" />;
      case 'RESPONDIDA':
        return <QuestionAnswer color="success" />;
      case 'FECHADA':
        return <CheckCircle color="disabled" />;
      default:
        return <ChatBubbleOutline />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Carregando suas dúvidas...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
          Central de Dúvidas
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Tire suas dúvidas sobre investimentos e receba respostas dos nossos especialistas
        </Typography>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Estatísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Assignment sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {questions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total de Dúvidas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Schedule sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {questions.filter(q => q.status === 'NOVA').length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Aguardando Resposta
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {questions.filter(q => q.status === 'RESPONDIDA').length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Respondidas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de dúvidas */}
      <Box sx={{ mb: 4 }}>
        {questions.length === 0 ? (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <ChatBubbleOutline sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                Nenhuma dúvida ainda
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                Faça sua primeira pergunta para nossos especialistas em investimentos!
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => setOpenDialog(true)}
                sx={{ borderRadius: 2, px: 4, py: 1.5 }}
              >
                Fazer Primeira Pergunta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {questions.map((question) => (
              <Card 
                key={question.id} 
                sx={{ 
                  borderRadius: 2, 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: hasUnreadAnswers(question) ? '2px solid #f3f4f6' : '1px solid #e0e0e0',
                  transition: 'all 0.2s ease'
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  {/* Header da pergunta */}
                  <Box sx={{ 
                    p: 3, 
                    pb: 2,
                    background: hasUnreadAnswers(question) 
                      ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                      : '#ffffff',
                    borderRadius: '12px 12px 0 0'
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                          {getQuestionIcon(question.status)}
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {question.title}
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                          {hasUnreadAnswers(question) && (
                            <Chip 
                              label="NOVA RESPOSTA"
                              size="small"
                              sx={{
                                bgcolor: '#9ca3af',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                order: -1
                              }}
                            />
                          )}
                          <Chip 
                            label={statusLabels[question.status]} 
                            variant="outlined"
                            size="small"
                            sx={{ 
                              fontWeight: 500,
                              borderColor: '#e0e0e0',
                              color: '#666'
                            }}
                          />
                          <Chip 
                            label={categoryLabels[question.category]} 
                            variant="outlined"
                            size="small"
                            sx={{ 
                              fontWeight: 500, 
                              borderColor: '#e0e0e0',
                              color: '#666'
                            }}
                          />
                          {question.answers.length > 0 && (
                            <Chip 
                              label={`${question.answers.length} resposta${question.answers.length > 1 ? 's' : ''}`} 
                              size="small"
                              variant="outlined"
                              icon={<QuestionAnswer sx={{ color: '#666 !important' }} />}
                              sx={{ 
                                fontWeight: 500,
                                borderColor: '#e0e0e0',
                                color: '#666'
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                      
                      <Stack alignItems="flex-end" spacing={1}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {formatDateRelative(question.createdAt)}
                        </Typography>
                        <Tooltip title="Expandir detalhes">
                          <IconButton 
                            onClick={() => setExpandedQuestion(
                              expandedQuestion === question.id ? null : question.id
                            )}
                            size="small"
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.8)',
                              '&:hover': { bgcolor: 'white' }
                            }}
                          >
                            <ExpandMore sx={{ 
                              transform: expandedQuestion === question.id ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s'
                            }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>

                  {/* Conteúdo expandido */}
                  {expandedQuestion === question.id && (
                    <Box sx={{ p: 3, pt: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
                        Detalhes da Dúvida:
                      </Typography>
                      <Paper sx={{ 
                        p: 2, 
                        mb: 3, 
                        bgcolor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        borderRadius: 2
                      }}>
                        <Typography variant="body1" sx={{ 
                          whiteSpace: 'pre-wrap', 
                          lineHeight: 1.6,
                          color: '#374151'
                        }}>
                          {question.content}
                        </Typography>
                      </Paper>

                      {/* Respostas */}
                      {question.answers.length > 0 && (
                        <Box>
                          <Typography variant="h6" sx={{ 
                            mb: 2, 
                            color: '#374151', 
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <QuestionAnswer color="second" />
                            Resposta{question.answers.length > 1 ? 's' : ''} do Especialista
                            <Chip 
                              label={question.answers.length} 
                              size="small" 
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                          
                          <Stack spacing={2}>
                            {question.answers.map((answer) => (
                              <Paper key={answer.id} sx={{ 
                                p: 3, 
                                bgcolor: !answer.readByUser ? '#f8fafc' : '#ffffff',
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                position: 'relative'
                              }}>
                                {!answer.readByUser && (
                                  <Box sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: 16,
                                    bgcolor: '#9ca3af',
                                    color: 'white',
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                  }}>
                                    NOVA RESPOSTA
                                  </Box>
                                )}
                                
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center', 
                                  mb: 2 
                                }}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Person sx={{ fontSize: 20, color: '#3b82f6' }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                      {answer.admin.firstName} {answer.admin.lastName}
                                    </Typography>
                                    <Chip label="Especialista" size="small" color="primary" variant="outlined" />
                                  </Stack>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {formatDateRelative(answer.createdAt)}
                                  </Typography>
                                </Box>
                                
                                <Typography variant="body1" sx={{ 
                                  whiteSpace: 'pre-wrap',
                                  lineHeight: 1.7,
                                  color: '#374151'
                                }}>
                                  {answer.content}
                                </Typography>
                              </Paper>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {/* Ações */}
                      <Stack direction="row" spacing={2} sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                        {question.status !== 'FECHADA' && question.answers.length > 0 && (
                          <Button 
                            variant="contained" 
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleCloseQuestion(question.id)}
                            sx={{ borderRadius: 2 }}
                          >
                            Marcar como Resolvida
                          </Button>
                        )}
                        
                        {question.status === 'NOVA' && (
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 0.5,
                            px: 2,
                            py: 1,
                            bgcolor: '#fef3c7',
                            borderRadius: 1,
                            fontWeight: 500
                          }}>
                            <TrendingUp sx={{ fontSize: 16 }} />
                            Aguardando análise dos especialistas...
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* FAB para nova pergunta */}
      <Tooltip title="Fazer nova pergunta">
        <Fab 
          color="primary" 
          aria-label="add"
          sx={{ 
            position: 'fixed', 
            bottom: 32, 
            right: 32,
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)'
            },
            transition: 'all 0.2s ease'
          }}
          onClick={() => setOpenDialog(true)}
        >
          <Add />
        </Fab>
      </Tooltip>

      {/* Dialog nova pergunta */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '1.5rem', 
          fontWeight: 700,
          color: '#1e293b',
          borderBottom: '1px solid #e2e8f0'
        }}>
          Nova Dúvida
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Título da dúvida"
              value={newQuestion.title}
              onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
              fullWidth
              placeholder="Ex: Como escolher entre FIIs de papel e tijolo?"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <TextField
              label="Descreva sua dúvida"
              value={newQuestion.content}
              onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
              multiline
              rows={6}
              fullWidth
              placeholder="Detalhe sua dúvida aqui. Quanto mais específica, melhor será nossa resposta! Inclua contexto sobre seu perfil de investidor se relevante."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                label="Categoria"
                sx={{ borderRadius: 2 }}
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: categoryColors[key] || '#f5f5f5',
                        border: '2px solid #e2e8f0'
                      }} />
                      {label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitQuestion} 
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Add />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {submitting ? 'Enviando...' : 'Enviar Dúvida'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}