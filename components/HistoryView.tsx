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
  FormatListBulletedRounded as ListIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { VisitRecord } from '../types';
import { api } from '../api';

dayjs.extend(utc);
dayjs.extend(timezone);

const CHILE_TZ = 'America/Santiago';

interface HistoryViewProps {
  history: VisitRecord[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ history: localHistory }) => {
  const [dbHistory, setDbHistory] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          label="Consultar Fecha (Chile)"
          variant="standard"
          fullWidth
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Paper>

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
          {filteredRecords.map((record) => (
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

                      <Chip
                        label={record.type.toUpperCase()}
                        size="small"
                        sx={{ fontWeight: 800 }}
                      />

                      {/* Patente estilo premium */}
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
                            {record.plate.toUpperCase()}
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

                  {/* Visitante */}
                  <Grid item xs={12} sm={8}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonIcon fontSize="small" />
                      <Box>
                        <Typography fontWeight={700}>
                          {record.visitorName}
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                          <BadgeIcon sx={{ fontSize: 12 }} />
                          <Typography variant="caption">
                            {record.visitorRut}
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
          ))}

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