# Quick Start Guide - Lead Generator

Guía rápida para poner en marcha el sistema de generación de leads.

## Inicio Rápido (5 minutos)

### 1. Preparar el entorno

```bash
# Ir al directorio del proyecto
cd /home/mreddie/Documents/Recursiones/ELAM/leads

# Copiar archivo de configuración
cp .env.example .env
```

### 2. Configurar PostgreSQL y Variables de Entorno

```bash
# Crear base de datos
createdb leads_db

# Editar .env con tu configuración
# DATABASE_URL=postgresql://tu_usuario:tu_password@localhost:5432/leads_db
# GOOGLE_PLACES_API_KEY=tu_api_key (opcional - usa datos de prueba sin esto)
```

### 3. Instalar y construir

```bash
# Opción A: Usar script de build
./build.sh

# Opción B: Manual
npm install
cd client && npm install && cd ..
```

### 4. Configurar base de datos con Prisma

```bash
# Generar Prisma Client
npm run prisma:generate

# Aplicar schema a la base de datos
npm run prisma:push
```

### 5. Iniciar en modo desarrollo

```bash
npm run dev
```

Abre tu navegador en: http://localhost:5173

## Despliegue en Render (10 minutos)

### Preparación

1. Sube tu código a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <tu-repositorio-github>
   git push -u origin main
   ```

2. Crea cuenta en [Render.com](https://render.com)

### Despliegue Automático

1. En Render, haz clic en **"New +"** → **"Blueprint"**
2. Conecta tu repositorio de GitHub
3. Render detectará `render.yaml` automáticamente
4. Haz clic en **"Apply"**
5. Espera a que termine el deploy (~5 minutos)

### Configurar Base de Datos

Una vez que el deploy termine:

1. (Opcional) Agrega **GOOGLE_PLACES_API_KEY** en Environment Variables
2. Ve a tu servicio web → **"Shell"**
3. Ejecuta:
   ```bash
   npx prisma db push
   ```

¡Listo! Tu app estará en: `https://tu-app.onrender.com`

**Ver guía completa de despliegue en:** [DEPLOYMENT.md](DEPLOYMENT.md)

## Primeros Pasos en la Aplicación

### 1. Buscar Leads Automáticamente

1. Haz clic en **"Buscar Leads"**
2. Selecciona industria: por ejemplo, **"Bebidas"**
3. Selecciona ubicación: por ejemplo, **"Jalisco"**
4. Haz clic en **"Buscar Leads"**

### 2. Ver y Filtrar Leads

1. Haz clic en **"Filtros"**
2. Filtra por industria, ubicación o status
3. Los resultados se actualizan automáticamente

### 3. Exportar a Excel

1. Aplica los filtros que desees (opcional)
2. Haz clic en **"Excel"**
3. El archivo se descarga automáticamente

### 4. Actualizar Status de Lead

1. En la tabla, haz clic en el ícono de **editar** (lápiz)
2. Cambia el status (Nuevo → Contactado → Interesado)
3. Haz clic en **"Guardar"**

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor + cliente
npm run server:dev       # Solo servidor
npm run client:dev       # Solo cliente

# Producción
npm run build           # Construir cliente
npm start              # Iniciar servidor de producción

# Base de datos
npm run db:migrate     # Ejecutar migraciones
```

## Troubleshooting Rápido

### No puedo conectar a la base de datos
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# O en macOS
brew services list
```

### El puerto 3000 está en uso
```bash
# Cambiar puerto en .env
PORT=3001
```

### Error al instalar dependencias
```bash
# Limpiar cache de npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Notas Importantes

- **Web Scraping**: El scraper actual genera datos de prueba. Para usar datos reales, necesitas implementar scrapers específicos cumpliendo con las leyes de protección de datos.

- **Free Tier de Render**: La app se dormirá después de 15 minutos sin actividad. La primera petición después del sleep tardará ~30-60 segundos.

- **Límites de Base de Datos**: El tier gratuito tiene 100MB (suficiente para ~10,000+ leads).

## Soporte

Lee el README.md completo para más detalles sobre:
- API endpoints
- Personalización
- Troubleshooting avanzado
- Próximas mejoras
