# Cambios Realizados y Actualizaciones

Este documento resume los cambios que has hecho al proyecto y las mejoras implementadas.

## Resumen de Cambios

### ✅ Lo que has agregado/modificado:

1. **Prisma ORM**
   - Agregaste `@prisma/client` y `prisma` a las dependencias
   - Prisma reemplaza las queries SQL directas con un ORM más robusto
   - Facilita las migraciones y el manejo de la base de datos

2. **Google Maps Scraper**
   - Implementaste búsqueda real de negocios usando Google Places API
   - Ruta nueva: `POST /api/leads/search`
   - Extrae datos reales: nombre, teléfono, email, ubicación, rating
   - Evita duplicados usando `google_place_id` único

3. **Configuración de Build Optimizada**
   - Simplificaste el build command: `npm install && npm run build`
   - Frontend ahora se construye en `/dist` del root (mejor para Render)
   - Build incluye `prisma generate` automáticamente

4. **Render Configuration**
   - Agregaste `NODE_VERSION=20` para asegurar Node.js 20
   - Configuración de base de datos en `render.yaml`
   - Variables de entorno listas para producción

## Archivos Nuevos Creados

1. **prisma/schema.prisma** - Schema de Prisma con el modelo Lead
2. **server/scrapers/googleMapsScraper.js** - Scraper de Google Maps (actualizado a ES6)
3. **DEPLOYMENT.md** - Guía completa de despliegue en Render
4. **CHANGES.md** - Este archivo

## Archivos Modificados

1. **package.json**
   - Scripts de Prisma agregados
   - Build incluye `prisma generate`

2. **server/routes/leads.js**
   - Nueva ruta `/api/leads/search` para buscar con Google Maps
   - Usa Prisma Client para evitar duplicados

3. **render.yaml**
   - Incluye configuración de base de datos PostgreSQL
   - Variables de entorno configuradas

4. **.env.example**
   - Variable `GOOGLE_PLACES_API_KEY` agregada

5. **README.md y QUICKSTART.md**
   - Actualizados con instrucciones de Prisma
   - Agregadas instrucciones para Google Places API

## Cómo Funciona Ahora

### Búsqueda de Leads

Tienes dos opciones:

**Opción 1: Google Maps (Recomendado) - Datos Reales**
```javascript
POST /api/leads/search
{
  "industria": "bebidas",
  "ubicacion": "Guadalajara, Jalisco"
}
```
- Busca negocios reales en Google Maps
- Extrae: nombre, teléfono, email (aproximado), rating, ubicación
- Requiere: `GOOGLE_PLACES_API_KEY` en `.env`
- Costo: $200 USD gratis/mes de Google = ~6000 búsquedas

**Opción 2: Scraper Tradicional - Datos de Prueba**
```javascript
POST /api/scrape
{
  "giro_empresa": "bebidas",
  "ubicacion": "jalisco",
  "maxResults": 50
}
```
- Genera datos de prueba si no hay API key
- Útil para desarrollo y testing

### Base de Datos (Prisma)

Antes usabas queries SQL directas:
```javascript
query('SELECT * FROM leads WHERE id = $1', [id])
```

Ahora usas Prisma (más limpio):
```javascript
prisma.lead.findUnique({ where: { id } })
```

### Prevención de Duplicados

La tabla `leads` tiene un campo único `google_place_id`:
```prisma
google_place_id String? @unique
```

Cuando buscas leads, el sistema verifica:
```javascript
const existe = await prisma.lead.findUnique({
  where: { google_place_id: lead.google_place_id }
});
```

## Antes de Desplegar en Render

### ✅ Checklist Pre-Deploy

- [ ] Código subido a GitHub
- [ ] Archivo `.env` **NO** está en el repositorio (verificar `.gitignore`)
- [ ] `render.yaml` está en el root del proyecto
- [ ] `prisma/schema.prisma` existe
- [ ] (Opcional) Tienes Google Places API Key lista

### 📋 Pasos para Desplegar

1. **Subir a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Lead Generator System ready for deployment"
   git remote add origin https://github.com/tu-usuario/leads.git
   git push -u origin main
   ```

2. **Deploy en Render:**
   - Ve a [Render Dashboard](https://dashboard.render.com/)
   - New+ → Blueprint
   - Conecta tu repo
   - Apply
   - Espera 5-7 minutos

3. **Configurar Google API (Opcional):**
   - En Render → tu servicio → Environment
   - Add: `GOOGLE_PLACES_API_KEY = tu_key`
   - Save

4. **Aplicar Schema:**
   - Shell en Render
   - `npx prisma db push`

## Costos

### Render Free Tier
- ✅ **PostgreSQL:** 100MB gratis
- ✅ **Web Service:** 750 horas/mes gratis
- ⚠️ **Limitación:** Auto-sleep después 15 min

### Google Places API
- ✅ **$200 USD gratis/mes**
- 💰 Text Search: $32/1000 requests
- 💰 Place Details: $17/1000 requests
- **Total gratis:** ~6000 búsquedas/mes

**Sin API Key:** La app genera datos de prueba automáticamente.

## Próximos Pasos Recomendados

### Corto Plazo (antes de producción)
1. ✅ Desplegar en Render
2. ✅ Configurar Google Places API Key
3. ✅ Probar búsquedas reales
4. 📝 Configurar dominio personalizado (opcional)

### Mediano Plazo (mejoras)
1. 🔐 Implementar autenticación de usuarios
2. 📧 Notificaciones por email cuando hay nuevos leads
3. 📊 Dashboard con métricas más detalladas
4. 🤖 Integración con CRM (Salesforce, HubSpot)

### Largo Plazo (escalabilidad)
1. 💾 Backups automáticos de la base de datos
2. 🚀 Migrar a plan de pago ($7/mes) si crece el uso
3. 🔍 Agregar más fuentes de datos (APIs adicionales)
4. 📱 Versión mobile de la aplicación

## Comandos Útiles

### Desarrollo Local
```bash
npm run dev                    # Servidor + Cliente
npm run prisma:studio          # Ver base de datos visualmente
npm run prisma:generate        # Regenerar Prisma Client
npm run prisma:push            # Aplicar schema a BD
```

### Producción (Render Shell)
```bash
npx prisma db push             # Aplicar schema
npx prisma studio              # Ver datos (no recomendado en prod)
npm start                      # Reiniciar servidor
```

### Git
```bash
git status                     # Ver cambios
git add .                      # Agregar todos los cambios
git commit -m "mensaje"        # Hacer commit
git push origin main           # Subir a GitHub (trigger deploy)
```

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"
```bash
npm install
npx prisma generate
```

### Error: "GOOGLE_PLACES_API_KEY not found"
- Es normal si no configuraste la API key
- La app usará datos de prueba automáticamente

### Error: "Database connection failed"
- Verifica `DATABASE_URL` en Render
- Asegúrate de que la base de datos esté corriendo

### Build falla en Render
- Revisa los logs
- Verifica que `package.json` esté correcto
- Asegúrate de que `prisma/schema.prisma` exista

## Recursos

- 📘 [Guía de Despliegue](DEPLOYMENT.md)
- 📗 [Inicio Rápido](QUICKSTART.md)
- 📕 [Documentación Completa](README.md)
- 🌐 [Render Docs](https://render.com/docs)
- 🗃️ [Prisma Docs](https://www.prisma.io/docs)
- 🗺️ [Google Places API](https://developers.google.com/maps/documentation/places/web-service)

## Preguntas Frecuentes

**Q: ¿Necesito configurar Google Places API obligatoriamente?**
A: No, es opcional. Sin API key, la app genera datos de prueba.

**Q: ¿Cuánto cuesta correr esto en Render?**
A: Free tier es suficiente para empezar (100MB BD, 750h/mes).

**Q: ¿Puedo usar otra base de datos?**
A: Sí, Prisma soporta MySQL, SQLite, MongoDB, etc. Solo cambia el `datasource` en `schema.prisma`.

**Q: ¿Cómo agrego más campos a los leads?**
A: Edita `prisma/schema.prisma`, agrega el campo, ejecuta `npx prisma db push`.

**Q: ¿Puedo buscar en otros países además de México?**
A: Sí, en `googleMapsScraper.js` el query incluye ", México" al final. Puedes cambiarlo o hacerlo dinámico.

---

**¡Éxito con tu deploy! 🚀**
