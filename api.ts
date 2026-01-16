
import { VisitRecord, House, User } from './types';

/**
 * DETERMINACIÓN DE URL DE API
 * Intentamos obtener la URL del backend de la variable de entorno,
 * o asumimos localhost si estamos en desarrollo.
 */
const getApiUrl = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3001/api';
  }
  
  // Si tienes una URL de Render específica para el backend, 
  // podrías hardcodearla aquí si las variables de entorno fallan.
  // Ejemplo: return 'https://tu-backend.onrender.com/api';
  
  return '/api'; 
};

const API_URL = getApiUrl();

/**
 * Función auxiliar para procesar respuestas de forma segura.
 * Evita el error "Unexpected token T..." al recibir HTML de error.
 */
async function handleResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || `Error ${response.status}`);
    }
    return data;
  } else {
    // Si no es JSON, capturamos el texto para debug
    const text = await response.text();
    console.error("Respuesta no-JSON recibida:", text.substring(0, 100));
    throw new Error(`Error del servidor (${response.status}): El servidor no respondió con JSON.`);
  }
}

const mapVisit = (v: any): VisitRecord => ({
  id: v.id,
  date: v.date,
  houseNumber: v.house_number || v.houseNumber,
  residentName: v.resident_name || v.residentName,
  type: v.type,
  visitorName: v.visitor_name || v.visitorName,
  visitorRut: v.visitor_rut || v.visitorRut,
  plate: v.plate,
  conciergeName: v.concierge_name || v.conciergeName
});

export const api = {
  async login(rut: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/login-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rut, password })
    });

    return await handleResponse(response);
  },

  async getHouses(): Promise<House[]> {
    try {
      const response = await fetch(`${API_URL}/visits/houses`);
      const data = await handleResponse(response);
      
      return data.map((h: any) => ({
        id: h.id,
        number: h.number,
        residentName: h.owner_name || h.resident_name || 'Sin nombre',
        phone: h.phone || ''
      }));
    } catch (error) {
      console.error("Error API getHouses:", error);
      return [];
    }
  },

  async getVisits(date: string): Promise<VisitRecord[]> {
    try {
      const response = await fetch(`${API_URL}/visits?date=${date}`);
      const data = await handleResponse(response);
      return data.map(mapVisit);
    } catch (error) {
      console.error("Error API getVisits:", error);
      return [];
    }
  },

  async createVisit(visit: Partial<VisitRecord>): Promise<VisitRecord> {
    const response = await fetch(`${API_URL}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visit)
    });

    const result = await handleResponse(response);
    return mapVisit(result);
  }
};
