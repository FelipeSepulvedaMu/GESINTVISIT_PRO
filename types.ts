export interface House {
  id: string;
  number: string;
  residentName: string;
  phone: string;
  phone2?: string | null;
  ownerEmail?: string | null;
}

export type VisitType = 'visita' | 'encomienda';

export interface VisitRecord {
  id: string;
  date: string; 
  houseNumber: string;
  residentName: string;

  residentPhone?: string;
  phone?: string;
  phone2?: string | null;

  type: VisitType;
  visitorName: string;
  visitorRut: string;
  plate?: string;
  conciergeName: string;

  residentConfirmed?: boolean;
  resident_confirmed?: boolean | null;

  exitTime?: string | null;
  exit_time?: string | null;
}

export interface User {
  rut: string;
  name: string;
  role?: 'admin' | 'conserje';
}