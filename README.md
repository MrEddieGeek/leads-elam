# Lead Generator - Sistema de Gestión de Leads para Logística

Sistema automatizado de generación y gestión de leads para empresas de logística en México. Permite a los equipos de ventas buscar, organizar y exportar información de empresas potenciales por industria y ubicación.

## Características

- **Búsqueda con Google Maps**: Busca leads reales usando Google Places API
- **Gestión de Leads**: CRUD completo para administrar información de leads
- **Filtros Avanzados**: Buscar por industria, ubicación, status y nombre de empresa
- **Exportación**: Descarga leads en formato Excel o CSV
- **Dashboard**: Estadísticas en tiempo real de leads por status e industria
- **Interfaz Intuitiva**: UI moderna y responsiva con React y Tailwind CSS
- **Sin Duplicados**: Sistema de detección automática usando google_place_id

## Tecnologías

### Backend
- Node.js 20 + Express
- PostgreSQL 14+
- Prisma ORM (base de datos)
- Google Places API (búsqueda de negocios)
- Cheerio (web scraping alternativo)
- ExcelJS (exportación)

### Frontend
- React 18.3
- Vite 5
- Tailwind CSS 3
- Axios (cliente HTTP)

## Requisitos Previos

- Node.js 20+
- PostgreSQL 14+
- npm o yarn
- Google Maps API Key (opcional, pero recomendado para datos reales)

## Instalación Local

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd leads
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/leads_db

# Google Places API (recomendado para datos reales)
GOOGLE_PLACES_API_KEY=tu_api_key_aqui
```

**Obtener Google Places API Key:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita "Places API" y "Places API (New)"
4. Ve a "Credenciales" y crea una API Key
5. Copia la API Key y agrégala a tu archivo `.env`
6. Nota: Google ofrece $200 USD de crédito mensual gratis (~6000 búsquedas)

### 3. Instalar dependencias

```bash
# Instalar dependencias del servidor
npm install

# Instalar dependencias del cliente
cd client
npm install
cd ..
```

O usar el script de build:

```bash
chmod +x build.sh
./build.sh
```

### 4. Configurar la base de datos

Crear la base de datos PostgreSQL:

```bash
createdb leads_db
```

Generar el cliente de Prisma y ejecutar migraciones:

```bash
# Generar Prisma Client
npm run prisma:generate

# Aplicar schema a la base de datos
npm run prisma:push

# O ejecutar migraciones (alternativa)
npm run db:migrate
```

**Comandos útiles de Prisma:**
```bash
npm run prisma:studio     # Abrir interfaz visual de la BD
npm run prisma:migrate    # Crear nueva migración
```

### 5. Iniciar el servidor de desarrollo

```bash
# Iniciar servidor y cliente simultáneamente
npm run dev

# O iniciar por separado:
# Terminal 1 - Servidor
npm run server:dev

# Terminal 2 - Cliente
npm run client:dev
```

El servidor estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

## Despliegue en Render (Gratis)

### Opción 1: Usando render.yaml (Recomendado)

1. Sube tu código a GitHub
2. Crea una cuenta en [Render](https://render.com)
3. Haz clic en "New +" → "Blueprint"
4. Conecta tu repositorio de GitHub
5. Render detectará automáticamente el archivo `render.yaml` y configurará:
   - Base de datos PostgreSQL (free tier)
   - Servicio web con Node.js

### Opción 2: Manual

#### Crear Base de Datos PostgreSQL

1. En Render Dashboard, clic en "New +" → "PostgreSQL"
2. Configura:
   - Name: `leads-db`
   - Database: `leads_db`
   - User: `leads_user`
   - Region: Oregon (u otra región cercana)
   - Plan: **Free**
3. Copia la **Internal Database URL** (la usaremos en el siguiente paso)

#### Crear Web Service

1. En Render Dashboard, clic en "New +" → "Web Service"
2. Conecta tu repositorio de GitHub
3. Configura:
   - Name: `leads-generator`
   - Region: Oregon (misma que la base de datos)
   - Branch: `main`
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: **Free**

4. En "Environment Variables", agrega:
   ```
   NODE_VERSION=20
   NODE_ENV=production
   DATABASE_URL=[pega la Internal Database URL de tu base de datos]
   PORT=10000
   GOOGLE_PLACES_API_KEY=[tu_api_key] (opcional)
   ```

5. Haz clic en "Create Web Service"

#### Ejecutar Migraciones

Después del primer deploy:

1. Ve a tu servicio web en Render
2. Abre la pestaña "Shell"
3. Ejecuta:
   ```bash
   # Aplicar el schema de Prisma
   npx prisma db push

   # O ejecutar migraciones tradicionales
   npm run db:migrate
   ```

¡Listo! Tu aplicación estará disponible en `https://tu-app.onrender.com`

**Nota:** Si agregaste GOOGLE_PLACES_API_KEY, la aplicación buscará leads reales. Si no, generará datos de prueba automáticamente.

## Limitaciones del Free Tier de Render

- **Auto-sleep**: El servicio se apaga después de 15 minutos de inactividad
  - Primera petición después del sleep tardará ~30-60 segundos
- **Base de datos**: 100MB de almacenamiento (~10,000+ leads)
- **Ancho de banda**: 100GB/mes
- **Build time**: 500 minutos de build al mes

## Estructura del Proyecto

```
leads/
├── server/               # Backend (Express)
│   ├── db/              # Configuración y migraciones de BD
│   ├── models/          # Modelos de datos
│   ├── routes/          # Rutas de API
│   ├── scrapers/        # Módulos de web scraping
│   └── index.js         # Punto de entrada del servidor
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # Componentes de React
│   │   ├── api/         # Cliente API
│   │   ├── App.jsx      # Componente principal
│   │   └── main.jsx     # Punto de entrada
│   └── package.json
├── package.json         # Dependencias del servidor
├── render.yaml          # Configuración de Render
└── README.md
```

## API Endpoints

### Leads

- `GET /api/leads` - Obtener todos los leads (con filtros opcionales)
- `GET /api/leads/:id` - Obtener un lead específico
- `GET /api/leads/stats` - Obtener estadísticas
- `POST /api/leads` - Crear un nuevo lead
- `PUT /api/leads/:id` - Actualizar un lead
- `DELETE /api/leads/:id` - Eliminar un lead

### Scraping

- `POST /api/scrape` - Buscar leads automáticamente
- `GET /api/scrape/industries` - Obtener lista de industrias
- `GET /api/scrape/locations` - Obtener lista de ubicaciones

### Export

- `GET /api/export/excel` - Exportar leads a Excel
- `GET /api/export/csv` - Exportar leads a CSV

## Industrias Soportadas

- Bebidas
- Cereales
- Empaque
- Aeroespacial
- Farmacéutica
- Agricultura

## Uso

### Buscar Leads Automáticamente

1. Haz clic en "Buscar Leads"
2. Selecciona el giro de empresa
3. Selecciona la ubicación
4. Define el máximo de resultados
5. Haz clic en "Buscar Leads"

### Filtrar Leads

1. Haz clic en "Filtros"
2. Ingresa criterios de búsqueda
3. Haz clic en "Aplicar Filtros"

### Exportar Leads

1. Aplica filtros (opcional)
2. Haz clic en "Excel" o "CSV"
3. El archivo se descargará automáticamente

### Agregar Lead Manualmente

1. Haz clic en "Agregar Lead"
2. Completa el formulario
3. Haz clic en "Agregar Lead"

### Actualizar Status de Lead

1. Haz clic en el ícono de editar en la tabla
2. Selecciona el nuevo status
3. Haz clic en "Guardar"

## Personalización

### Agregar Nuevas Industrias

Edita `server/routes/scrape.js`:

```javascript
const validGiros = [
  'bebidas',
  'cereales',
  'tu-nueva-industria'  // Agregar aquí
];
```

### Modificar el Scraper

El scraper actual genera datos de prueba. Para implementar scraping real:

1. Edita `server/scrapers/mexicanBusinessScraper.js`
2. Implementa métodos de scraping para fuentes específicas
3. IMPORTANTE: Asegúrate de cumplir con:
   - Términos de servicio del sitio web
   - Leyes de protección de datos (LFPDPPP en México)
   - Robots.txt del sitio
   - Rate limiting apropiado

### Cambiar Colores/Tema

Edita `client/tailwind.config.js` para personalizar los colores de la marca.

## Troubleshooting

### Error de conexión a la base de datos

- Verifica que PostgreSQL esté corriendo
- Revisa que `DATABASE_URL` en `.env` sea correcto
- Asegúrate de haber ejecutado las migraciones

### El servidor no inicia

- Verifica que el puerto 3000 no esté en uso
- Revisa los logs: `npm run server:dev`

### El frontend no se conecta al backend

- Verifica que el servidor esté corriendo en el puerto correcto
- Revisa la configuración del proxy en `client/vite.config.js`

### Error al exportar a Excel

- Verifica que ExcelJS esté instalado: `npm install exceljs`

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

MIT

## Soporte

Para reportar bugs o solicitar features, abre un issue en GitHub.

## Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Asignación de leads a vendedores
- [ ] Seguimiento de conversaciones
- [ ] Integración con CRM (Salesforce, HubSpot)
- [ ] Notificaciones por email
- [ ] API pública con autenticación
- [ ] Scraping de fuentes adicionales
- [ ] Análisis predictivo de leads
