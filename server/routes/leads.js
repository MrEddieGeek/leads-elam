import express from 'express';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/leads - Get all leads with optional filters
router.get('/', async (req, res, next) => {
  try {
    const {
      giro_empresa,
      ubicacion,
      status,
      search,
      limit,
      offset
    } = req.query;

    const where = {};

    if (giro_empresa) {
      where.giro_empresa = giro_empresa;
    }

    if (ubicacion) {
      where.ubicacion = {
        contains: ubicacion,
        mode: 'insensitive'
      };
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { nombre_empresa: { contains: search, mode: 'insensitive' } },
        { persona_contacto: { contains: search, mode: 'insensitive' } }
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { fecha_creacion: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined
    });

    res.json({ success: true, data: leads, count: leads.length });
  } catch (error) {
    console.error('Error fetching leads:', error);
    next(error);
  }
});

// GET /api/leads/stats - Get statistics
router.get('/stats', async (req, res, next) => {
  try {
    const total = await prisma.lead.count();

    const byStatus = await prisma.lead.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const byGiro = await prisma.lead.groupBy({
      by: ['giro_empresa'],
      _count: { giro_empresa: true },
      orderBy: { _count: { giro_empresa: 'desc' } },
      take: 10
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLeads = await prisma.lead.count({
      where: {
        fecha_creacion: {
          gte: sevenDaysAgo
        }
      }
    });

    const stats = {
      total,
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      byGiro: byGiro.map(item => ({
        giro_empresa: item.giro_empresa,
        count: item._count.giro_empresa
      })),
      recentLeads
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    next(error);
  }
});

// DELETE /api/leads/all - Delete all leads (DESTRUCTIVE!)
router.delete('/all', async (req, res, next) => {
  try {
    const result = await prisma.lead.deleteMany({});

    res.json({
      success: true,
      data: {
        count: result.count,
        message: `${result.count} leads eliminados exitosamente`
      }
    });
  } catch (error) {
    console.error('Error deleting all leads:', error);
    next(error);
  }
});

// GET /api/leads/:id - Get a single lead
router.get('/:id', async (req, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    console.error('Error fetching lead:', error);
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

    const newLead = await prisma.lead.create({
      data: leadData
    });

    res.status(201).json({ success: true, data: newLead });
  } catch (error) {
    console.error('Error creating lead:', error);
    next(error);
  }
});

// PUT /api/leads/:id - Update a lead
router.put('/:id', async (req, res, next) => {
  try {
    const updatedLead = await prisma.lead.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });

    res.json({ success: true, data: updatedLead });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    console.error('Error updating lead:', error);
    next(error);
  }
});

// DELETE /api/leads/:id - Delete a lead
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedLead = await prisma.lead.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ success: true, data: deletedLead });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    console.error('Error deleting lead:', error);
    next(error);
  }
});

export default router;
