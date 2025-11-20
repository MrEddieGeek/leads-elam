import { query } from '../db/database.js';

export class Lead {
  // Get all leads with optional filtering
  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.giro_empresa) {
      sql += ` AND giro_empresa = $${paramCount}`;
      params.push(filters.giro_empresa);
      paramCount++;
    }

    if (filters.ubicacion) {
      sql += ` AND ubicacion ILIKE $${paramCount}`;
      params.push(`%${filters.ubicacion}%`);
      paramCount++;
    }

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (nombre_empresa ILIKE $${paramCount} OR persona_contacto ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ' ORDER BY fecha_creacion DESC';

    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);
    return result.rows;
  }

  // Get a single lead by ID
  static async findById(id) {
    const result = await query('SELECT * FROM leads WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Create a new lead
  static async create(leadData) {
    const {
      nombre_empresa,
      telefono,
      correo_electronico,
      persona_contacto,
      giro_empresa,
      ubicacion,
      fuente,
      notas
    } = leadData;

    const result = await query(
      `INSERT INTO leads
       (nombre_empresa, telefono, correo_electronico, persona_contacto, giro_empresa, ubicacion, fuente, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [nombre_empresa, telefono, correo_electronico, persona_contacto, giro_empresa, ubicacion, fuente, notas]
    );

    return result.rows[0];
  }

  // Update a lead
  static async update(id, leadData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(leadData).forEach(key => {
      if (leadData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(leadData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const result = await query(
      `UPDATE leads SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  // Delete a lead
  static async delete(id) {
    const result = await query('DELETE FROM leads WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Get statistics
  static async getStats() {
    const totalResult = await query('SELECT COUNT(*) as total FROM leads');
    const byStatusResult = await query(
      'SELECT status, COUNT(*) as count FROM leads GROUP BY status'
    );
    const byGiroResult = await query(
      'SELECT giro_empresa, COUNT(*) as count FROM leads GROUP BY giro_empresa ORDER BY count DESC LIMIT 10'
    );
    const recentResult = await query(
      'SELECT COUNT(*) as count FROM leads WHERE fecha_creacion > NOW() - INTERVAL \'7 days\''
    );

    return {
      total: parseInt(totalResult.rows[0].total),
      byStatus: byStatusResult.rows,
      byGiro: byGiroResult.rows,
      recentLeads: parseInt(recentResult.rows[0].count)
    };
  }

  // Check for duplicate (by company name and location)
  static async findDuplicate(nombre_empresa, ubicacion) {
    const result = await query(
      'SELECT * FROM leads WHERE LOWER(nombre_empresa) = LOWER($1) AND LOWER(ubicacion) = LOWER($2) LIMIT 1',
      [nombre_empresa, ubicacion]
    );
    return result.rows[0];
  }

  // Bulk insert leads (for scraping)
  static async bulkCreate(leadsArray) {
    const created = [];
    const duplicates = [];

    for (const leadData of leadsArray) {
      try {
        // Check for duplicates
        const existing = await this.findDuplicate(leadData.nombre_empresa, leadData.ubicacion);

        if (existing) {
          duplicates.push({ ...leadData, reason: 'duplicate' });
        } else {
          const newLead = await this.create(leadData);
          created.push(newLead);
        }
      } catch (error) {
        console.error('Error creating lead:', error);
        duplicates.push({ ...leadData, reason: error.message });
      }
    }

    return { created, duplicates };
  }
}

export default Lead;
