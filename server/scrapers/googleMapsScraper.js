// server/scrapers/googleMapsScraper.js
import axios from 'axios';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function buscarEnGoogleMaps(industria, ubicacion) {
  if (!GOOGLE_API_KEY) {
    throw new Error("Falta GOOGLE_PLACES_API_KEY en las variables de entorno");
  }

  const query = `${industria} en ${ubicacion}, Jalisco, México`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;

  let leads = [];
  let nextPageToken = null;

  do {
    let fullUrl = `${url}?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&language=es`;
    if (nextPageToken) fullUrl += `&pagetoken=${nextPageToken}`;

    const response = await axios.get(fullUrl);
    const results = response.data.results || [];

    for (const place of results) {
      // Obtener detalles adicionales para tener teléfono y website
      const details = await getPlaceDetails(place.place_id);

      leads.push({
        nombre_empresa: place.name || "Sin nombre",
        persona_contacto: details.contacto || null,
        telefono: details.telefono || null,
        correo_electronico: details.email || null,
        website: place.website || details.website || null,
        giro_empresa: industria,
        ubicacion: place.formatted_address || ubicacion,
        rating: place.rating || null,
        total_reviews: place.user_ratings_total || 0,
        fuente: "Google Maps",
        status: "nuevo",
        google_place_id: place.place_id,
        notas: `Rating: ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reseñas)`
      });
    }

    nextPageToken = response.data.next_page_token || null;
    // Google obliga esperar 2 segundos entre páginas
    if (nextPageToken) await new Promise(r => setTimeout(r, 2200));

  } while (nextPageToken && leads.length < 300); // máximo 300 por búsqueda (límite realista)

  return leads;
}

async function getPlaceDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}&language=es&fields=formatted_phone_number,international_phone_number,website`;

  try {
    const res = await axios.get(url);
    const r = res.data.result || {};
    return {
      telefono: r.international_phone_number || r.formatted_phone_number || null,
      website: r.website || null,
      // Intento extraer email del website si existe
      email: r.website ? extractEmailFromWebsite(r.website) : null,
      contacto: "Propietario" // placeholder, puedes mejorarlo después
    };
  } catch (e) {
    return { telefono: null, website: null, email: null, contacto: null };
  }
}

// Función auxiliar para intentar sacar email del dominio
function extractEmailFromWebsite(url) {
  if (!url) return null;
  const common = ["info@", "contacto@", "hola@", "ventas@", "admin@"];
  const domain = url.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0];
  for (const prefix of common) {
    if (!domain.includes("facebook") && !domain.includes("instagram")) {
      return prefix + domain;
    }
  }
  return null; // si no, lo dejamos vacío y lo buscamos después con Hunter.io
}

export { buscarEnGoogleMaps };
export default buscarEnGoogleMaps;
