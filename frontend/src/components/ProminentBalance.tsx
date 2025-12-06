// frontend/src/components/ProminentBalance.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, CreditCard, RefreshCw, TrendingUp, AlertCircle, ArrowUpRight, History, Printer } from 'lucide-react';
import { getQuickBalanceInfo, getMyBalance } from '../services/api';

interface BalanceInfo {
  balance: number;
  available_credit: number;
  has_negative_balance: boolean;
  active_jobs: number;
  can_print: boolean;
  currency_symbol: string;
}

interface FullBalanceData {
  balance: number;
  credit_limit: number;
  available_credit: number;
  total_spent: number;
  last_payment_date?: string;
  print_stats?: {
    completed_jobs: number;
    total_hours: number;
    total_material: number;
    total_spent_printing: number;
  };
}

const ProminentBalance: React.FC = () => {
  const { user } = useAuth();
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);
  const [fullBalanceData, setFullBalanceData] = useState<FullBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Obtener información rápida
      const quickResponse = await getQuickBalanceInfo();
      setBalanceInfo(quickResponse.data);

      // Obtener información completa
      try {
        const fullResponse = await getMyBalance();
        setFullBalanceData(fullResponse.data);
      } catch (fullErr) {
        console.log('No se pudo obtener información completa del saldo');
      }

    } catch (err: any) {
      console.error('Error cargando saldo:', err);
      
      // Datos por defecto
      setBalanceInfo({
        balance: 0,
        available_credit: 1000,
        has_negative_balance: false,
        active_jobs: 0,
        can_print: true,
        currency_symbol: 'CUP',
      });
      
      if (err.response?.status === 404) {
        setError('Servicio temporalmente no disponible');
      } else {
        setError('Error de conexión');
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
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Determinar estilo según el saldo
  const getBalanceStyle = () => {
    if (!balanceInfo) return {};
    
    if (balanceInfo.has_negative_balance) {
      return {
        gradient: 'from-red-600 to-red-700',
        textColor: 'text-white',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        statusText: 'Saldo Negativo',
        statusColor: 'bg-red-500',
      };
    } else if (balanceInfo.balance < 100) {
      return {
        gradient: 'from-yellow-600 to-yellow-700',
        textColor: 'text-white',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        statusText: 'Saldo Bajo',
        statusColor: 'bg-yellow-500',
      };
    } else if (balanceInfo.balance < 500) {
      return {
        gradient: 'from-blue-600 to-blue-700',
        textColor: 'text-white',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        statusText: 'Saldo Moderado',
        statusColor: 'bg-blue-500',
      };
    } else {
      return {
        gradient: 'from-green-600 to-green-700',
        textColor: 'text-white',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        statusText: 'Saldo Excelente',
        statusColor: 'bg-green-500',
      };
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="h-7 bg-blue-500 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-blue-500 rounded w-2/3 mb-4"></div>
        <div className="h-4 bg-blue-500 rounded w-1/2"></div>
      </div>
    );
  }

  const style = getBalanceStyle();
  const balance = balanceInfo?.balance || 0;
  const availableCredit = balanceInfo?.available_credit || 1000;
  const canPrint = balanceInfo?.can_print || true;
  const activeJobs = balanceInfo?.active_jobs || 0;

  return (
    <div className={`bg-gradient-to-r ${style.gradient} rounded-xl p-6 ${style.textColor} shadow-lg`}>
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Tu Saldo Disponible</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.statusColor}`}>
              {style.statusText}
            </span>
          </div>
          
          {/* Saldo principal */}
          <div className="flex items-baseline mb-2">
            <span className="text-5xl font-bold tracking-tight">
              {formatCurrency(balance)}
            </span>
            <span className="ml-3 text-xl opacity-90">CUP</span>
          </div>
          
          <p className="opacity-90 text-sm mb-4">
            Para impresiones 3D y servicios del laboratorio
          </p>
          
          {/* Información adicional */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 opacity-80" />
              <span>Crédito disponible: {formatCurrency(availableCredit)}</span>
            </div>
            
            {activeJobs > 0 && (
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 opacity-80" />
                <span>{activeJobs} trabajo(s) activo(s)</span>
              </div>
            )}
            
            {fullBalanceData?.last_payment_date && (
              <div className="flex items-center">
                <History className="h-4 w-4 mr-2 opacity-80" />
                <span>Última recarga: {new Date(fullBalanceData.last_payment_date).toLocaleDateString('es-ES')}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Acciones */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3">
          <button
            onClick={() => window.location.href = '/recharge'}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 hover:scale-105"
          >
            <DollarSign className="h-5 w-5" />
            <span>Recargar Saldo</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => window.location.href = '/balance-history'}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white/20 border border-white/30 font-medium rounded-lg hover:bg-white/30 transition-colors"
          >
            <History className="h-4 w-4" />
            <span>Ver Historial</span>
          </button>
        </div>
      </div>

      {/* Barra de progreso del crédito */}
      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Uso de crédito</span>
          <span>
            {formatCurrency(balance)} / {formatCurrency(availableCredit + balance)}
          </span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-3">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(100, (Math.abs(balance) / (availableCredit + Math.abs(balance))) * 100)}%` 
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs opacity-80 mt-2">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Estado de impresión */}
      <div className={`mt-6 p-4 ${style.bgColor} border ${style.borderColor} rounded-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Printer className="h-5 w-5 text-gray-700 mr-3" />
            <div>
              <h4 className="font-semibold text-gray-900">Estado de Impresión</h4>
              <p className="text-sm text-gray-600">
                {canPrint 
                  ? 'Puedes enviar nuevos trabajos de impresión'
                  : 'No puedes enviar nuevos trabajos temporalmente'
                }
              </p>
            </div>
          </div>
          {canPrint ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Activo
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              Bloqueado
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-white/20 rounded-lg border border-white/30">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProminentBalance;