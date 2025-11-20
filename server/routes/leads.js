import express from 'express';
import Lead from '../models/Lead.js';
import { buscarEnGoogleMaps } from '../scrapers/googleMapsScraper.js';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const router = express.Router();
const prisma = new PrismaClient();

// ... TODAS TUS RUTAS GET, POST, PUT, DELETE que ya tenías ...

// ≈≈≈≈ NUEVA RUTA PARA BUSCAR LEADS REALES ≈≈≈≈
router.post('/search', async (req, res) => {
  const { industria, ubicacion } = req.body;

  if (!industria || !ubicacion) {
    return res.status(400).json({
      success: false,
      error: 'Faltan industria o ubicación'
    });
  }

  try {
    console.log(`Buscando: ${industria} en ${ubicacion}`);

    const leadsNuevos = await buscarEnGoogleMaps(industria, ubicacion);

    if (leadsNuevos.length === 0) {
      return res.json({ success: true, message: 'No se encontraron resultados', count: 0 });
    }

    let guardados = 0;
    for (const lead of leadsNuevos) {
      const existe = await prisma.lead.findUnique({
        where: { google_place_id: lead.google_place_id }
      });

      if (!existe) {
        await prisma.lead.create({ data: lead });
        guardados++;
      }
    }

    res.json({
      success: true,
      message: `Listo! +${guardados} leads nuevos guardados (total encontrados: ${leadsNuevos.length})`,
      count: guardados
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
