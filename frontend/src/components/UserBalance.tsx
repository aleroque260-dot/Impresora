// frontend/src/components/UserBalanceCard.tsx - VERSIÓN SIMPLIFICADA
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';
import { getQuickBalanceInfo } from '../services/api';

interface BalanceInfo {
  balance: number;
  available_credit: number;
  has_negative_balance: boolean;
  active_jobs: number;
  can_print: boolean;
  currency_symbol: string;
}

const UserBalanceCard: React.FC = () => {
  const { user } = useAuth();
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Intentar obtener información rápida
      const response = await getQuickBalanceInfo();
      setBalanceInfo(response.data);
      
    } catch (err: any) {
      console.error('Error cargando saldo:', err);
      
      // Si el endpoint no existe, usar datos por defecto
      setBalanceInfo({
        balance: 0,
        available_credit: 1000,
        has_negative_balance: false,
        active_jobs: 0,
        can_print: true,
        currency_symbol: 'CUP',
      });
      
      if (err.response?.status === 404) {
        setError('Servicio de saldo no disponible temporalmente');
      } else {
        setError('Error al cargar el saldo');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: 'CUP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-4"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-32 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  if (error && !balanceInfo) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex items-center text-red-600 mb-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Error de saldo</span>
        </div>
        <p className="text-xs text-gray-500">{error}</p>
      </div>
    );
  }

  const balance = balanceInfo?.balance || 0;
  const hasNegativeBalance = balanceInfo?.has_negative_balance || false;
  const canPrint = balanceInfo?.can_print || true;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-medium text-gray-900">Mi Saldo</h3>
        </div>
        <button
          onClick={fetchBalance}
          className="text-gray-400 hover:text-blue-600 transition-colors"
          title="Actualizar"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Saldo principal */}
      <div className="mb-3">
        <div className="text-2xl font-bold text-gray-900">
          {formatCurrency(balance)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {balanceInfo?.available_credit 
            ? `Crédito disponible: ${formatCurrency(balanceInfo.available_credit)}`
            : 'Cargando...'
          }
        </div>
      </div>

      {/* Estado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {hasNegativeBalance ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
              <AlertCircle className="h-3 w-3 mr-1" />
              Negativo
            </span>
          ) : canPrint ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
              <DollarSign className="h-3 w-3 mr-1" />
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
              <AlertCircle className="h-3 w-3 mr-1" />
              Limitado
            </span>
          )}
          
          {balanceInfo?.active_jobs && balanceInfo.active_jobs > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
              {balanceInfo.active_jobs} trabajos
            </span>
          )}
        </div>
        
        <button
          onClick={() => window.location.href = '/recharge'}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Recargar
        </button>
      </div>
    </div>
  );
};

export default UserBalanceCard;