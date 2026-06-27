export interface House {
  id: string;
  number: string;
  residentName: string;
  phone: string;
  phone2?: string; 
}

export type VisitType = 'visita' | 'encomienda';

export interface VisitRecord {
  id: string;
  date: string; 
  houseNumber: string;
  residentName: string;
  // 🚀 Agregamos los teléfonos que vienen adjuntos al registro en el historial
  residentPhone?: string;  // El que ya usabas para el primer botón
  phone2?: string;         // El nuevo segundo teléfono
  type: VisitType;
  visitorName: string;
  visitorRut: string;
  plate?: string;
  conciergeName: string;
  residentConfirmed?: boolean;
  resident_confirmed?: boolean | null; // (Por consistencia con el componente que usa snake_case)
}

export interface User {
  rut: string;
  name: string;
  role?: 'admin' | 'conserje'; // Asegúrate de tener el rol para el filtro de 48 horas
}