// 📁 Central de Proventos - VERSÃO ATUALIZADA PARA API COM PERMISSÕES
'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
  Stack
} from '@mui/material';

// ✅ IMPORTAR HOOK DE AUTENTICAÇÃO
import { useAuthAccess } from '@/hooks/use-auth-access';

// 🔄 IMPORTAR NOVOS HOOKS DA API
import { 
  useProventosEstatisticas, 
  useProventosUpload, 
  useProventosExport 
} from '@/hooks/useProventosAPI';

// Ícones simples
const ArrowLeftIcon = () => <span style={{ fontSize: '16px' }}>←</span>;
const UploadIcon = () => <span style={{ fontSize: '16px' }}>📤</span>;
const CloudUploadIcon = () => <span style={{ fontSize: '16px' }}>☁️</span>;
const CheckIcon = () => <span style={{ fontSize: '16px' }}>✅</span>;
const DeleteIcon = () => <span style={{ fontSize: '16px' }}>🗑️</span>;
const DownloadIcon = () => <span style={{ fontSize: '16px' }}>📥</span>;
const SyncIcon = () => <span style={{ fontSize: '16px' }}>🔄</span>;

// Interfaces (mantidas iguais)
interface ProventoCentral {
  ticker: string;
  data: string;
  dataObj: Date;
  valor: number;
  tipo: string;
  dataFormatada: string;
  valorFormatado: string;
  dataCom?: string;
  dataComFormatada?: string;
  dataPagamento?: string;
  dataPagamentoFormatada?: string;
  dividendYield?: number;
}

export default function CentralProventos() {
  // ✅ TODOS OS HOOKS NO TOPO
  const { hasAccessSync, loading: authLoading, user } = useAuthAccess();
  const router = useRouter();
  
  const [dialogAberto, setDialogAberto] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [etapaProcessamento, setEtapaProcessamento] = useState<string>('');

  // 🔄 USAR NOVOS HOOKS DA API
  const { 
    estatisticas, 
    loading: statsLoading, 
    carregarEstatisticas 
  } = useProventosEstatisticas();
  
  const { 
    uploadProventos, 
    limparTodos, 
    loading: uploadLoading, 
    progresso 
  } = useProventosUpload();
  
  const { 
    exportarDados, 
    loading: exportLoading 
  } = useProventosExport();

  // ✅ TODAS AS FUNÇÕES E useEffect AQUI
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // ✅ CARREGAR ESTATÍSTICAS AO MONTAR COMPONENTE
  useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleUploadArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      alert('Por favor, selecione um arquivo CSV.');
      return;
    }
    setArquivoSelecionado(file);
  };

  // 🌍 VERSÃO UNIVERSAL - ACEITA FORMATO AMERICANO E BRASILEIRO SIMULTANEAMENTE
  const processarCSV = useCallback(async () => {
    if (!arquivoSelecionado) return;

    setEtapaProcessamento('Lendo arquivo...');
    await delay(300);

    try {
      const text = await arquivoSelecionado.text();
      
      // 🧹 LIMPEZA ROBUSTA DO ARQUIVO
      const linhas = text
        .replace(/\r\n/g, '\n')  // Windows line endings
        .replace(/\r/g, '\n')    // Mac line endings  
        .replace(/\n\n+/g, '\n') // Múltiplas quebras
        .split('\n')
        .filter(l => l.trim())   // Remove linhas vazias
        .map(l => l.trim());     // Remove espaços extras
      
      if (linhas.length > 50000) {
        alert('Arquivo muito grande. Máximo de 50.000 linhas suportado.');
        return;
      }

      if (linhas.length < 2) {
        alert('Arquivo vazio ou sem dados válidos.');
        return;
      }

      setEtapaProcessamento(`Processando ${linhas.length - 1} linhas...`);

      const proventos: ProventoCentral[] = [];
      let errosProcessamento = 0;
      const BATCH_SIZE = 100;
      
      // 🔥 FUNÇÃO UNIVERSAL PARA PROCESSAR VALOR (ACEITA QUALQUER FORMATO)
      const processarValor = (valorRaw: string) => {
        if (!valorRaw || valorRaw === '') return 0;
        
        // Remove R$, espaços, e normaliza
        let valor = valorRaw
          .toString()
          .replace(/R\$\s*/g, '')     // Remove R$ e espaços
          .replace(/\s/g, '')         // Remove todos os espaços
          .trim();
        
        // Se tem vírgula E ponto, assumir que vírgula é decimal (formato brasileiro)
        if (valor.includes(',') && valor.includes('.')) {
          // Formato brasileiro: 1.234,56
          valor = valor.replace(/\./g, '').replace(',', '.');
        } else if (valor.includes(',')) {
          // Só vírgula: pode ser decimal ou milhares
          const partes = valor.split(',');
          if (partes.length === 2 && partes[1].length <= 2) {
            // Provavelmente decimal: 123,45
            valor = valor.replace(',', '.');
          } else {
            // Provavelmente milhares: 1,234
            valor = valor.replace(/,/g, '');
          }
        }
        
        const valorNumerico = parseFloat(valor);
        return isNaN(valorNumerico) ? 0 : valorNumerico;
      };
      
      // 🗓️ FUNÇÃO UNIVERSAL PARA PROCESSAR DATA (ACEITA QUALQUER FORMATO)
      const processarData = (dataRaw: string) => {
        if (!dataRaw || dataRaw === '') return null;
        
        const dataLimpa = dataRaw.toString().trim();
        
        try {
          // 🇧🇷 FORMATO BRASILEIRO: DD/MM/YYYY ou DD/MM/YY
          if (dataLimpa.includes('/')) {
            const partes = dataLimpa.split('/');
            if (partes.length === 3) {
              let [dia, mes, ano] = partes;
              
              // Ajustar ano de 2 dígitos
              if (ano.length === 2) {
                ano = parseInt(ano) < 50 ? '20' + ano : '19' + ano;
              }
              
              return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 12, 0, 0);
            }
          }
          
          // 🇺🇸 FORMATO AMERICANO: YYYY-MM-DD
          if (dataLimpa.includes('-')) {
            const partes = dataLimpa.split('-');
            if (partes.length === 3) {
              const [ano, mes, dia] = partes;
              return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 12, 0, 0);
            }
          }
          
          // Tentar parsing direto
          const dataObj = new Date(dataLimpa);
          if (!isNaN(dataObj.getTime())) {
            return new Date(dataObj.getFullYear(), dataObj.getMonth(), dataObj.getDate(), 12, 0, 0);
          }
          
          return null;
        } catch {
          return null;
        }
      };
      
      // 🔄 PROCESSAMENTO EM LOTES COM DETECÇÃO AUTOMÁTICA
      for (let batchStart = 1; batchStart < linhas.length; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, linhas.length);
        
        for (let i = batchStart; i < batchEnd; i++) {
          try {
            const linha = linhas[i];
            if (!linha) continue;

            // FORMATO: ticker,valor,dataCom,dataPagamento,tipo,dividendYield
            const partes = linha.split(',').map(p => p.trim());
            
            if (partes.length < 6) {
              errosProcessamento++;
              continue;
            }
            
            // 📊 EXTRAIR CAMPOS (FUNCIONA COM QUALQUER FORMATO)
            const ticker = partes[0];           // TUPY3 ou RURA11 ou BPFF11
            const valorRaw = partes[1];         // 0.26009606 ou 0.1 ou R$ 0.60
            const dataComRaw = partes[2];       // 2019-03-19 ou 30/05/2025 ou 28/12/2018
            const dataPagamentoRaw = partes[3]; // 2019-03-28 ou 06/06/2025 ou 08/01/2019
            const tipo = partes[4];             // Dividendo ou Rendimento
            const dividendYieldRaw = partes[5]; // 0.0138 ou 0 ou 0.66
            
            // 🔥 PROCESSAR VALORES COM FUNÇÕES UNIVERSAIS
            const valor = processarValor(valorRaw);
            const dataCom = processarData(dataComRaw);
            const dataPagamento = processarData(dataPagamentoRaw);
            const dividendYield = parseFloat(dividendYieldRaw) || undefined;
            
            // ✅ VALIDAÇÕES ESPECÍFICAS
            if (!ticker || ticker === '') {
              errosProcessamento++;
              continue;
            }
            
            if (valor <= 0) {
              errosProcessamento++;
              continue;
            }
            
            if (!dataCom || isNaN(dataCom.getTime())) {
              errosProcessamento++;
              continue;
            }
            
            // 📝 CRIAR OBJETO PROVENTO
            const proventoProcessado: ProventoCentral = {
              ticker: ticker.toUpperCase(),
              data: dataCom.toISOString().split('T')[0], // YYYY-MM-DD
              dataObj: dataCom,
              valor: valor,
              tipo: tipo || 'dividendo',
              dataFormatada: dataCom.toLocaleDateString('pt-BR'),
              valorFormatado: formatarMoeda(valor)
            };
            
            // 📅 ADICIONAR CAMPOS OPCIONAIS
            if (dataPagamento && !isNaN(dataPagamento.getTime())) {
              proventoProcessado.dataPagamento = dataPagamento.toISOString().split('T')[0];
              proventoProcessado.dataPagamentoFormatada = dataPagamento.toLocaleDateString('pt-BR');
            }
            
            if (dividendYield !== undefined && !isNaN(dividendYield)) {
              proventoProcessado.dividendYield = dividendYield;
            }
            
            // Adicionar campos de compatibilidade
            proventoProcessado.dataCom = dataCom.toISOString().split('T')[0];
            proventoProcessado.dataComFormatada = dataCom.toLocaleDateString('pt-BR');
            
            proventos.push(proventoProcessado);

          } catch (error) {
            console.error(`Erro na linha ${i}:`, error);
            errosProcessamento++;
          }
        }

        setEtapaProcessamento(`Processando... ${batchEnd - 1}/${linhas.length - 1} linhas`);
        await delay(50);
      }

      if (proventos.length === 0) {
        alert(`Nenhum provento válido encontrado. Erros: ${errosProcessamento}`);
        return;
      }

      setEtapaProcessamento('Enviando para servidor...');

      // 🚀 USAR API EM VEZ DE localStorage
      const resultado = await uploadProventos(proventos, {
        nomeArquivo: arquivoSelecionado.name,
        tamanhoArquivo: arquivoSelecionado.size,
        totalLinhas: linhas.length,
        linhasProcessadas: proventos.length,
        linhasComErro: errosProcessamento
      });

      // ✅ RECARREGAR ESTATÍSTICAS
      await carregarEstatisticas();
      
      let mensagem = `✅ ${proventos.length.toLocaleString()} proventos processados com sucesso!`;
      if (errosProcessamento > 0) {
        mensagem += `\n⚠️ ${errosProcessamento} linhas ignoradas por erros.`;
      }
      
      alert(mensagem);
      setDialogAberto(false);
      setArquivoSelecionado(null);

    } catch (error) {
      console.error('Erro no processamento:', error);
      alert('Erro ao processar o arquivo. Verifique o formato.');
    } finally {
      setEtapaProcessamento('');
    }
  }, [arquivoSelecionado, uploadProventos, carregarEstatisticas]);

  // ✅ EXPORTAR VIA API
  const handleExportarDados = async () => {
    try {
      await exportarDados();
      alert('Dados exportados com sucesso!');
    } catch (error) {
      alert('Erro ao exportar dados');
    }
  };

  // ✅ LIMPAR VIA API
  const handleLimparTudo = async () => {
    if (!confirm('Tem certeza que deseja apagar todos os dados?')) return;
    
    try {
      await limparTodos();
      await carregarEstatisticas();
      alert('Dados removidos com sucesso.');
    } catch (error) {
      alert('Erro ao remover dados');
    }
  };

  // ✅ VERIFICAÇÕES CONDICIONAIS DEPOIS DOS HOOKS
  if (authLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2, color: '#3b82f6' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
            Verificando permissões administrativas...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Central de Proventos
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!hasAccessSync('admin-proventos')) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        p: 3
      }}>
        <Card sx={{ maxWidth: 600, textAlign: 'center', p: 6 }}>
          <Typography variant="h2" sx={{ fontSize: '64px', mb: 3 }}>
            💰
          </Typography>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#dc2626', 
            mb: 2 
          }}>
            Acesso Administrativo Negado
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
            A <strong>Central de Proventos</strong> é uma área restrita a administradores do sistema. 
            Você não possui as permissões necessárias para gerenciar dados de proventos corporativos.
          </Typography>
          <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Usuário:</strong> {user?.email || 'N/A'}<br/>
              <strong>Plano:</strong> {user?.plan || 'N/A'}<br/>
              <strong>Área solicitada:</strong> Central de Proventos (Admin)
            </Typography>
          </Alert>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="error"
              onClick={() => window.location.href = '/dashboard'}
              sx={{ px: 4 }}
            >
              Voltar ao Dashboard
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.history.back()}
              sx={{ px: 4 }}
            >
              Página Anterior
            </Button>
          </Stack>
        </Card>
      </Box>
    );
  }

  // ✅ RENDER NORMAL DA PÁGINA (todo seu código JSX original)
  return (
    <Box sx={{ 
      p: 4, 
      maxWidth: 1400, 
      mx: 'auto',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Header com botão voltar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Button 
          onClick={() => router.back()} 
          startIcon={<ArrowLeftIcon />} 
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
      </Stack>

      {/* Card principal com título e estatísticas */}
      <Card sx={{ 
        mb: 4, 
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box mb={3}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#1e293b',
                mb: 1,
                fontSize: '2rem'
              }}
            >
              💰 Central de Proventos (API)
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

          {/* Estatísticas - AGORA VIA API */}
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1e293b',
                    mb: 0.5
                  }}
                >
                  {statsLoading ? '...' : estatisticas.totalEmpresas}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Empresas
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1e293b',
                    mb: 0.5
                  }}
                >
                  {statsLoading ? '...' : estatisticas.totalProventos.toLocaleString()}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Proventos
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1e293b',
                    mb: 0.5,
                    fontSize: '1.5rem'
                  }}
                >
                  {statsLoading ? '...' : formatarMoeda(estatisticas.valorTotal).replace('R$', 'R$')}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Total
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#1e293b',
                    mb: 0.5,
                    fontSize: '1rem'
                  }}
                >
                  {statsLoading ? '...' : (estatisticas.dataUltimoUpload 
                    ? new Date(estatisticas.dataUltimoUpload).toLocaleDateString('pt-BR') 
                    : 'Nunca'
                  )}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Último Upload
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Botões de ação - ATUALIZADOS PARA API */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            onClick={() => setDialogAberto(true)} 
            startIcon={<CloudUploadIcon />}
            disabled={uploadLoading}
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
            Novo Upload CSV
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
            {exportLoading ? 'Exportando...' : 'Exportar'}
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            onClick={carregarEstatisticas} 
            startIcon={<SyncIcon />}
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
            {statsLoading ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            onClick={handleLimparTudo} 
            startIcon={<DeleteIcon />}
            disabled={uploadLoading}
            sx={{
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '12px',
              padding: '12px 20px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#fef2f2',
                borderColor: '#fca5a5'
              }
            }}
          >
            Limpar Tudo
          </Button>
        </Grid>
      </Grid>

      {/* Dialog de upload - MANTIDO IGUAL */}
      <Dialog 
        open={dialogAberto} 
        onClose={() => !uploadLoading && setDialogAberto(false)} 
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
          📤 Upload Central de Proventos (API)
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
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
              ✅ Dados serão sincronizados entre todos os dispositivos automaticamente
            </Typography>
          </Alert>
          
          <input 
            id="upload-csv" 
            type="file" 
            accept=".csv" 
            style={{ display: 'none' }} 
            onChange={handleUploadArquivo} 
            disabled={uploadLoading} 
          />
          <label htmlFor="upload-csv">
            <Button 
              component="span" 
              fullWidth 
              startIcon={<UploadIcon />} 
              disabled={uploadLoading}
              sx={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '20px',
                textTransform: 'none',
                fontWeight: 500,
                color: arquivoSelecionado ? '#16a34a' : '#64748b',
                backgroundColor: arquivoSelecionado ? '#f0fdf4' : '#f8fafc',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                  borderColor: '#94a3b8'
                }
              }}
            >
              {arquivoSelecionado ? `✅ ${arquivoSelecionado.name}` : 'Clique para selecionar arquivo CSV'}
            </Button>
          </label>
          
          {uploadLoading && (
            <Box mt={3}>
              <Typography sx={{ mb: 1, color: '#64748b', fontSize: '0.875rem' }}>
                {etapaProcessamento}
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
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setDialogAberto(false)} 
            disabled={uploadLoading}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={processarCSV} 
            disabled={!arquivoSelecionado || uploadLoading}
            startIcon={uploadLoading ? <CircularProgress size={16} /> : <CheckIcon />}
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
            {uploadLoading ? 'Processando...' : 'Processar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}