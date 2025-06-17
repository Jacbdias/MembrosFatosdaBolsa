'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
// [ ... todos os seus imports de MUI, Phosphor, etc ... ]

// 🔑 TOKEN BRAPI VALIDADO
const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

// [ ... todas as suas interfaces e funções auxiliares (formatarValor, calcularViesInteligente, etc) SEM ALTERAÇÃO ... ]

// [ ... seus hooks: useDadosFinanceiros, useDividendosAtivo, removeDuplicatas, calcularPerformance (mesma estrutura) ... ]

// [ ... seus componentes: MetricCard, GerenciadorRelatorios, DebugDividendos, HistoricoDividendos, ResumoExecutivo ... ]
// Apenas alterei export de HistoricoDividendos:
export { HistoricoDividendos };

export default function EmpresaDetalhes() {
  const params = useParams();
  const ticker = (params?.ticker || '').toString();

  const [empresa, setEmpresa] = React.useState<EmpresaCompleta | null>(null);
  const [dataSource, setDataSource] = React.useState<'admin' | 'fallback' | 'not_found'>('not_found');

  const { dadosFinanceiros, loading: dadosLoading, error: dadosError, ultimaAtualizacao, refetch } = useDadosFinanceiros(ticker);

  const buscarDYDaTabela = (ticker: string): string => {
    try {
      if (typeof window === 'undefined') return 'N/A';

      const dadosAdmin = localStorage.getItem('portfolioDataAdmin');
      if (dadosAdmin) {
        const ativos = JSON.parse(dadosAdmin);
        const ativoEncontrado = ativos.find((a: any) => a.ticker === ticker);
        if (ativoEncontrado?.dy) return ativoEncontrado.dy;
      }

      const ativoBase = ativosBase?.find(a => a.ticker === ticker);
      if (ativoBase?.dy) return ativoBase.dy;

      if (ticker === 'ALOS3') return '5,95%';

      return 'N/A';
    } catch {
      return 'N/A';
    }
  };

  React.useEffect(() => {
    if (!ticker) return;

    if (typeof window !== 'undefined') {
      try {
        const dadosAdmin = localStorage.getItem('portfolioDataAdmin');
        if (dadosAdmin) {
          const ativos = JSON.parse(dadosAdmin);
          const ativoEncontrado = ativos.find((a: any) => a.ticker === ticker);
          if (ativoEncontrado) {
            setEmpresa(ativoEncontrado);
            setDataSource('admin');
            return;
          }
        }

        const ativoFallback = dadosFallback[ticker];
        if (ativoFallback) {
          setEmpresa(ativoFallback);
          setDataSource('fallback');
          return;
        }

        setDataSource('not_found');
      } catch {
        setDataSource('not_found');
      }
    }
  }, [ticker]);

  const empresaCompleta = React.useMemo(() => {
    if (!empresa) return null;

    let empresaAtualizada = { ...empresa };

    if (dadosFinanceiros && dadosFinanceiros.precoAtual > 0) {
      empresaAtualizada = {
        ...empresaAtualizada,
        dadosFinanceiros,
        viesAtual: calcularViesInteligente(empresa.precoTeto, dadosFinanceiros.precoAtual),
        statusApi: 'success',
        ultimaAtualizacao
      };
    } else {
      empresaAtualizada.statusApi = 'error';
    }

    return empresaAtualizada;
  }, [empresa, dadosFinanceiros, ultimaAtualizacao]);

  const calcularPerformance = () => {
    if (!empresaCompleta?.dadosFinanceiros) return 'N/A';

    const precoEntradaStr = empresaCompleta.precoIniciou.replace(/[^\d,]/g, '').replace(',', '.');
    const precoEntrada = parseFloat(precoEntradaStr);
    const precoAtual = empresaCompleta.dadosFinanceiros.precoAtual;

    if (precoEntrada > 0 && precoAtual > 0) {
      const performance = ((precoAtual - precoEntrada) / precoEntrada) * 100;
      return formatarValor(performance, 'percent');
    }
    return 'N/A';
  };

  const dyDaTabela = buscarDYDaTabela(ticker);

  if (!ticker || !empresaCompleta || dataSource === 'not_found') {
    return (
      <Box sx={{
        p: 3,
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          🔍 Empresa não encontrada
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4, maxWidth: 400, mx: 'auto' }}>
          O ticker "<strong>{ticker}</strong>" não foi encontrado na nossa base de dados.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            startIcon={<ArrowLeftIcon />}
            onClick={() => window.history.back()}
            variant="contained"
            size="large"
          >
            Voltar à Lista
          </Button>
        </Stack>
      </Box>
    );
  }

  // [ ... todo o seu JSX principal renderizado como já estava, sem mudanças ... ]
}
