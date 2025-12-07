// src/pages/admin/AdminDashboard/components/SystemAlerts.tsx
import React from 'react';
import { Bell, UserCheck, FileText, Wrench, AlertTriangle, X } from 'lucide-react';
import { SystemAlert } from '../../types/adminDashboardTypes';

interface SystemAlertsProps {
  alerts: SystemAlert[];
  onDismissAlert?: (index: number) => void;
}

const SystemAlerts: React.FC<SystemAlertsProps> = ({ alerts, onDismissAlert }) => {
  if (alerts.length === 0) return null;

  const getAlertIcon = (iconType?: string) => {
    switch (iconType) {
      case 'user': return <UserCheck className="h-4 w-4" />;
      case 'file': return <FileText className="h-4 w-4" />;
      case 'printer': return <Wrench className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertStyles = (type: SystemAlert['type']) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
        <Bell className="h-5 w-5 mr-2 text-yellow-500" />
        Alertas del Sistema
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getAlertStyles(alert.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="mt-0.5 mr-2">
                  {getAlertIcon(alert.iconType)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{alert.message}</p>
                  {alert.action && (
                    <button
                      onClick={alert.action.onClick}
                      className="mt-2 text-sm underline hover:no-underline"
                    >
                      {alert.action.label}
                    </button>
                  )}
                </div>
              </div>
              {onDismissAlert && (
                <button
                  onClick={() => onDismissAlert(index)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemAlerts;