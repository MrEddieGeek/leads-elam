import pool from './database.js';

const createTablesSQL = `
-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  nombre_empresa VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  correo_electronico VARCHAR(255),
  persona_contacto VARCHAR(255),
  giro_empresa VARCHAR(100),
  ubicacion VARCHAR(255),
  status VARCHAR(50) DEFAULT 'nuevo',
  fuente VARCHAR(500),
  notas TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_giro_empresa ON leads(giro_empresa);
CREATE INDEX IF NOT EXISTS idx_ubicacion ON leads(ubicacion);
CREATE INDEX IF NOT EXISTS idx_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_fecha_creacion ON leads(fecha_creacion DESC);

-- Create a trigger to update fecha_actualizacion
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_fecha_actualizacion ON leads;
CREATE TRIGGER trigger_update_fecha_actualizacion
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_fecha_actualizacion();
`;

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('Starting database migration...');

    await client.query(createTablesSQL);

    console.log('✓ Database migration completed successfully!');
    console.log('✓ Tables created:');
    console.log('  - leads (with indexes and triggers)');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => {
      console.log('Migration script finished');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration script failed:', err);
      process.exit(1);
    });
}

export default migrate;
