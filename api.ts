
import { VisitRecord, House, User } from './types';

// En desarrollo usamos localhost:3001, en producción se usará la URL del servidor
const API_URL = 'http://localhost:3001/api';

/**
 * Mapeador universal: Asegura que los datos de la DB (snake_case)
 * funcionen con la aplicación React (camelCase).
 */
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
  /**
   * Autenticación centralizada en el Backend
   */
  async login(rut: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/login-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rut, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error de autenticación');
    }

    return await response.json();
  },

  /**
   * Obtiene residentes vía Backend
   */
  async getHouses(): Promise<House[]> {
    try {
      const response = await fetch(`${API_URL}/visits/houses`);
      if (!response.ok) throw new Error('No se pudo conectar con el servidor de datos');
      const data = await response.json();
      
      // Mapeo refinado para usar owner_name según el esquema public.houses
      return data.map((h: any) => ({
        id: h.id,
        number: h.number,
        // Usamos owner_name como prioridad absoluta
        residentName: h.owner_name || h.resident_name || h.residentName || 'Sin nombre registrado',
        phone: h.phone || ''
      }));
    } catch (error) {
      console.error("Error cargando casas:", error);
      return [];
    }
  },

  /**
   * Obtiene historial vía Backend
   */
  async getVisits(date: string): Promise<VisitRecord[]> {
    try {
      const response = await fetch(`${API_URL}/visits?date=${date}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map(mapVisit);
    } catch (error) {
      console.error("Error cargando historial:", error);
      return [];
    }
  },

  /**
   * REGISTRO DE VISITA: Flujo obligatorio Frontend -> Backend -> Supabase
   */
  async createVisit(visit: Partial<VisitRecord>): Promise<VisitRecord> {
    const response = await fetch(`${API_URL}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visit)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || 'Error al procesar el registro en el servidor');
    }

    return mapVisit(result);
  }
};
