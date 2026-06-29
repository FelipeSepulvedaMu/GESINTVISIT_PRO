import { VisitRecord, House, User } from './types';

/**
 * URL del backend definida por entorno (Vercel)
 * IMPORTANTE: En Vercel definir VITE_API_URL en Variables de Entorno
 */
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-api-tu-dominio.com';

if (!API_URL) {
  throw new Error('VITE_API_URL no está definida en el entorno');
}

/**
 * Manejo seguro de respuestas
 */
async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `Error ${response.status}`);
    }

    return data;
  }

  const text = await response.text();
  console.error('Respuesta no-JSON del servidor:', text.substring(0, 200));

  if (response.status === 404) {
    throw new Error(`Error 404: ruta no encontrada en ${API_URL}`);
  }

  throw new Error(`Error del servidor (${response.status})`);
}

/**
 * Mapeo de visitas
 */
const mapVisit = (v: any): VisitRecord => ({
  id: v.id,
  date: v.date,
  houseNumber: v.house_number || v.houseNumber,
  residentName: v.resident_name || v.residentName,
  residentPhone: v.resident_phone || v.residentPhone || v.phone || '',
  phone: v.phone || '',
  phone2: v.phone2 || v.phone_2 || null,
  type: v.type,
  visitorName: v.visitor_name || v.visitorName,
  visitorRut: v.visitor_rut || v.visitorRut,
  plate: v.plate,
  conciergeName: v.concierge_name || v.conciergeName,
  residentConfirmed: v.resident_confirmed ?? v.residentConfirmed ?? true,
  resident_confirmed: v.resident_confirmed ?? v.residentConfirmed ?? true,
  exitTime: v.exit_time || v.exitTime || null,
  exit_time: v.exit_time || v.exitTime || null
});

/**
 * Mapeo de casas
 */
const mapHouse = (h: any): House => ({
  id: h.id,
  number: String(h.number || ''),
  residentName: h.owner_name || h.resident_name || h.residentName || 'Sin nombre',
  phone: h.phone || h.telefono || '',
  phone2: h.phone2 || h.phone_2 || h.telefono2 || h.telefono_2 || null,
  ownerEmail: h.owner_email || h.email || h.ownerEmail || null
});

export const api = {
  async login(rut: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/login-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rut, password }),
      credentials: 'include'
    });

    return handleResponse(response);
  },

  async markExit(id: string): Promise<VisitRecord> {
    const response = await fetch(`${API_URL}/visits/${id}/exit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const result = await handleResponse(response);
    return mapVisit(result);
  },

  async getHouses(): Promise<House[]> {
    try {
      const response = await fetch(`${API_URL}/visits/houses`, {
        credentials: 'include'
      });

      const data = await handleResponse(response);

      if (!Array.isArray(data)) {
        console.error('Respuesta inesperada en getHouses:', data);
        return [];
      }

      return data.map(mapHouse);
    } catch (error) {
      console.error('Error API getHouses:', error);
      return [];
    }
  },

  async getVisits(date: string): Promise<VisitRecord[]> {
    try {
      const response = await fetch(`${API_URL}/visits?date=${date}`, {
        credentials: 'include'
      });

      const data = await handleResponse(response);

      if (!Array.isArray(data)) {
        console.error('Respuesta inesperada en getVisits:', data);
        return [];
      }

      return data.map(mapVisit);
    } catch (error) {
      console.error('Error API getVisits:', error);
      return [];
    }
  },

  async createVisit(visit: Partial<VisitRecord>): Promise<VisitRecord> {
    const response = await fetch(`${API_URL}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visit),
      credentials: 'include'
    });

    const result = await handleResponse(response);
    return mapVisit(result);
  }
};