// src/pages/dashboard/components/modals/BalanceModal.tsx
import React, { useState } from 'react';
import { X, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types/dashboardTypes';

interface BalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onBalanceUpdate: (newBalance: number) => void;
}

const BalanceModal: React.FC<BalanceModalProps> = ({
  isOpen,
  onClose,
  profile,
  onBalanceUpdate
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleRecharge = (amount: number) => {
    if (confirm(`¿Recargar $${amount} a tu cuenta?`)) {
      // In a real app, this would call an API
      const newBalance = profile.balance + amount;
      onBalanceUpdate(newBalance);
      onClose();
      alert(`¡Recarga exitosa! Nuevo saldo: $${newBalance.toFixed(2)}`);
    }
  };

  const handleCustomAmount = () => {
    const amountInput = prompt('Ingresa el monto a recargar:');
    if (amountInput) {
      const amount = parseFloat(amountInput);
      if (!isNaN(amount) && amount > 0) {
        handleRecharge(amount);
      } else {
        alert('Por favor ingresa un monto válido');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Recargar Saldo</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 bg-green-100 rounded-full mb-4">
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Saldo Actual</h4>
            <p className="text-4xl font-bold text-green-600 mb-4">${profile.balance.toFixed(2)}</p>
            <p className="text-gray-600">Recarga tu cuenta para poder imprimir</p>
          </div>
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona el monto de recarga
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[5, 10, 20, 50, 100, 200].map(amount => (
                <button
                  key={amount}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    selectedAmount === amount 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  onClick={() => setSelectedAmount(amount)}
                >
                  <div className="font-bold text-lg">${amount}</div>
                  <div className="text-xs text-gray-500">Recargar</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <p className="text-yellow-800 text-sm">
                  Las recargas son procesadas instantáneamente.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCustomAmount}
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
            >
              <CreditCard className="h-4 w-4 inline mr-2" />
              Otro Monto
            </button>
            {selectedAmount && (
              <button
                onClick={() => handleRecharge(selectedAmount)}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Recargar ${selectedAmount}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceModal;