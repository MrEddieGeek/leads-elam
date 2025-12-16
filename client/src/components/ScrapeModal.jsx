import { useState, useEffect } from 'react';
import { FaTimes, FaRobot, FaSpinner } from 'react-icons/fa';
import { scrapeAPI } from '../api/api';

function ScrapeModal({ onClose, onComplete }) {
  const [giroEmpresa, setGiroEmpresa] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [maxResults, setMaxResults] = useState(50);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
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

  const handleScrape = async () => {
    if (!giroEmpresa || !ubicacion) {
      alert('Por favor seleccione el giro de empresa y la ubicación');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await scrapeAPI.scrape({
        giro_empresa: giroEmpresa,
        ubicacion,
        maxResults
      });

      setResult(response.data.data);
    } catch (error) {
      console.error('Error scraping:', error);
      alert('Error al buscar leads. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  const handleReset = () => {
    setGiroEmpresa('');
    setUbicacion('');
    setMaxResults(50);
    setResult(null);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaRobot className="text-primary-600 text-2xl" />
            <h2 className="text-2xl font-bold text-gray-900">Buscar Leads Automáticamente</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!result ? (
            <>
              <p className="text-gray-600 mb-6">
                Seleccione el giro de empresa y la ubicación para buscar leads automáticamente.
              </p>

              <div className="space-y-4">
                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giro de Empresa <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={giroEmpresa}
                    onChange={(e) => setGiroEmpresa(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={loading}
                  >
                    <option value="">Seleccione...</option>
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
                    Ubicación <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={loading}
                  >
                    <option value="">Seleccione...</option>
                    {locations.map((location) => (
                      <option key={location.value} value={location.value}>
                        {location.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Max Results */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Resultados
                  </label>
                  <input
                    type="number"
                    value={maxResults}
                    onChange={(e) => setMaxResults(parseInt(e.target.value))}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleScrape}
                  disabled={loading || !giroEmpresa || !ubicacion}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Buscando...
                    </>
                  ) : (
                    <>
                      <FaRobot /> Buscar Leads
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Limpiar
                </button>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Results */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">
                  ¡Búsqueda Completada!
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700">Leads Nuevos</p>
                    <p className="text-3xl font-bold text-green-900">{result.created}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Duplicados (omitidos)</p>
                    <p className="text-3xl font-bold text-green-900">{result.duplicates}</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{result.message}</p>

              {result.duplicates > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    Se omitieron {result.duplicates} leads duplicados basados en el nombre de empresa y ubicación.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 border border-primary-600 text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-lg transition-colors"
                >
                  Nueva Búsqueda
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Ver Leads
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScrapeModal;
