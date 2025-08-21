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
  Badge
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
  AccessTime
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

  // Carregar perguntas
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
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const hasUnreadAnswers = (question: Question) => {
    return question.answers.some(answer => !answer.readByUser);
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
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Central de Dúvidas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tire suas dúvidas sobre investimentos e receba respostas dos nossos especialistas
        </Typography>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Estatísticas rápidas */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {questions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Dúvidas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {questions.filter(q => q.status === 'NOVA').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aguardando Resposta
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {questions.filter(q => q.status === 'RESPONDIDA').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Respondidas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de dúvidas */}
      <Box sx={{ mb: 4 }}>
        {questions.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <ChatBubbleOutline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Nenhuma dúvida ainda
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Faça sua primeira pergunta para nossos especialistas!
              </Typography>
              <Button variant="contained" onClick={() => setOpenDialog(true)}>
                Fazer Pergunta
              </Button>
            </CardContent>
          </Card>
        ) : (
          questions.map((question) => (
            <Card key={question.id} sx={{ mb: 2 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {question.title}
                        {hasUnreadAnswers(question) && (
                          <Badge badgeContent="Nova resposta" color="primary" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <Chip 
                          label={statusLabels[question.status]} 
                          color={statusColors[question.status]}
                          size="small"
                          icon={question.status === 'NOVA' ? <Schedule /> : <CheckCircle />}
                        />
                        <Chip 
                          label={categoryLabels[question.category]} 
                          variant="outlined"
                          size="small"
                          icon={<Category />}
                        />
                      </Stack>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <AccessTime sx={{ mr: 0.5, fontSize: 16 }} />
                      <Typography variant="caption">
                        {formatDate(question.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                    {question.content}
                  </Typography>

                  {/* Respostas */}
                  {question.answers.length > 0 && (
                    <Box>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Respostas ({question.answers.length})
                      </Typography>
                      
                      {question.answers.map((answer) => (
                        <Paper key={answer.id} sx={{ 
                          p: 2, 
                          mb: 2, 
                          bgcolor: 'primary.main', 
                          color: 'primary.contrastText' 
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            mb: 2 
                          }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Person sx={{ fontSize: 16 }} />
                              <Typography variant="subtitle2">
                                Resposta de {answer.admin.firstName} {answer.admin.lastName}
                              </Typography>
                            </Stack>
                            <Typography variant="caption">
                              {formatDate(answer.createdAt)}
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {answer.content}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {/* Ações */}
                  {question.status !== 'FECHADA' && question.answers.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="contained" 
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleCloseQuestion(question.id)}
                      >
                        Marcar como Resolvida
                      </Button>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            </Card>
          ))
        )}
      </Box>

      {/* FAB para nova pergunta */}
      <Fab 
        color="primary" 
        aria-label="add"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setOpenDialog(true)}
      >
        <Add />
      </Fab>

      {/* Dialog nova pergunta */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nova Dúvida</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Título da dúvida"
              value={newQuestion.title}
              onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
              fullWidth
              placeholder="Ex: Como escolher entre FIIs de papel e tijolo?"
            />
            
            <TextField
              label="Descreva sua dúvida"
              value={newQuestion.content}
              onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
              multiline
              rows={6}
              fullWidth
              placeholder="Detalhe sua dúvida aqui. Quanto mais específica, melhor será nossa resposta!"
            />
            
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                label="Categoria"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitQuestion} 
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <Add />}
          >
            {submitting ? 'Enviando...' : 'Enviar Dúvida'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}