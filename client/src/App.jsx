import { useState, useEffect } from 'react';
import { FaSearch, FaDownload, FaPlus, FaFilter, FaChartBar, FaRobot, FaTrashAlt } from 'react-icons/fa';
import Dashboard from './components/Dashboard';
import LeadsTable from './components/LeadsTable';
import SearchFilters from './components/SearchFilters';
import ScrapeModal from './components/ScrapeModal';
import AddLeadModal from './components/AddLeadModal';
import { leadsAPI, exportAPI } from './api/api';

function App() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch leads on mount and when filters change
  useEffect(() => {
    fetchLeads();
  }, [filters]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await leadsAPI.getAll(filters);
      setLeads(response.data.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      alert('Error al cargar los leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await leadsAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleExportExcel = async () => {
    try {
      const response = await exportAPI.exportExcel(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error al exportar a Excel');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await exportAPI.exportCSV(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Error al exportar a CSV');
    }
  };

  const handleScrapeComplete = () => {
    setShowScrapeModal(false);
    fetchLeads();
    fetchStats();
  };

  const handleAddLead = () => {
    setShowAddModal(false);
    fetchLeads();
    fetchStats();
  };

  const handleUpdateLead = async (id, data) => {
    try {
      await leadsAPI.update(id, data);
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Error al actualizar el lead');
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este lead?')) {
      try {
        await leadsAPI.delete(id);
        fetchLeads();
        fetchStats();
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Error al eliminar el lead');
      }
    }
  };

  const handleDeleteAllLeads = async () => {
    // First confirmation
    const firstConfirm = window.confirm(
      `⚠️ ADVERTENCIA: Está a punto de eliminar TODOS los leads (${leads.length} registros).\n\nEsta acción NO se puede deshacer.\n\n¿Está completamente seguro?`
    );

    if (!firstConfirm) return;

    // Second confirmation (extra safety)
    const secondConfirm = window.confirm(
      '🚨 ÚLTIMA CONFIRMACIÓN:\n\n¿Realmente desea eliminar todos los leads de forma permanente?'
    );

    if (!secondConfirm) return;

    try {
      const response = await leadsAPI.deleteAll();
      alert(`✅ ${response.data.data.count} leads eliminados exitosamente`);
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error('Error deleting all leads:', error);
      alert('❌ Error al eliminar todos los leads');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Generador de Leads - Logística</h1>
          <p className="text-primary-100 mt-2">Sistema de gestión de leads para ventas</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        {stats && <Dashboard stats={stats} />}

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowScrapeModal(true)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaRobot /> Buscar Leads
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus /> Agregar Lead
            </button>
            <button
              onClick={handleDeleteAllLeads}
              disabled={leads.length === 0}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={leads.length === 0 ? 'No hay leads para eliminar' : 'Eliminar todos los leads'}
            >
              <FaTrashAlt /> Eliminar Todos
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaFilter /> Filtros
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaDownload /> Excel
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaDownload /> CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <SearchFilters
            onFilterChange={handleFilterChange}
            currentFilters={filters}
          />
        )}

        {/* Leads Table */}
        <LeadsTable
          leads={leads}
          loading={loading}
          onUpdate={handleUpdateLead}
          onDelete={handleDeleteLead}
        />
      </main>

      {/* Modals */}
      {showScrapeModal && (
        <ScrapeModal
          onClose={() => setShowScrapeModal(false)}
          onComplete={handleScrapeComplete}
        />
      )}

      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddLead}
        />
      )}
    </div>
  );
}

export default App;
