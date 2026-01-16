
export interface House {
  id: string;
  number: string;
  residentName: string;
  phone: string;
}

export type VisitType = 'visita' | 'encomienda';

export interface VisitRecord {
  id: string;
  date: string; // ISO String
  houseNumber: string;
  residentName: string;
  type: VisitType;
  visitorName: string;
  visitorRut: string;
  plate?: string;
  conciergeName: string;
}

export interface User {
  rut: string;
  name: string;
}
