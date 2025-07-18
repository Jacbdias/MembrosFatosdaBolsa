import { RelatorioSemanal } from '@/components/RelatorioSemanal';

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