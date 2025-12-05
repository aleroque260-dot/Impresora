import React, { useState } from 'react';
import type { UserFilters as FilterType, UserRole, Department } from '../../types/user.types';
import { ROLES } from '../../types/user.types';

interface UserFiltersComponentProps {
  onFilterChange: (filters: FilterType) => void;
  departments: Department[];
  initialFilters?: FilterType;
}

const UserFilters: React.FC<UserFiltersComponentProps> = ({
  onFilterChange,
  departments,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<FilterType>(initialFilters);
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchTerm || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterType = {};
    setFilters(clearedFilters);
    setSearchTerm('');
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o username..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              🔍
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            name="role"
            value={filters.role || ''}
            onChange={handleInputChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Todos los roles</option>
            <option value={ROLES.STUDENT}>Estudiante</option>
            <option value={ROLES.TEACHER}>Profesor</option>
            <option value={ROLES.ADMIN}>Administrador</option>
            <option value={ROLES.TECHNICIAN}>Técnico</option>
            <option value={ROLES.EXTERNAL}>Externo</option>
          </select>

          <select
            name="department_id"
            value={filters.department_id || ''}
            onChange={handleInputChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Todos los departamentos</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <select
            name="is_active"
            value={filters.is_active?.toString() || ''}
            onChange={(e) => {
              const value = e.target.value;
              const newFilters = {
                ...filters,
                is_active: value === '' ? undefined : value === 'true',
              };
              setFilters(newFilters);
              onFilterChange(newFilters);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        <button
          onClick={clearFilters}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default UserFilters;