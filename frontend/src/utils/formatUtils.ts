// frontend/src/utils/formatUtils.ts
/**
 * Utilidades de formato para la aplicación
 */

/**
 * Formatea un valor como tiempo (para duraciones)
 * @param time - Número (minutos) o string/Date para hora
 * @returns String formateado
 */
export const formatTime = (time: Date | string | number | null): string => {
  if (time === null || time === undefined) return '--:--';
  
  // Si es número, asumir que es duración en minutos
  if (typeof time === 'number') {
    return formatDuration(time);
  }
  
  // Si es Date o string, formatear como hora del día
  const date = new Date(time);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Formatea duración en minutos a formato legible
 * @param minutes - Duración en minutos
 * @returns String formateado (ej: "2h 30m")
 */
export const formatDuration = (minutes: number): string => {
  if (minutes === null || minutes === undefined || isNaN(minutes)) return '--';
  
  // Si es menor a 1, podría estar en horas
  let totalMinutes = minutes;
  if (minutes < 1 && minutes > 0) {
    totalMinutes = minutes * 60; // Convertir horas a minutos
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  
  if (hours > 0) {
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  }
  return `${mins}m`;
};

/**
 * Formatea una fecha
 * @param date - Fecha a formatear
 * @returns String formateado (ej: "15/12/2023")
 */
export const formatDate = (date: Date | string | number | null): string => {
  if (!date && date !== 0) return '--/--/----';
  
  const d = typeof date === 'number' ? new Date(date) : new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formatea una fecha de manera corta
 * @param date - Fecha a formatear
 * @returns String formateado (ej: "15/12")
 */
export const formatDateShort = (date: Date | string | number | null): string => {
  if (!date && date !== 0) return '--/--';
  
  const d = typeof date === 'number' ? new Date(date) : new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit'
  });
};

/**
 * Formatea una fecha y hora completa
 * @param date - Fecha a formatear
 * @returns String formateado (ej: "15/12/2023 14:30")
 */
export const formatDateTime = (date: Date | string | number | null): string => {
  if (!date && date !== 0) return '--/--/---- --:--';
  
  const d = typeof date === 'number' ? new Date(date) : new Date(date);
  const dateStr = d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeStr = d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return `${dateStr} ${timeStr}`;
};

/**
 * Formatea un valor monetario
 * @param amount - Cantidad a formatear
 * @returns String formateado (ej: "$150.00")
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$--.--';
  
  return new Intl.NumberFormat('es-CU', {
    style: 'currency',
    currency: 'CUP',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Formatea cantidad de filamento
 * @param grams - Gramos de filamento
 * @returns String formateado (ej: "150.5g" o "1.25kg")
 */
export const formatFilament = (grams: number | null | undefined): string => {
  if (grams === null || grams === undefined || isNaN(grams)) return '--';
  
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)}kg`;
  }
  return `${grams.toFixed(1)}g`;
};

/**
 * Formatea porcentaje
 * @param value - Valor porcentual (0-100)
 * @returns String formateado (ej: "75.5%")
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '--%';
  
  return `${value.toFixed(1)}%`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default { formatTime, formatDate, formatDateShort, formatDateTime, formatCurrency, formatFilament, formatPercentage };