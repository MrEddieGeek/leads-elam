# Guía de Despliegue en Render

Esta guía te ayudará a desplegar tu aplicación de Lead Generator en Render en menos de 10 minutos.

## Prerrequisitos

- [ ] Cuenta en GitHub
- [ ] Código subido a un repositorio de GitHub
- [ ] Cuenta en Render.com (gratis)
- [ ] (Opcional) Google Places API Key configurada

## Paso 1: Preparar el Repositorio

### 1.1 Inicializar Git (si no lo has hecho)

```bash
cd /home/mreddie/Documents/Recursiones/ELAM/leads
git init
git add .
git commit -m "Initial commit: Lead Generator System"
```

### 1.2 Subir a GitHub

```bash
# Crea un nuevo repositorio en GitHub primero
# Luego ejecuta:
git remote add origin https://github.com/tu-usuario/tu-repo.git
git branch -M main
git push -u origin main
```

## Paso 2: Configurar Variables de Entorno Locales

Antes de desplegar, asegúrate de tener tu archivo `.env` configurado:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/leads_db
GOOGLE_PLACES_API_KEY=tu_api_key_aqui
PORT=3000
NODE_ENV=development
```

## Paso 3: Desplegar en Render (Blueprint)

### Método Recomendado: Blueprint

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Haz clic en **"New +"** → **"Blueprint"**
3. Conecta tu cuenta de GitHub si aún no lo has hecho
4. Selecciona el repositorio `tu-repo`
5. Render detectará automáticamente `render.yaml`
6. Verás dos servicios:
   - **leads-db** (PostgreSQL Database)
   - **leads-generator** (Web Service)
7. Haz clic en **"Apply"**
8. Espera 5-7 minutos mientras Render:
   - Crea la base de datos PostgreSQL
   - Instala dependencias
   - Construye el frontend
   - Despliega la aplicación

## Paso 4: Configurar Google Places API Key (Opcional)

Después del primer deploy:

1. Ve a tu servicio web **"leads-generator"**
2. Haz clic en **"Environment"** en el menú lateral
3. Haz clic en **"Add Environment Variable"**
4. Agrega:
   ```
   Key: GOOGLE_PLACES_API_KEY
   Value: tu_api_key_de_google
   ```
5. Haz clic en **"Save Changes"**
6. El servicio se reiniciará automáticamente

**Sin API Key:** La aplicación funcionará generando datos de prueba automáticamente.

## Paso 5: Ejecutar Migraciones de Base de Datos

1. Ve a tu servicio web **"leads-generator"**
2. Haz clic en **"Shell"** en el menú lateral
3. Ejecuta el siguiente comando:

```bash
npx prisma db push
```

Deberías ver:
```
✔ Prisma schema loaded from prisma/schema.prisma
✔ Datasource "db": PostgreSQL database
✔ Your database is now in sync with your schema
```

## Paso 6: Verificar el Despliegue

### 6.1 Verificar que la aplicación esté corriendo

1. Ve a la URL de tu aplicación: `https://leads-generator-xxxx.onrender.com`
2. Deberías ver la interfaz del Lead Generator
3. Verifica que el dashboard carga correctamente

### 6.2 Probar la búsqueda de leads

1. Haz clic en **"Buscar Leads"**
2. Selecciona:
   - **Industria:** Bebidas
   - **Ubicación:** Jalisco
3. Haz clic en **"Buscar Leads"**
4. Deberías ver leads generados (reales si configuraste API Key, de prueba si no)

### 6.3 Verificar la exportación

1. Haz clic en **"Excel"** o **"CSV"**
2. Debería descargarse un archivo con los leads

## Troubleshooting

### Error: "Application failed to start"

**Solución:**
1. Revisa los logs en Render Dashboard → tu servicio → "Logs"
2. Verifica que `DATABASE_URL` esté configurada correctamente
3. Asegúrate de que el build completó exitosamente

### Error: "Cannot find module '@prisma/client'"

**Solución:**
```bash
# En el Shell de Render
npm install
npx prisma generate
```

### Error: "Database connection failed"

**Solución:**
1. Verifica que la base de datos `leads-db` esté corriendo
2. Ve a la base de datos en Render Dashboard
3. Copia la **Internal Database URL**
4. Actualiza `DATABASE_URL` en las variables de entorno del web service

### La aplicación está muy lenta

**Causa:** Free tier de Render hace "sleep" después de 15 minutos de inactividad.

**Solución:**
- Primera petición después del sleep tarda ~30-60 segundos
- Considera usar el plan de pago ($7/mes) si necesitas estar siempre activo
- O usa un "ping" service gratuito como [Uptime Robot](https://uptimerobot.com/) para mantenerlo despierto

### Error: "Too many requests" en Google Places API

**Causa:** Excediste el límite de la API de Google.

**Solución:**
1. Revisa tu uso en [Google Cloud Console](https://console.cloud.google.com/)
2. Google da $200 USD gratis/mes (~6000 búsquedas)
3. Reduce la frecuencia de búsquedas
4. O considera datos de prueba temporalmente

## Actualizar la Aplicación

Cuando hagas cambios en tu código:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Render detectará automáticamente el push y redesplegar la aplicación.

## Monitoreo

### Ver Logs en Tiempo Real

1. Ve a Render Dashboard → tu servicio
2. Haz clic en **"Logs"**
3. Verás todos los logs de la aplicación en tiempo real

### Estadísticas de Uso

1. Ve a tu base de datos **"leads-db"**
2. Haz clic en **"Metrics"**
3. Verás:
   - Uso de almacenamiento (máx 100MB en free tier)
   - Conexiones activas
   - Queries por segundo

## Límites del Free Tier

- ✅ **PostgreSQL:** 100MB (suficiente para ~10,000+ leads)
- ✅ **Web Service:** 750 horas/mes
- ✅ **Bandwidth:** 100GB/mes
- ⚠️ **Auto-sleep:** Después de 15 min de inactividad
- ⚠️ **Build minutes:** 500 min/mes

## Migrar a Plan de Pago (Opcional)

Si necesitas más recursos:

1. Ve a tu servicio → **"Settings"**
2. En **"Instance Type"**, selecciona un plan de pago
3. Beneficios:
   - No hay auto-sleep
   - Más recursos (CPU, RAM)
   - Mejor performance
   - Soporte prioritario

**Costo:** Desde $7 USD/mes

## Seguridad

### Variables de Entorno Sensibles

✅ **Nunca** subas tu archivo `.env` a GitHub
✅ El archivo `.gitignore` ya está configurado para ignorar `.env`
✅ Configura variables sensibles solo en Render Dashboard

### Base de Datos

✅ Usa la **Internal Database URL** (más segura)
✅ No expongas credenciales de base de datos públicamente
✅ Render encripta las conexiones automáticamente

## Próximos Pasos

- [ ] Configura un dominio personalizado (Settings → Custom Domain)
- [ ] Configura notificaciones de deploy (Settings → Notifications)
- [ ] Habilita autenticación de usuarios (futuro feature)
- [ ] Configura backups automáticos de la base de datos

## Recursos Útiles

- [Render Docs](https://render.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service)

## Soporte

Si encuentras problemas:
1. Revisa los logs en Render Dashboard
2. Consulta la documentación en README.md
3. Abre un issue en GitHub
