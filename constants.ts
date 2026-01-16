
import { House } from './types';

export const MOCK_HOUSES: House[] = [
  { id: '1', number: '101', residentName: 'Juan Pérez', phone: '+569 1234 5678' },
  { id: '2', number: '102', residentName: 'María González', phone: '+569 2233 4455' },
  { id: '3', number: '201', residentName: 'Carlos Soto', phone: '+569 9988 7766' },
  { id: '4', number: '202', residentName: 'Ana Silva', phone: '+569 5544 3322' },
  { id: '5', number: '305', residentName: 'Roberto Tapia', phone: '+569 1111 2222' },
  { id: '6', number: '404', residentName: 'Lucía Méndez', phone: '+569 3333 4444' },
];

export const INITIAL_HISTORY = [
  {
    id: 'h1',
    date: new Date().toISOString(),
    houseNumber: '101',
    residentName: 'Juan Pérez',
    type: 'visita' as const,
    visitorName: 'Esteban Dido',
    visitorRut: '12.345.678-9',
    plate: 'ABCD-12',
    conciergeName: 'Conserje Manuel'
  },
  {
    id: 'h2',
    date: new Date().toISOString(),
    houseNumber: '201',
    residentName: 'Carlos Soto',
    type: 'encomienda' as const,
    visitorName: 'Repartidor Uber',
    visitorRut: '20.111.222-3',
    conciergeName: 'Conserje Manuel'
  }
];
