import { useState, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { scrapeAPI } from '../api/api';

function SearchFilters({ onFilterChange, currentFilters }) {
  const [search, setSearch] = useState(currentFilters.search || '');
  const [giroEmpresa, setGiroEmpresa] = useState(currentFilters.giro_empresa || '');
  const [ubicacion, setUbicacion] = useState(currentFilters.ubicacion || '');
  const [status, setStatus] = useState(currentFilters.status || '');
  const [industries, setIndustries] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchIndustries();
    fetchLocations();
  }, []);

  const fetchIndustries = async () => {
    try {
      const response = await scrapeAPI.getIndustries();
      setIndustries(response.data.data);
    } catch (error) {
      console.error('Error fetching industries:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await scrapeAPI.getLocations();
      setLocations(response.data.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleApplyFilters = () => {
    onFilterChange({
      search,
      giro_empresa: giroEmpresa,
      ubicacion,
      status
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setGiroEmpresa('');
    setUbicacion('');
    setStatus('');
    onFilterChange({});
  };

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'contactado', label: 'Contactado' },
    { value: 'interesado', label: 'Interesado' },
    { value: 'no_interesado', label: 'No Interesado' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre de empresa..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giro de Empresa
          </label>
          <select
            value={giroEmpresa}
            onChange={(e) => setGiroEmpresa(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos</option>
            {industries.map((industry) => (
              <option key={industry.value} value={industry.value}>
                {industry.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <input
            type="text"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Estado o ciudad..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleApplyFilters}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          <FaSearch /> Aplicar Filtros
        </button>
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          <FaTimes /> Limpiar
        </button>
      </div>
    </div>
  );
}

export default SearchFilters;
