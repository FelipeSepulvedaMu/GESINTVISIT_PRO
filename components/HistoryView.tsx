import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  CircularProgress,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  CalendarMonthRounded as CalendarMonthIcon,
  ExitToAppRounded as ExitIcon,
  HomeRounded as HomeIcon,
  PersonRounded as PersonIcon,
  BadgeRounded as BadgeIcon,
  FormatListBulletedRounded as ListIcon,
  GppBadRounded as SecurityIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { VisitRecord, User } from '../types';
import { api } from '../api';

dayjs.extend(utc);
dayjs.extend(timezone);

const CHILE_TZ = 'America/Santiago';

interface HistoryViewProps {
  history: VisitRecord[];
  user: User; // 🚀 Inyectamos el usuario actual para evaluar sus permisos de rol
}

// 🚀 FUNCIONES DE ENMASCARAMIENTO PARA LEY DE PROTECCIÓN DE DATOS
const maskRut = (rut: string): string => {
  if (!rut) return '';
  const clean = rut.trim();
  if (clean.length < 5) return clean;
  return clean.substring(0, 6) + '.xxx-x';
};

const maskPlate = (plate: string): string => {
  if (!plate) return '';
  const clean = plate.trim().replace(/[-\s]/g, '');
  if (clean.length < 4) return plate;
  return clean.substring(0, 2) + 'XX-XX';
};

const HistoryView: React.FC<HistoryViewProps> = ({ history: localHistory, user }) => {
  console.log("Usuario actual en el Historial:", user);
  const [dbHistory, setDbHistory] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [securityAlert, setSecurityAlert] = useState<string | null>(null); // 🚀 Estado para la alerta legal
  const [processingId, setProcessingId] = useState<string | null>(null);

  const getTodayChile = () => dayjs().tz(CHILE_TZ).format('YYYY-MM-DD');
  const [filterDate, setFilterDate] = useState(getTodayChile());
  const [tabValue, setTabValue] = useState(0);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getVisits(filterDate);
      setDbHistory(data);
    } catch {
      setError('Error al obtener datos del servidor');
      setDbHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterDate, localHistory]);

  // 🚀 VALIDACIÓN EN EL CAMBIO DE FECHA (LIMITACIÓN 48 HORAS CON EXCEPCIÓN ADMIN)
  const handleDateChange = (selectedDateStr: string) => {
    setSecurityAlert(null); // Reseteamos alertas previas

    const selected = dayjs(selectedDateStr).startOf('day');
    const today = dayjs().tz(CHILE_TZ).startOf('day');
    
    const daysDifference = today.diff(selected, 'day');

    // 🔐 FILTRO PRIVILEGIADO: Si NO es administrador y busca más de 2 días atrás o fechas futuras
    if (user?.role !== 'admin' && (daysDifference > 2 || daysDifference < 0)) {
      setSecurityAlert(
        'Acceso denegado: Por motivos de seguridad y en conformidad a la Ley de Protección de Datos, el rol de conserjería solo puede auditar las últimas 48 horas. Solicite acceso al Administrador si requiere revisar históricos extendidos.'
      );
      return; // Bloquea el cambio de estado de la fecha
    }

    // Si pasa la validación (o si es Administrador), se actualiza la fecha normalmente
    setFilterDate(selectedDateStr);
  };

  const handleMarkExit = async (id: string) => {
    setProcessingId(id);
    try {
      await api.markExit(id);
      setDbHistory(prev =>
        prev.map(v =>
          v.id === id
            ? { ...v, exitTime: dayjs().toISOString() }
            : v
        )
      );
    } catch (err) {
      console.error('Error al marcar salida:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const { filteredRecords, counts } = useMemo(() => {
    const recordsOfDay = dbHistory.filter(record => {
      const recordDate = dayjs.utc(record.date).tz(CHILE_TZ).format('YYYY-MM-DD');
      return recordDate === filterDate;
    });

    const inRecinto = recordsOfDay.filter(r =>
      r.plate && r.plate.trim() !== '' && !r.exitTime
    ).length;

    const display =
      tabValue === 1
        ? recordsOfDay.filter(r =>
            r.plate && r.plate.trim() !== '' && !r.exitTime
          )
        : recordsOfDay;

    return {
      filteredRecords: display,
      counts: {
        total: recordsOfDay.length,
        inRecinto
      }
    };
  }, [dbHistory, filterDate, tabValue]);

  return (
    <Stack spacing={3}>
      {/* Filtro fecha */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <CalendarMonthIcon color="primary" />
        <TextField
          type="date"
          label={user?.role === 'admin' ? "Consultar Fecha (Modo Administrador)" : "Consultar Fecha (Chile)"}
          variant="standard"
          fullWidth
          value={filterDate}
          onChange={(e) => handleDateChange(e.target.value)} // 🚀 Apunta a la validación con bypass de Admin
          InputLabelProps={{ shrink: true }}
        />
      </Paper>

      {/* 🚀 Alerta de Restricción Legal de Datos */}
      {securityAlert && (
        <Alert 
          severity="error" 
          variant="filled" 
          icon={<SecurityIcon />}
          sx={{ borderRadius: 3, fontWeight: 700 }}
          onClose={() => setSecurityAlert(null)}
        >
          {securityAlert}
        </Alert>
      )}

      {error && (
        <Alert severity="warning" variant="outlined">
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} centered>
          <Tab
            label={`TODOS (${counts.total})`}
            icon={<ListIcon />}
            iconPosition="start"
          />
          <Tab
            label={`EN RECINTO (${counts.inRecinto})`}
            icon={<ListIcon />}
            iconPosition="start"
            sx={{
              color: counts.inRecinto > 0 ? 'error.main' : 'inherit'
            }}
          />
        </Tabs>
      </Box>

      {/* Listado */}
      {loading ? (
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {filteredRecords.map((record) => {
            // 🕵️‍♂️ LÓGICA DE EXTRACCIÓN Y NORMALIZACIÓN DE LAS 6 CATEGORÍAS
            let rawTag = record.type ? record.type.toUpperCase() : 'VISITA';
            let cleanVisitorName = record.visitorName || '';

            // Extraemos el corchete de la base de datos si existe
            if (cleanVisitorName.startsWith('[')) {
              const match = cleanVisitorName.match(/^\[(.*?)\]\s*(.*)$/);
              if (match) {
                rawTag = match[1].toUpperCase();
                cleanVisitorName = match[2]; // Deja el nombre limpio
              }
            }

            // 🎯 FORZAMOS A QUE RECONOZCA EXACTAMENTE TUS 6 TIPOS OFICIALES
            let displayType = 'VISITA';
            let chipColor: 'default' | 'warning' | 'secondary' | 'info' | 'success' = 'default';

            if (rawTag.includes('PAQUETE') || rawTag.includes('ENCOMIENDA')) {
              displayType = 'PAQUETE';
              chipColor = 'warning'; // Naranja
            } else if (rawTag.includes('DELIVERY')) {
              displayType = 'DELIVERY';
              chipColor = 'warning'; // Naranja
            } else if (rawTag.includes('UBER') || rawTag.includes('TAXI') || rawTag.includes('TRANSPORTE')) {
              displayType = 'UBER/TAXI';
              chipColor = 'secondary'; // Morado / Azul
            } else if (rawTag.includes('SERVICIOS')) {
              displayType = 'SERVICIOS';
              chipColor = 'info'; // Celeste
            } else if (rawTag.includes('TECNICO') || rawTag.includes('TÉCNICO')) {
              displayType = 'TECNICO';
              chipColor = 'success'; // Verde
            } else {
              displayType = 'VISITA';
              chipColor = 'default'; // Gris
            }

            return (
              <Paper
                key={record.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    {/* Hora + Indicadores E/S */}
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        {/* Entrada */}
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              bgcolor: 'success.main',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', fontWeight: 900, fontSize: '0.65rem' }}
                            >
                              E
                            </Typography>
                          </Box>
                          <Typography fontWeight={800}>
                            {dayjs.utc(record.date).tz(CHILE_TZ).format('HH:mm')}
                          </Typography>
                        </Stack>

                        {/* Salida */}
                        {record.exitTime && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                bgcolor: 'error.main',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: 'white', fontWeight: 900, fontSize: '0.65rem' }}
                              >
                                S
                              </Typography>
                            </Box>
                            <Typography fontWeight={800} color="text.secondary">
                              {dayjs.utc(record.exitTime).tz(CHILE_TZ).format('HH:mm')}
                            </Typography>
                          </Stack>
                        )}

                        {/* 🚀 CALUGA OFICIAL Y HOMOLOGADA */}
                        <Chip
                          label={displayType}
                          size="small"
                          color={chipColor}
                          sx={{ fontWeight: 800 }}
                        />

                        {/* Patente estilo premium - 🚀 Enmascarada */}
                        {record.plate && (
                          <Box
                            sx={{
                              height: 24,
                              bgcolor: 'grey.200',
                              px: 1.5,
                              borderRadius: '4px',
                              border: '1px solid',
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 900,
                                fontFamily: 'monospace',
                                fontSize: '0.8rem'
                              }}
                            >
                              {maskPlate(record.plate)}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Grid>

                    {/* Casa */}
                    <Grid item xs={12} sm={4}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <HomeIcon fontSize="small" />
                        <Box>
                          <Typography fontWeight={800}>
                            Casa {record.houseNumber}
                          </Typography>
                          <Typography variant="caption">
                            {record.residentName}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Visitante - 🚀 Nombre limpio y RUT Enmascarado */}
                    <Grid item xs={12} sm={8}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon fontSize="small" />
                        <Box>
                          <Typography fontWeight={700}>
                            {cleanVisitorName}
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            <BadgeIcon sx={{ fontSize: 12 }} />
                            <Typography variant="caption">
                              {maskRut(record.visitorRut)}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>

                  {!record.exitTime && record.plate && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleMarkExit(record.id)}
                      disabled={processingId === record.id}
                      startIcon={
                        processingId === record.id
                          ? <CircularProgress size={14} color="inherit" />
                          : <ExitIcon />
                      }
                      sx={{ borderRadius: 2, fontWeight: 800 }}
                    >
                      MARCAR SALIDA
                    </Button>
                  )}
                </Stack>
              </Paper>
            );
          })}

          {filteredRecords.length === 0 && (
            <Box sx={{ py: 8, textAlign: 'center', opacity: 0.5 }}>
              <Typography>No hay registros para mostrar</Typography>
            </Box>
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default HistoryView;