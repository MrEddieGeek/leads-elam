import express from 'express';
import Lead from '../models/Lead.js';
import MexicanBusinessScraper from '../scrapers/mexicanBusinessScraper.js';

const router = express.Router();

// POST /api/scrape - Trigger on-demand scraping
router.post('/', async (req, res, next) => {
  try {
    const { giro_empresa, ubicacion, maxResults = 50 } = req.body;

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
      'agricultura'
    ];

    if (!validGiros.includes(giro_empresa.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid giro_empresa. Must be one of: ${validGiros.join(', ')}`
      });
    }

    console.log(`Scraping request: ${giro_empresa} in ${ubicacion}`);

    // Initialize scraper
    const scraper = new MexicanBusinessScraper();

    // Run scraping
    const scrapedLeads = await scraper.scrape({
      giro_empresa: giro_empresa.toLowerCase(),
      ubicacion,
      maxResults: parseInt(maxResults)
    });

    // Save leads to database
    const result = await Lead.bulkCreate(scrapedLeads);

    res.json({
      success: true,
      data: {
        created: result.created.length,
        duplicates: result.duplicates.length,
        total: scrapedLeads.length,
        leads: result.created,
        duplicateDetails: result.duplicates
      },
      message: `Successfully created ${result.created.length} new leads. ${result.duplicates.length} duplicates skipped.`
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
    { value: 'agricultura', label: 'Agricultura' }
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
