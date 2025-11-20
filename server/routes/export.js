import express from 'express';
import ExcelJS from 'exceljs';
import Lead from '../models/Lead.js';

const router = express.Router();

// GET /api/export/excel - Export leads to Excel
router.get('/excel', async (req, res, next) => {
  try {
    const filters = {
      giro_empresa: req.query.giro_empresa,
      ubicacion: req.query.ubicacion,
      status: req.query.status,
      search: req.query.search
    };

    const leads = await Lead.findAll(filters);

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre de Empresa', key: 'nombre_empresa', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 20 },
      { header: 'Correo Electrónico', key: 'correo_electronico', width: 30 },
      { header: 'Persona de Contacto', key: 'persona_contacto', width: 25 },
      { header: 'Giro de Empresa', key: 'giro_empresa', width: 20 },
      { header: 'Ubicación', key: 'ubicacion', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Fuente', key: 'fuente', width: 40 },
      { header: 'Fecha de Creación', key: 'fecha_creacion', width: 20 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    // Add data rows
    leads.forEach(lead => {
      worksheet.addRow({
        id: lead.id,
        nombre_empresa: lead.nombre_empresa,
        telefono: lead.telefono,
        correo_electronico: lead.correo_electronico,
        persona_contacto: lead.persona_contacto,
        giro_empresa: lead.giro_empresa,
        ubicacion: lead.ubicacion,
        status: lead.status,
        fuente: lead.fuente,
        fecha_creacion: lead.fecha_creacion ? new Date(lead.fecha_creacion).toLocaleDateString('es-MX') : ''
      });
    });

    // Auto-filter
    worksheet.autoFilter = {
      from: 'A1',
      to: 'J1'
    };

    // Set response headers
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `leads_${timestamp}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    next(error);
  }
});

// GET /api/export/csv - Export leads to CSV
router.get('/csv', async (req, res, next) => {
  try {
    const filters = {
      giro_empresa: req.query.giro_empresa,
      ubicacion: req.query.ubicacion,
      status: req.query.status,
      search: req.query.search
    };

    const leads = await Lead.findAll(filters);

    // Create CSV content
    const headers = [
      'ID',
      'Nombre de Empresa',
      'Teléfono',
      'Correo Electrónico',
      'Persona de Contacto',
      'Giro de Empresa',
      'Ubicación',
      'Status',
      'Fuente',
      'Fecha de Creación'
    ];

    const csvRows = [headers.join(',')];

    leads.forEach(lead => {
      const row = [
        lead.id,
        `"${lead.nombre_empresa || ''}"`,
        `"${lead.telefono || ''}"`,
        `"${lead.correo_electronico || ''}"`,
        `"${lead.persona_contacto || ''}"`,
        `"${lead.giro_empresa || ''}"`,
        `"${lead.ubicacion || ''}"`,
        `"${lead.status || ''}"`,
        `"${lead.fuente || ''}"`,
        lead.fecha_creacion ? new Date(lead.fecha_creacion).toLocaleDateString('es-MX') : ''
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Set response headers
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `leads_${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Add BOM for Excel to recognize UTF-8
    res.write('\uFEFF');
    res.write(csvContent);
    res.end();

  } catch (error) {
    next(error);
  }
});

export default router;
