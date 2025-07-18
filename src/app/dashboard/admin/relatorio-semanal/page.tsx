'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminRelatorioSemanal from '@/components/AdminRelatorioSemanal';

export default function AdminRelatorioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Verificar se é admin
    const userEmail = localStorage.getItem('user-email');
    
    if (userEmail !== 'admin@fatosdobolsa.com') {
      router.push('/dashboard');
      return;
    }
    
    setAuthorized(true);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return <AdminRelatorioSemanal />;
}