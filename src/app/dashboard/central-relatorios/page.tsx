'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  LinearProgress,
  Grid,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Checkbox,
  Toolbar,
  Menu,
  Tooltip
} from '@mui/material';

// Ícones simples seguindo o padrão
const ArrowLeftIcon = () => <span style={{ fontSize: '16px' }}>←</span>;
const UploadIcon = () => <span style={{ fontSize: '16px' }}>📤</span>;
const DownloadIcon = () => <span style={{ fontSize: '16px' }}>📥</span>;
const DeleteIcon = () => <span style={{ fontSize: '16px' }}>🗑</span>;
const EditIcon = () => <span style={{ fontSize: '16px' }}>✏️</span>;
const SaveIcon = () => <span style={{ fontSize: '16px' }}>💾</span>;
const AddIcon = () => <span style={{ fontSize: '16px' }}>➕</span>;
const FileIcon = () => <span style={{ fontSize: '16px' }}>📄</span>;
const CloudUploadIcon = () => <span style={{ fontSize: '16px' }}>☁️</span>;
const BackupIcon = () => <span style={{ fontSize: '16px' }}>💿</span>;
const RestoreIcon = () => <span style={{ fontSize: '16px' }}>🔄</span>;
const CheckIcon = () => <span style={{ fontSize: '16px' }}>✅</span>;
const DatabaseIcon = () => <span style={{ fontSize: '16px' }}>🗃️</span>;
const MoreVertIcon = () => <span style={{ fontSize: '16px' }}>⋮</span>;
const RefreshIcon = () => <span style={{ fontSize: '16px' }}>🔄</span>;

// 🆕 IMPORTAR NOVOS HOOKS DA API (em vez do IndexedDB)
import { 
  useRelatoriosEstatisticas, 
  useRelatoriosUpload, 
  useRelatoriosExport,
  type RelatorioAPI 
} from '../../../hooks/useRelatoriosAPI';

// 🔐 CONFIGURAÇÃO DE AUTENTICAÇÃO AUTOMÁTICA
interface AuthConfig {
  defaultEmail: string;
  fallbackEmails: string[];
  enableAutoAuth: boolean;
}

const AUTH_CONFIG: AuthConfig = {
  // 📧 Email padrão (substitua pelo seu email de admin)
  defaultEmail: 'admin@fatosdobolsa.com',
  
  // 📧 Emails de fallback para testar
  fallbackEmails: [
    'admin@fatosdobolsa.com',
    'admin@admin.com',
    // ADICIONE SEU EMAIL AQUI:
    // 'seu-email@empresa.com',
  ],
  
  // ⚙️ Ativar autenticação automática
  enableAutoAuth: true
};

// 🔍 FUNÇÃO PARA DETECTAR USUÁRIO VÁLIDO
async function detectarUsuarioValido(): Promise<string | null> {
  // Verificar se já tem usuário salvo no localStorage
  const savedUser = localStorage.getItem('auth_user_email');
  if (savedUser) {
    console.log(`🔑 [AUTH] Usuário salvo encontrado: ${savedUser}`);
    return savedUser;
  }
  
  // Testar emails em ordem de prioridade
  const emailsParaTestar = [AUTH_CONFIG.defaultEmail, ...AUTH_CONFIG.fallbackEmails];
  
  for (const email of emailsParaTestar) {
    try {
      console.log(`🔍 [AUTH] Testando email: ${email}`);
      
      const response = await fetch('/api/user/profile', {
        headers: { 'x-user-email': email }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log(`✅ [AUTH] Email válido encontrado: ${email} (${userData.plan})`);
        
        // Salvar para próximas sessões
        localStorage.setItem('auth_user_email', email);
        localStorage.setItem('auth_user_plan', userData.plan);
        
        return email;
      }
    } catch (error) {
      console.log(`❌ [AUTH] Erro testando ${email}:`, error);
    }
  }
  
  console.error('❌ [AUTH] Nenhum email válido encontrado!');
  return null;
}

// 🔐 INTERCEPTOR AUTOMÁTICO DE FETCH
async function setupAuthInterceptor() {
  if (!AUTH_CONFIG.enableAutoAuth || typeof window === 'undefined') {
    return;
  }
  
  console.log('🚀 [AUTH] Configurando interceptor automático...');
  
  // Detectar usuário válido
  const userEmail = await detectarUsuarioValido();
  
  if (!userEmail) {
    console.error('🚨 [AUTH] Falha na autenticação automática!');
    // Mostrar alerta para o usuário
    alert('❌ Erro de autenticação. Verifique se você tem permissão para acessar relatórios.');
    return;
  }
  
  // Configurar interceptor global
  const originalFetch = window.fetch;
  window.fetch = function(url: string, options: RequestInit = {}) {
    
    // Adicionar header de autenticação para todas as APIs
    if (url.includes('/api/')) {
      options.headers = {
        ...options.headers,
        'x-user-email': userEmail
      };
      
      // Log apenas para APIs de relatórios (evitar spam)
      if (url.includes('relatorio')) {
        console.log(`🔑 [AUTH] Request autenticado: ${url.split('/').pop()} (${userEmail})`);
      }
    }
    
    return originalFetch(url, options);
  };
  
  console.log(`✅ [AUTH] Interceptor configurado para: ${userEmail}`);
  
  // Mostrar informações do usuário no console
  const userPlan = localStorage.getItem('auth_user_plan');
  const permissoes = ['ADMIN', 'VIP'].includes(userPlan || '') ? 'Ver todos os relatórios' : 'Ver apenas próprios relatórios';
  
  console.log(`👤 [AUTH] Usuário: ${userEmail}`);
  console.log(`🏷️ [AUTH] Plano: ${userPlan}`);
  console.log(`🔐 [AUTH] Permissões: ${permissoes}`);
}

// 🔧 FUNÇÃO PARA LIMPAR AUTENTICAÇÃO (se necessário)
function limparAutenticacao() {
  localStorage.removeItem('auth_user_email');
  localStorage.removeItem('auth_user_plan');
  console.log('🧹 [AUTH] Cache de autenticação limpo');
}

// 🔧 FUNÇÃO PARA TROCAR USUÁRIO MANUALMENTE
async function trocarUsuario(novoEmail: string) {
  try {
    console.log(`🔄 [AUTH] Testando novo usuário: ${novoEmail}`);
    
    const response = await fetch('/api/user/profile', {
      headers: { 'x-user-email': novoEmail }
    });
    
    if (response.ok) {
      const userData = await response.json();
      localStorage.setItem('auth_user_email', novoEmail);
      localStorage.setItem('auth_user_plan', userData.plan);
      
      console.log(`✅ [AUTH] Usuário alterado para: ${novoEmail} (${userData.plan})`);
      alert(`✅ Usuário alterado para: ${novoEmail}\nPlano: ${userData.plan}\nRecarregue a página para aplicar.`);
      
      return true;
    } else {
      console.error(`❌ [AUTH] Email inválido: ${novoEmail}`);
      alert(`❌ Email inválido: ${novoEmail}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ [AUTH] Erro ao trocar usuário:`, error);
    alert('❌ Erro ao verificar usuário');
    return false;
  }
}

// 🎮 FUNÇÕES DISPONÍVEIS NO CONSOLE GLOBAL
if (typeof window !== 'undefined') {
  (window as any).authDebug = {
    limpar: limparAutenticacao,
    trocar: trocarUsuario,
    info: () => {
      const email = localStorage.getItem('auth_user_email');
      const plan = localStorage.getItem('auth_user_plan');
      console.log('👤 Usuário atual:', email);
      console.log('🏷️ Plano atual:', plan);
      console.log('💡 Para trocar usuário: authDebug.trocar("novo@email.com")');
      console.log('🧹 Para limpar auth: authDebug.limpar()');
    }
  };
}

interface NovoRelatorio {
  ticker: string;
  nome: string;
  tipo: 'trimestral' | 'anual' | 'apresentacao' | 'outros';
  dataReferencia: string;
  linkCanva: string;
  linkExterno: string;
  tipoVisualizacao: 'iframe' | 'canva' | 'link' | 'pdf';
  arquivoPdf: File | null;
}

const LIMITE_BASE64 = 3 * 1024 * 1024; // 3MB
const TICKERS_DISPONIVEIS = [
  'KEPL3', 'AGRO3', 'LEVE3', 'BBAS3', 'BRSR6', 'ABCB4', 'SANB11',
  'TASA4', 'ROMI3', 'EZTC3', 'EVEN3', 'TRIS3', 'FESA4', 'CEAB3'
];

const calcularHash = async (arquivo: File): Promise<string> => {
  const arrayBuffer = await arquivo.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const converterParaBase64 = (arquivo: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(arquivo);
  });
};

const processarPdfHibrido = async (arquivo: File): Promise<any> => {
  if (arquivo.size <= LIMITE_BASE64) {
    const base64 = await converterParaBase64(arquivo);
    return {
      arquivoPdf: base64,
      nomeArquivoPdf: arquivo.name,
      tamanhoArquivo: arquivo.size,
      tipoPdf: 'base64'
    };
  } else {
    const hash = await calcularHash(arquivo);
    return {
      nomeArquivoPdf: arquivo.name,
      tamanhoArquivo: arquivo.size,
      hashArquivo: hash,
      tipoPdf: 'referencia',
      solicitarReupload: true
    };
  }
};

export default function CentralRelatorios() {
  const router = useRouter();
  
  // 🔄 USAR NOVOS HOOKS DA API (similar à agenda)
  const { 
    estatisticas, 
    loading: statsLoading, 
    error: statsError,
    carregarEstatisticas 
  } = useRelatoriosEstatisticas();
  
  const { 
    uploadRelatorio,
    uploadRelatoriosLote,
    excluirRelatorio,
    excluirRelatorios,
    excluirPorTicker,
    limparTodos, 
    loading: uploadLoading, 
    progresso,
    error: uploadError
  } = useRelatoriosUpload();
  
  const { 
    exportarDados,
    importarDados, 
    loading: exportLoading,
    error: exportError
  } = useRelatoriosExport();

  const [tabAtiva, setTabAtiva] = useState(0);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogBackup, setDialogBackup] = useState(false);
  const [dialogMigracao, setDialogMigracao] = useState(false);
  const [etapaProcessamento, setEtapaProcessamento] = useState<string>('');
  
  // 🗑️ Estados para exclusão (similar à agenda)
  const [relatorioParaExcluir, setRelatorioParaExcluir] = useState<string | null>(null);
  const [tickerParaExcluir, setTickerParaExcluir] = useState<string | null>(null);
  const [relatoriosSelecionados, setRelatoriosSelecionados] = useState<string[]>([]);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuRelatorioId, setMenuRelatorioId] = useState<string | null>(null);
  
  const [novoRelatorio, setNovoRelatorio] = useState<NovoRelatorio>({
    ticker: '',
    nome: '',
    tipo: 'trimestral',
    dataReferencia: '',
    linkCanva: '',
    linkExterno: '',
    tipoVisualizacao: 'iframe',
    arquivoPdf: null
  });

  // ✅ CARREGAR ESTATÍSTICAS AO MONTAR COMPONENTE
  useEffect(() => {
  setupAuthInterceptor(); // 👈 ADICIONAR ESTA LINHA
    carregarEstatisticas();
    verificarMigracaoIndexedDB();
  }, [carregarEstatisticas]);

// 🔄 VERIFICAR SE PRECISA MIGRAR DO LOCALSTORAGE APENAS
const verificarMigracaoIndexedDB = useCallback(async () => {
  try {
    // Verificar apenas localStorage (mais simples e seguro)
    const dadosLocalStorage = localStorage.getItem('relatorios_central');
    
    if (dadosLocalStorage) {
      setDialogMigracao(true);
    }
  } catch (error) {
    console.log('Nenhum dado local encontrado para migração');
  }
}, []);

// 🔄 MIGRAR DADOS DO LOCALSTORAGE PARA API
const migrarDadosParaAPI = useCallback(async () => {
  try {
    setEtapaProcessamento('Coletando dados do localStorage...');
    
    let relatoriosParaMigrar: any[] = [];
    
    // Coletar apenas do localStorage
    const dadosLocalStorage = localStorage.getItem('relatorios_central');
    if (dadosLocalStorage) {
      const dados = JSON.parse(dadosLocalStorage);
      Object.entries(dados).forEach(([ticker, relatoriosTicker]: [string, any[]]) => {
        relatoriosTicker.forEach(relatorio => {
          relatoriosParaMigrar.push({
            ...relatorio,
            ticker: relatorio.ticker || ticker
          });
        });
      });
    }
    
    if (relatoriosParaMigrar.length > 0) {
      setEtapaProcessamento(`Enviando ${relatoriosParaMigrar.length} relatórios para API...`);
      
      // Upload em lote para API
      await uploadRelatoriosLote(relatoriosParaMigrar, {
        nomeArquivo: 'migracao_localStorage',
        totalItens: relatoriosParaMigrar.length,
        itensProcessados: relatoriosParaMigrar.length
      });
      
      // Fazer backup antes de limpar
      const blob = new Blob([JSON.stringify(relatoriosParaMigrar, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_migracao_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      // Limpar dados antigos
      localStorage.removeItem('relatorios_central');
      
      // Recarregar dados
      await carregarEstatisticas();
      
      alert(`✅ Migração concluída!\n\n${relatoriosParaMigrar.length} relatórios foram migrados para a API.\n\nBackup foi baixado automaticamente.`);
    } else {
      alert('Nenhum dado encontrado para migrar.');
    }
    
    setDialogMigracao(false);
    
  } catch (error) {
    console.error('Erro na migração:', error);
    alert('❌ Erro na migração. Dados preservados no localStorage.');
  } finally {
    setEtapaProcessamento('');
  }
}, [uploadRelatoriosLote, carregarEstatisticas]);

  // 📤 SALVAR RELATÓRIO VIA API
  const salvarRelatorioIndividual = useCallback(async () => {
    if (!novoRelatorio.ticker || !novoRelatorio.nome) {
      alert('Preencha ticker e nome do relatório');
      return;
    }

    try {
      setEtapaProcessamento('Processando relatório...');
      
      let dadosPdf = {};
      if (novoRelatorio.arquivoPdf) {
        dadosPdf = await processarPdfHibrido(novoRelatorio.arquivoPdf);
      }

      const relatorioCompleto = {
        ticker: novoRelatorio.ticker,
        nome: novoRelatorio.nome,
        tipo: novoRelatorio.tipo,
        dataReferencia: novoRelatorio.dataReferencia,
        linkCanva: novoRelatorio.linkCanva || undefined,
        linkExterno: novoRelatorio.linkExterno || undefined,
        tipoVisualizacao: novoRelatorio.tipoVisualizacao,
        ...dadosPdf
      };

      await uploadRelatorio(relatorioCompleto, {
        nomeArquivo: 'upload_individual',
        totalItens: 1,
        itensProcessados: 1
      });
      
      // ✅ RECARREGAR ESTATÍSTICAS
      await carregarEstatisticas();
      
      setNovoRelatorio({
        ticker: '',
        nome: '',
        tipo: 'trimestral',
        dataReferencia: '',
        linkCanva: '',
        linkExterno: '',
        tipoVisualizacao: 'iframe',
        arquivoPdf: null
      });
      
      setDialogAberto(false);
      alert('✅ Relatório salvo com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      alert('❌ Erro ao processar relatório');
    } finally {
      setEtapaProcessamento('');
    }
  }, [novoRelatorio, uploadRelatorio, carregarEstatisticas]);

  // ✅ EXPORTAR VIA API
  const handleExportarDados = useCallback(async () => {
    try {
      await exportarDados();
      alert('✅ Dados exportados com sucesso!');
    } catch (error) {
      alert('❌ Erro ao exportar dados');
    }
  }, [exportarDados]);

  // ✅ IMPORTAR VIA API
  const handleImportarDados = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dados = e.target?.result as string;
        await importarDados(dados);
        await carregarEstatisticas();
        alert('✅ Dados importados com sucesso!');
        setDialogBackup(false);
      } catch (error) {
        alert('❌ Erro ao importar arquivo');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [importarDados, carregarEstatisticas]);

  // ✅ LIMPAR VIA API
  const handleLimparTudo = useCallback(async () => {
    if (!confirm('Tem certeza que deseja apagar todos os dados?')) return;
    
    try {
      await limparTodos();
      await carregarEstatisticas();
      alert('✅ Dados removidos com sucesso.');
    } catch (error) {
      alert('❌ Erro ao remover dados');
    }
  }, [limparTodos, carregarEstatisticas]);

  // 🗑️ Funções de exclusão VIA API (similar à agenda)
  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuRelatorioId(id);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
    setMenuRelatorioId(null);
  }, []);

  const handleExcluirRelatorio = useCallback((id: string) => {
    setRelatorioParaExcluir(id);
    handleMenuClose();
  }, [handleMenuClose]);

  const confirmarExclusaoRelatorio = useCallback(async () => {
    if (relatorioParaExcluir) {
      try {
        await excluirRelatorio(relatorioParaExcluir);
        await carregarEstatisticas();
        setRelatorioParaExcluir(null);
        alert('✅ Relatório excluído com sucesso!');
      } catch (error) {
        alert('❌ Erro ao excluir relatório');
      }
    }
  }, [relatorioParaExcluir, excluirRelatorio, carregarEstatisticas]);

  const handleExcluirTicker = useCallback((ticker: string) => {
    setTickerParaExcluir(ticker);
  }, []);

  const confirmarExclusaoTicker = useCallback(async () => {
    if (tickerParaExcluir) {
      try {
        const relatoriosDoTicker = estatisticas.relatorios.filter(r => r.ticker === tickerParaExcluir).length;
        await excluirPorTicker(tickerParaExcluir);
        await carregarEstatisticas();
        setTickerParaExcluir(null);
        alert(`✅ ${relatoriosDoTicker} relatórios do ticker ${tickerParaExcluir} excluídos!`);
      } catch (error) {
        alert('❌ Erro ao excluir relatórios do ticker');
      }
    }
}, [tickerParaExcluir, excluirPorTicker, carregarEstatisticas]);

  const handleSelecionar = useCallback((id: string) => {
    setRelatoriosSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, []);

  const handleSelecionarTodos = useCallback(() => {
    if (relatoriosSelecionados.length === estatisticas.relatorios.length) {
      setRelatoriosSelecionados([]);
    } else {
      setRelatoriosSelecionados(estatisticas.relatorios.map(r => r.id));
    }
}, [relatoriosSelecionados.length]);

  const excluirSelecionados = useCallback(async () => {
    if (relatoriosSelecionados.length > 0) {
      try {
        await excluirRelatorios(relatoriosSelecionados);
        await carregarEstatisticas();
        setRelatoriosSelecionados([]);
        setModoSelecao(false);
        alert(`✅ ${relatoriosSelecionados.length} relatórios excluídos!`);
      } catch (error) {
        alert('❌ Erro ao excluir relatórios selecionados');
      }
    }
  }, [relatoriosSelecionados, excluirRelatorios, carregarEstatisticas]);

  // Estatísticas por ticker VIA API
  const estatisticasPorTicker = useMemo(() => {
    const stats: { [ticker: string]: { total: number; comPdf: number } } = {};
    
    estatisticas.relatorios.forEach(relatorio => {
      if (!stats[relatorio.ticker]) {
        stats[relatorio.ticker] = { total: 0, comPdf: 0 };
      }
      stats[relatorio.ticker].total++;
      
      if (relatorio.arquivoPdf || relatorio.nomeArquivoPdf) {
        stats[relatorio.ticker].comPdf++;
      }
    });

    return Object.entries(stats)
      .map(([ticker, data]) => ({ ticker, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [estatisticas.relatorios]);

  const isCarregando = uploadLoading || statsLoading || exportLoading;

  return (
    <Box sx={{ 
      p: 4, 
      maxWidth: 1400, 
      mx: 'auto',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#1e293b',
              mb: 1,
              fontSize: '2rem'
            }}
          >
            🗃️ Central de Relatórios (API/Prisma)
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#64748b', 
              fontWeight: 400,
              fontSize: '1.125rem'
            }}
          >
            Sistema unificado sincronizado entre todos os dispositivos
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<ArrowLeftIcon />}
            onClick={() => router.back()}
            variant="outlined"
            sx={{
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '8px 16px',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1'
              }
            }}
          >
            Voltar
          </Button>

          {/* ✅ INDICADOR DE STATUS DA API */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: '#10b981' 
            }} />
            <Typography sx={{ fontSize: '12px', color: '#64748b' }}>
              API Conectada
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={carregarEstatisticas}
            disabled={statsLoading}
            sx={{
              border: '1px solid #e2e8f0',
              color: '#64748b',
              borderRadius: '12px',
              padding: '8px 16px',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1'
              }
            }}
          >
            {statsLoading ? 'Atualizando...' : 'Atualizar'}
          </Button>
          
          {estatisticas.totalRelatorios > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleLimparTudo}
              sx={{
                borderColor: '#fecaca',
                color: '#dc2626',
                '&:hover': {
                  backgroundColor: '#fef2f2',
                  borderColor: '#fca5a5'
                }
              }}
            >
              Limpar Tudo
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Exibir erros se houver */}
      {(statsError || uploadError || exportError) && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4,
            borderRadius: '12px',
            border: '1px solid #fecaca',
            backgroundColor: '#fef2f2'
          }}
        >
          <Typography sx={{ fontSize: '0.875rem' }}>
            <strong>⚠️ Erro na API:</strong><br/>
            {statsError || uploadError || exportError}
          </Typography>
        </Alert>
      )}

      {/* Cards de Estatísticas - AGORA VIA API */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Box 
            sx={{
              textAlign: 'center',
              p: 3,
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
            }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: '#3b82f6',
                mb: 0.5
              }}
            >
              {statsLoading ? '...' : estatisticas.totalRelatorios}
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              Total de Relatórios
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Box 
            sx={{
              textAlign: 'center',
              p: 3,
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
            }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: '#22c55e',
                mb: 0.5
              }}
            >
              {statsLoading ? '...' : estatisticas.totalTickers}
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              Tickers com Relatórios
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Box 
            sx={{
              textAlign: 'center',
              p: 3,
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
            }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: '#f59e0b',
                mb: 0.5
              }}
            >
              {statsLoading ? '...' : estatisticas.relatoriosComPdf}
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              Relatórios com PDF
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Box 
            sx={{
              textAlign: 'center',
              p: 3,
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
            }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: '#8b5cf6',
                mb: 0.5
              }}
            >
              {statsLoading ? '...' : estatisticas.tamanhoTotalMB}
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              MB Armazenados
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', mt: 0.5 }}>
              Última atualização: {statsLoading ? '...' : (estatisticas.dataUltimoUpload 
                ? new Date(estatisticas.dataUltimoUpload).toLocaleDateString('pt-BR') 
                : 'Nunca'
              )}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Botões de ação */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            onClick={() => setDialogAberto(true)} 
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              borderRadius: '12px',
              padding: '12px 20px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }
            }}
          >
            Novo Relatório
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            onClick={() => setDialogBackup(true)} 
            startIcon={<BackupIcon />}
            sx={{
              border: '1px solid #e2e8f0',
              color: '#64748b',
              borderRadius: '12px',
              padding: '12px 20px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1'
              }
            }}
          >
            Backup/Restore
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            onClick={handleExportarDados} 
            startIcon={<DownloadIcon />}
            disabled={exportLoading}
            sx={{
              border: '1px solid #e2e8f0',
              color: '#64748b',
              borderRadius: '12px',
              padding: '12px 20px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1'
              }
            }}
          >
            {exportLoading ? 'Exportando...' : 'Exportar Dados'}
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            onClick={carregarEstatisticas} 
            startIcon={<RestoreIcon />}
            disabled={statsLoading}
            sx={{
              border: '1px solid #e2e8f0',
              color: '#64748b',
              borderRadius: '12px',
              padding: '12px 20px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1'
              }
            }}
          >
            Atualizar Dados
          </Button>
        </Grid>
      </Grid>

      {/* Indicador de progresso */}
      {isCarregando && (
        <Card sx={{ mb: 4, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ mb: 1, color: '#64748b', fontSize: '0.875rem' }}>
              {etapaProcessamento || 'Processando...'}
            </Typography>
            <LinearProgress 
              value={progresso} 
              variant="determinate" 
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#3b82f6',
                  borderRadius: 4
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Tabs de Visualização */}
      {estatisticas.totalRelatorios > 0 && (
        <Card sx={{ 
          mb: 4,
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
        }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabAtiva} 
              onChange={(_, newValue) => setTabAtiva(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: '#64748b',
                  '&.Mui-selected': {
                    color: '#3b82f6',
                    backgroundColor: '#f0f9ff'
                  }
                }
              }}
            >
              <Tab label={`📋 Relatórios (${estatisticas.totalRelatorios})`} />
              <Tab label={`🏢 Por Ticker (${estatisticas.totalTickers})`} />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 0 }}>
            {/* Tab 1: Lista de Relatórios */}
            {tabAtiva === 0 && (
              <>
                {/* 🗑️ Toolbar de ações */}
                <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                    <Button
                      size="small"
                      variant={modoSelecao ? "contained" : "outlined"}
                      onClick={() => {
                        setModoSelecao(!modoSelecao);
                        setRelatoriosSelecionados([]);
                      }}
                    >
                      {modoSelecao ? 'Cancelar Seleção' : 'Selecionar Múltiplos'}
                    </Button>

                    {modoSelecao && (
                      <>
                        <Button
                          size="small"
                          onClick={handleSelecionarTodos}
                        >
                          {relatoriosSelecionados.length === estatisticas.relatorios.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                        </Button>

                        {relatoriosSelecionados.length > 0 && (
                          <Button
                            size="small"
                            color="error"
                            variant="contained"
                            startIcon={<DeleteIcon />}
                            onClick={excluirSelecionados}
                          >
                            Excluir Selecionados ({relatoriosSelecionados.length})
                          </Button>
                        )}
                      </>
                    )}
                  </Stack>
                </Toolbar>

                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        {modoSelecao && <TableCell padding="checkbox">Sel.</TableCell>}
                        <TableCell>Ticker</TableCell>
                        <TableCell>Nome</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Referência</TableCell>
                        <TableCell>Visualização</TableCell>
                        <TableCell>PDF</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {estatisticas.relatorios
                        .sort((a, b) => new Date(b.dataUpload).getTime() - new Date(a.dataUpload).getTime())
                        .map((relatorio) => (
                          <TableRow key={relatorio.id} hover>
                            {modoSelecao && (
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={relatoriosSelecionados.includes(relatorio.id)}
                                  onChange={() => handleSelecionar(relatorio.id)}
                                />
                              </TableCell>
                            )}
                            <TableCell>
                              <Chip 
                                label={relatorio.ticker} 
                                size="small" 
                                sx={{
                                  backgroundColor: '#dbeafe',
                                  color: '#1e40af',
                                  fontWeight: 500,
                                  borderRadius: '8px'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500, color: '#1e293b' }}>
                              {relatorio.nome}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={relatorio.tipo} 
                                size="small" 
                                variant="outlined"
                                sx={{
                                  borderColor: '#e2e8f0',
                                  color: '#64748b',
                                  borderRadius: '8px'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#64748b' }}>
                              {relatorio.dataReferencia}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {relatorio.tipoVisualizacao === 'canva' && '🎨'}
                                {relatorio.tipoVisualizacao === 'iframe' && '🖼️'}
                                {relatorio.tipoVisualizacao === 'link' && '🔗'}
                                {relatorio.tipoVisualizacao === 'pdf' && '📄'}
                                <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                                  {relatorio.tipoVisualizacao}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {relatorio.nomeArquivoPdf ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={`${((relatorio.tamanhoArquivo || 0) / 1024 / 1024).toFixed(1)}MB`}
                                    size="small"
                                    sx={{
                                      backgroundColor: relatorio.tipoPdf === 'base64' ? '#dcfce7' : '#fef3c7',
                                      color: relatorio.tipoPdf === 'base64' ? '#166534' : '#92400e',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                  {relatorio.tipoPdf === 'referencia' && (
                                    <span style={{ fontSize: '14px' }}>⚠️</span>
                                  )}
                                </Box>
                              ) : (
                                <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                  Sem PDF
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell align="center">
                              <Tooltip title="Mais opções">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuClick(e, relatorio.id)}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Tab 2: Estatísticas por Ticker */}
            {tabAtiva === 1 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {estatisticasPorTicker.map(({ ticker, total, comPdf }) => (
                    <Grid item xs={12} sm={6} md={4} key={ticker}>
                      <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {ticker}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={`${total} total`}
                                size="small"
                                color="primary"
                              />
                              {comPdf > 0 && (
                                <Chip
                                  label={`${comPdf} c/ PDF`}
                                  size="small"
                                  color="success"
                                />
                              )}
                              <Tooltip title="Excluir todos relatórios deste ticker">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleExcluirTicker(ticker)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Menu de contexto para ações do relatório */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuRelatorioId && handleExcluirRelatorio(menuRelatorioId)}>
          <DeleteIcon /> &nbsp; Excluir Relatório
        </MenuItem>
      </Menu>

      {/* Dialogs de Confirmação */}
      <Dialog 
        open={relatorioParaExcluir !== null} 
        onClose={() => setRelatorioParaExcluir(null)}
      >
        <DialogTitle>🗑️ Excluir Relatório</DialogTitle>
        <DialogContent>
          {relatorioParaExcluir && (
            <Typography>
              Tem certeza que deseja excluir este relatório?
              <br/><br/>
              Esta ação não pode ser desfeita.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRelatorioParaExcluir(null)}>
            Cancelar
          </Button>
          <Button
            color="error"
            onClick={confirmarExclusaoRelatorio}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={tickerParaExcluir !== null} 
        onClose={() => setTickerParaExcluir(null)}
      >
        <DialogTitle>🗑️ Excluir Todos Relatórios do Ticker</DialogTitle>
        <DialogContent>
          {tickerParaExcluir && (
            <Typography>
              Tem certeza que deseja excluir todos os{' '}
              <strong>{estatisticas.relatorios.filter(r => r.ticker === tickerParaExcluir).length} relatórios</strong>{' '}
              do ticker <strong>{tickerParaExcluir}</strong>?
              <br/><br/>
              Esta ação não pode ser desfeita.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTickerParaExcluir(null)}>
            Cancelar
          </Button>
          <Button
            color="error"
            onClick={confirmarExclusaoTicker}
          >
            Excluir Todos
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Migração */}
      <Dialog 
        open={dialogMigracao} 
        onClose={() => setDialogMigracao(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>🔄 Migração para API/Prisma</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: '0.875rem' }}>
              <strong>🚀 Sistema Aprimorado Detectado!</strong><br/>
              Encontramos dados no sistema anterior (IndexedDB/localStorage).<br/><br/>
              <strong>Vantagens da migração:</strong><br/>
              • ✅ Sincronização entre dispositivos<br/>
              • ✅ Backup automático<br/>
              • ✅ Performance superior<br/>
              • ✅ Disponível nas páginas dos ativos
            </Typography>
          </Alert>
          <Typography>
            Deseja migrar seus dados para o novo sistema API/Prisma?<br/><br/>
            <strong>✅ Seus dados serão preservados</strong> - um backup será baixado automaticamente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogMigracao(false)}>
            Manter Sistema Antigo
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={migrarDadosParaAPI}
          >
            Migrar para API
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog - Novo Relatório Individual - (MANTIDO IGUAL) */}
      <Dialog 
        open={dialogAberto} 
        onClose={() => !isCarregando && setDialogAberto(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '1.25rem', 
          fontWeight: 600, 
          color: '#1e293b',
          borderBottom: '1px solid #e2e8f0'
        }}>
          ➕ Adicionar Novo Relatório (API)
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Ticker *</InputLabel>
                <Select
                  value={novoRelatorio.ticker}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, ticker: e.target.value }))}
                  sx={{
                    borderRadius: '8px'
                  }}
                >
                  {TICKERS_DISPONIVEIS.map(ticker => (
                    <MenuItem key={ticker} value={ticker}>{ticker}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Relatório *"
                value={novoRelatorio.nome}
                onChange={(e) => setNovoRelatorio(prev => ({ ...prev, nome: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={novoRelatorio.tipo}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, tipo: e.target.value as any }))}
                  sx={{
                    borderRadius: '8px'
                  }}
                >
                  <MenuItem value="trimestral">Trimestral</MenuItem>
                  <MenuItem value="anual">Anual</MenuItem>
                  <MenuItem value="apresentacao">Apresentação</MenuItem>
                  <MenuItem value="outros">Outros</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Referência"
                value={novoRelatorio.dataReferencia}
                onChange={(e) => setNovoRelatorio(prev => ({ ...prev, dataReferencia: e.target.value }))}
                placeholder="Q1 2024"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Visualização</InputLabel>
                <Select
                  value={novoRelatorio.tipoVisualizacao}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, tipoVisualizacao: e.target.value as any }))}
                  sx={{
                    borderRadius: '8px'
                  }}
                >
                  <MenuItem value="iframe">🖼️ Iframe Genérico</MenuItem>
                  <MenuItem value="canva">🎨 Canva</MenuItem>
                  <MenuItem value="link">🔗 Link Externo</MenuItem>
                  <MenuItem value="pdf">📄 PDF para Download</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {novoRelatorio.tipoVisualizacao === 'canva' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Link do Canva"
                  value={novoRelatorio.linkCanva}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, linkCanva: e.target.value }))}
                  placeholder="https://www.canva.com/design/..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />
              </Grid>
            )}
            
            {(novoRelatorio.tipoVisualizacao === 'iframe' || novoRelatorio.tipoVisualizacao === 'link') && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Link Externo"
                  value={novoRelatorio.linkExterno}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, linkExterno: e.target.value }))}
                  placeholder="https://..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Typography 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: '#1e293b',
                  fontSize: '1rem'
                }}
              >
                📄 Upload de PDF (Sistema Híbrido API/Prisma)
              </Typography>
              
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: '12px',
                  border: '1px solid #dbeafe',
                  backgroundColor: '#f0f9ff'
                }}
              >
                <Typography sx={{ fontSize: '0.875rem' }}>
                  <strong>🚀 Sistema API/Prisma:</strong><br/>
                  • <strong>≤3MB:</strong> Base64 (acesso instantâneo)<br/>
                  • <strong>&gt;3MB:</strong> Referência (re-upload quando necessário)<br/>
                  • <strong>Vantagem:</strong> Sincronizado entre todos os dispositivos
                </Typography>
              </Alert>
              
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="upload-pdf-individual"
                type="file"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];
                  if (arquivo) {
                    if (arquivo.size > 10 * 1024 * 1024) {
                      alert('Arquivo muito grande! Máximo 10MB.');
                      e.target.value = '';
                      return;
                    }
                    setNovoRelatorio(prev => ({ ...prev, arquivoPdf: arquivo }));
                  }
                }}
              />
              <label htmlFor="upload-pdf-individual">
                <Button
                  component="span"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '20px',
                    textTransform: 'none',
                    fontWeight: 500,
                    color: novoRelatorio.arquivoPdf ? '#16a34a' : '#64748b',
                    backgroundColor: novoRelatorio.arquivoPdf ? '#f0fdf4' : '#f8fafc',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      borderColor: '#94a3b8'
                    }
                  }}
                >
                  {novoRelatorio.arquivoPdf ? '✅ PDF Selecionado' : '📁 Selecionar PDF'}
                </Button>
              </label>
              
              {novoRelatorio.arquivoPdf && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mt: 2,
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0',
                    backgroundColor: '#f0fdf4'
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem' }}>
                    <strong>📄 Arquivo:</strong> {novoRelatorio.arquivoPdf.name}<br/>
                    <strong>📊 Tamanho:</strong> {(novoRelatorio.arquivoPdf.size / 1024 / 1024).toFixed(2)} MB<br/>
                    <strong>💾 Estratégia:</strong> {novoRelatorio.arquivoPdf.size <= LIMITE_BASE64 ? 'Base64 (Instantâneo)' : 'Referência (Re-upload)'}<br/>
                    <strong>🚀 Destino:</strong> API/Prisma (Sincronizado)
                  </Typography>
                </Alert>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setDialogAberto(false)}
            disabled={isCarregando}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={salvarRelatorioIndividual}
            disabled={!novoRelatorio.ticker || !novoRelatorio.nome || isCarregando}
            startIcon={isCarregando ? <CircularProgress size={16} /> : <SaveIcon />}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              '&:disabled': {
                backgroundColor: '#e2e8f0',
                color: '#94a3b8'
              }
            }}
          >
            {isCarregando ? 'Salvando na API...' : 'Salvar na API'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog - Backup/Restore (ATUALIZADO PARA API) */}
      <Dialog 
        open={dialogBackup} 
        onClose={() => setDialogBackup(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '1.25rem', 
          fontWeight: 600, 
          color: '#1e293b',
          borderBottom: '1px solid #e2e8f0'
        }}>
          💿 Backup & Restore (API/Prisma)
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert 
              severity="info" 
              sx={{
                borderRadius: '12px',
                border: '1px solid #dbeafe',
                backgroundColor: '#f0f9ff'
              }}
            >
              <Typography sx={{ fontSize: '0.875rem' }}>
                <strong>🚀 Sistema API/Prisma:</strong><br/>
                • Backup inclui dados binários (PDFs em Base64)<br/>
                • Dados persistentes no servidor<br/>
                • Compatível com sistemas anteriores<br/>
                • Sincronização automática entre dispositivos
              </Typography>
            </Alert>
            
            <Box>
              <Typography 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: '#1e293b' 
                }}
              >
                📤 Exportar Dados
              </Typography>
              <Button
                fullWidth
                onClick={handleExportarDados}
                startIcon={<DownloadIcon />}
                disabled={exportLoading}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }
                }}
              >
                {exportLoading ? 'Exportando da API...' : 'Baixar Backup da API'}
              </Button>
            </Box>
            
            <Divider />
            
            <Box>
              <Typography 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: '#1e293b' 
                }}
              >
                📥 Importar Dados
              </Typography>
              <input
                accept=".json"
                style={{ display: 'none' }}
                id="import-backup"
                type="file"
                onChange={handleImportarDados}
              />
              <label htmlFor="import-backup">
                <Button
                  component="span"
                  fullWidth
                  startIcon={<RestoreIcon />}
                  sx={{
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      borderColor: '#cbd5e1'
                    }
                  }}
                >
                  Restaurar para API
                </Button>
              </label>
            </Box>
            
            <Alert 
              severity="warning" 
              sx={{
                borderRadius: '12px',
                border: '1px solid #fed7aa',
                backgroundColor: '#fffbeb'
              }}
            >
              <Typography sx={{ fontSize: '0.875rem' }}>
                <strong>⚠️ Atenção:</strong> Importar dados irá <strong>substituir</strong> todos os relatórios existentes na API!
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setDialogBackup(false)}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Estado vazio */}
      {estatisticas.totalRelatorios === 0 && !statsLoading && (
        <Card sx={{ 
          p: 6, 
          textAlign: 'center', 
          mt: 4,
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
        }}>
          <Box sx={{ color: '#3b82f6', mb: 2, fontSize: '4rem' }}>
            🗃️
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#1e293b', 
              fontWeight: 600, 
              mb: 1 
            }}
          >
            📭 Nenhum relatório na API
          </Typography>
          <Typography 
            sx={{ 
              color: '#64748b', 
              mb: 4,
              fontSize: '0.95rem',
              maxWidth: '500px',
              mx: 'auto'
            }}
          >
            Sistema API/Prisma ativo e funcionando!<br/>
            Comece adicionando um novo relatório sincronizado.
          </Typography>
          <Button
            onClick={() => setDialogAberto(true)}
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              borderRadius: '12px',
              padding: '12px 24px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }
            }}
          >
            Adicionar Primeiro Relatório
          </Button>
        </Card>
      )}

      {/* Loading Global */}
      {isCarregando && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <LinearProgress 
            sx={{
              height: 3,
              backgroundColor: '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#3b82f6'
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
}