import { useState } from 'react';
import { FaEdit, FaTrash, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

function LeadsTable({ leads, loading, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const statusOptions = [
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'contactado', label: 'Contactado' },
    { value: 'interesado', label: 'Interesado' },
    { value: 'no_interesado', label: 'No Interesado' }
  ];

  const statusColors = {
    nuevo: 'bg-blue-100 text-blue-800',
    contactado: 'bg-yellow-100 text-yellow-800',
    interesado: 'bg-green-100 text-green-800',
    no_interesado: 'bg-red-100 text-red-800'
  };

  const handleEdit = (lead) => {
    setEditingId(lead.id);
    setEditData(lead);
  };

  const handleSave = () => {
    onUpdate(editingId, editData);
    setEditingId(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-600 text-lg">No se encontraron leads</p>
        <p className="text-gray-500 mt-2">Intente buscar leads o ajustar los filtros</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{lead.nombre_empresa}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.persona_contacto || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    {lead.telefono ? (
                      <>
                        <FaPhone className="mr-2 text-gray-400" />
                        <a href={`tel:${lead.telefono}`} className="text-primary-600 hover:underline">
                          {lead.telefono}
                        </a>
                      </>
                    ) : '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    {lead.correo_electronico ? (
                      <>
                        <FaEnvelope className="mr-2 text-gray-400" />
                        <a href={`mailto:${lead.correo_electronico}`} className="text-primary-600 hover:underline truncate max-w-xs">
                          {lead.correo_electronico}
                        </a>
                      </>
                    ) : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 capitalize">{lead.giro_empresa}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    {lead.ubicacion}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === lead.id ? (
                    <select
                      value={editData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="text-sm rounded-full px-3 py-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[lead.status]}`}>
                      {statusOptions.find(s => s.value === lead.status)?.label || lead.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingId === lead.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-900"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(lead)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDelete(lead.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-sm text-gray-700">
          Total de leads: <span className="font-semibold">{leads.length}</span>
        </p>
      </div>
    </div>
  );
}

export default LeadsTable;
