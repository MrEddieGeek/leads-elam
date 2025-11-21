import express from 'express';
import { buscarEnGoogleMaps } from '../scrapers/googleMapsScraper.js';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const router = express.Router();
const prisma = new PrismaClient();

// POST /api/scrape - Trigger on-demand scraping with Google Maps
router.post('/', async (req, res, next) => {
  try {
    const { giro_empresa, ubicacion, maxResults = 20 } = req.body;

    // Validate inputs
    if (!giro_empresa || !ubicacion) {
      return res.status(400).json({
        success: false,
        error: 'giro_empresa and ubicacion are required'
      });
    }

    // Validate giro_empresa
    const validGiros = [
      'bebidas',
      'cereales',
      'empaque',
      'aeroespacial',
      'farmaceutica',
      'agricultura',
      'automotriz',
      'alimentos',
      'electronica',
      'manufactura',
      'retail',
      'muebles',
      'logistica'
    ];

    if (!validGiros.includes(giro_empresa.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid giro_empresa. Must be one of: ${validGiros.join(', ')}`
      });
    }

    console.log(`🔍 Searching Google Maps: ${giro_empresa} in ${ubicacion}`);

    // Search using Google Maps API
    const leadsFound = await buscarEnGoogleMaps(
      giro_empresa.toLowerCase(),
      ubicacion,
      parseInt(maxResults)
    );

    if (leadsFound.length === 0) {
      return res.json({
        success: true,
        data: {
          created: 0,
          duplicates: 0,
          total: 0,
          leads: [],
          duplicateDetails: []
        },
        message: 'No se encontraron resultados'
      });
    }

    // Save leads to database (with duplicate checking)
    let created = 0;
    const createdLeads = [];
    const duplicates = [];

    for (const lead of leadsFound) {
      try {
        // Check if lead already exists by google_place_id
        const existing = lead.google_place_id ? await prisma.lead.findUnique({
          where: { google_place_id: lead.google_place_id }
        }) : null;

        if (existing) {
          duplicates.push({ ...lead, reason: 'duplicate' });
        } else {
          const newLead = await prisma.lead.create({ data: lead });
          createdLeads.push(newLead);
          created++;
        }
      } catch (error) {
        console.error('Error saving lead:', error.message);
        duplicates.push({ ...lead, reason: error.message });
      }
    }

    res.json({
      success: true,
      data: {
        created,
        duplicates: duplicates.length,
        total: leadsFound.length,
        leads: createdLeads,
        duplicateDetails: duplicates
      },
      message: `Listo! +${created} leads nuevos guardados (total encontrados: ${leadsFound.length})`
    });

  } catch (error) {
    console.error('Scraping error:', error);
    next(error);
  }
});

// GET /api/scrape/industries - Get list of supported industries
router.get('/industries', (req, res) => {
  const industries = [
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'cereales', label: 'Cereales' },
    { value: 'empaque', label: 'Empaque' },
    { value: 'aeroespacial', label: 'Aeroespacial' },
    { value: 'farmaceutica', label: 'Farmacéutica' },
    { value: 'agricultura', label: 'Agricultura' },
    { value: 'automotriz', label: 'Automotriz' },
    { value: 'alimentos', label: 'Alimentos' },
    { value: 'electronica', label: 'Electrónica' },
    { value: 'manufactura', label: 'Manufactura' },
    { value: 'retail', label: 'Retail' },
    { value: 'muebles', label: 'Muebles' },
    { value: 'logistica', label: 'Logística' }
  ];

  res.json({ success: true, data: industries });
});

// GET /api/scrape/locations - Get list of common locations in Mexico
router.get('/locations', (req, res) => {
  const locations = [
    { value: 'jalisco', label: 'Jalisco' },
    { value: 'nuevo leon', label: 'Nuevo León' },
    { value: 'cdmx', label: 'Ciudad de México' },
    { value: 'guanajuato', label: 'Guanajuato' },
    { value: 'queretaro', label: 'Querétaro' },
    { value: 'estado de mexico', label: 'Estado de México' },
    { value: 'puebla', label: 'Puebla' },
    { value: 'veracruz', label: 'Veracruz' },
    { value: 'yucatan', label: 'Yucatán' },
    { value: 'chihuahua', label: 'Chihuahua' }
  ];

  res.json({ success: true, data: locations });
});

export default router;
