
import dynamic from 'next/dynamic';

// ✅ IMPORTAÇÃO DINÂMICA para evitar problemas de SSR
const RelatorioSemanal = dynamic(
  () => import('@/components/RelatorioSemanal').then(mod => ({ default: mod.RelatorioSemanal })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    )
  }
);

async function getRelatorio() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/relatorio-semanal`, {
      next: { revalidate: 300 } // Revalidar a cada 5 minutos
    });
    
    if (!response.ok) {
      throw new Error('Falha ao carregar relatório');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar relatório:', error);
    return null;
  }
}

export default async function RelatorioSemanalPage() {
  const relatorio = await getRelatorio();
  
  if (!relatorio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatório Não Disponível</h1>
          <p className="text-gray-600">O relatório semanal ainda não foi publicado.</p>
        </div>
      </div>
    );
  }
  
  return <RelatorioSemanal data={relatorio} />;
}

export const metadata = {
  title: 'Relatório Semanal - Fatos da Bolsa',
  description: 'Atualizações semanais do mercado de ações brasileiro e internacional',
};