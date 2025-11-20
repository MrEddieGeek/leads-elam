import { FaUsers, FaCheckCircle, FaClock, FaChartLine } from 'react-icons/fa';

function Dashboard({ stats }) {
  const statusColors = {
    nuevo: 'bg-blue-100 text-blue-800',
    contactado: 'bg-yellow-100 text-yellow-800',
    interesado: 'bg-green-100 text-green-800',
    no_interesado: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    nuevo: 'Nuevo',
    contactado: 'Contactado',
    interesado: 'Interesado',
    no_interesado: 'No Interesado'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Leads */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Leads</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
          </div>
          <div className="bg-primary-100 p-3 rounded-full">
            <FaUsers className="text-primary-600 text-2xl" />
          </div>
        </div>
      </div>

      {/* Recent Leads (Last 7 days) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Últimos 7 días</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.recentLeads}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <FaChartLine className="text-green-600 text-2xl" />
          </div>
        </div>
      </div>

      {/* By Status */}
      <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
        <p className="text-gray-500 text-sm font-medium mb-4">Por Estado</p>
        <div className="grid grid-cols-2 gap-4">
          {stats.byStatus.map((item) => (
            <div key={item.status} className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[item.status] || 'bg-gray-100 text-gray-800'}`}>
                {statusLabels[item.status] || item.status}
              </span>
              <span className="text-lg font-bold text-gray-800">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Industries */}
      {stats.byGiro && stats.byGiro.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2 lg:col-span-4">
          <p className="text-gray-500 text-sm font-medium mb-4">Top Industrias</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.byGiro.slice(0, 5).map((item) => (
              <div key={item.giro_empresa} className="text-center">
                <p className="text-sm text-gray-600 capitalize">{item.giro_empresa}</p>
                <p className="text-2xl font-bold text-primary-600">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
