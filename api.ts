
import { VisitRecord, House, User } from './types';

/**
 * Determinamos la URL de la API de forma dinámica.
 * Si estás en local usa el puerto 3001, en producción intenta usar la URL relativa
 * o una variable de entorno si estuviera disponible.
 */
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api'
  : (window as any)._env_?.VITE_API_URL || '/api';

/**
 * Mapeador universal: Convierte snake_case de la DB a camelCase de React.
 * Es vital que coincida exactamente con los nombres de columna de Supabase.
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

  async getHouses(): Promise<House[]> {
    try {
      const response = await fetch(`${API_URL}/visits/houses`);
      if (!response.ok) throw new Error('No se pudo conectar con el servidor');
      const data = await response.json();
      
      return data.map((h: any) => ({
        id: h.id,
        number: h.number,
        // Priorizamos owner_name que es el nombre real en tu tabla de Supabase
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
      if (!response.ok) return [];
      const data = await response.json();
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

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || result.message || 'Error al guardar');

    return mapVisit(result);
  }
};
