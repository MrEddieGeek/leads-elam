import express from 'express';
import Lead from '../models/Lead.js';

const router = express.Router();

// GET /api/leads - Get all leads with optional filters
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      giro_empresa: req.query.giro_empresa,
      ubicacion: req.query.ubicacion,
      status: req.query.status,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined
    };

    const leads = await Lead.findAll(filters);
    res.json({ success: true, data: leads, count: leads.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/leads/stats - Get statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await Lead.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/leads/:id - Get a single lead
router.get('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
});

// POST /api/leads - Create a new lead
router.post('/', async (req, res, next) => {
  try {
    const leadData = req.body;

    // Validate required fields
    if (!leadData.nombre_empresa) {
      return res.status(400).json({ success: false, error: 'nombre_empresa is required' });
    }

    const newLead = await Lead.create(leadData);
    res.status(201).json({ success: true, data: newLead });
  } catch (error) {
    next(error);
  }
});

// PUT /api/leads/:id - Update a lead
router.put('/:id', async (req, res, next) => {
  try {
    const updatedLead = await Lead.update(req.params.id, req.body);

    if (!updatedLead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    res.json({ success: true, data: updatedLead });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/leads/:id - Delete a lead
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedLead = await Lead.delete(req.params.id);

    if (!deletedLead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    res.json({ success: true, data: deletedLead });
  } catch (error) {
    next(error);
  }
});

export default router;
