import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Paper, Stack, 
  Chip, CircularProgress, TextField, Button, Grid,
  Tabs, Tab
} from '@mui/material';
import { 
  CalendarMonthRounded as CalendarMonthIcon,
  ExitToAppRounded as ExitIcon,
  HomeRounded as HomeIcon,
  PersonRounded as PersonIcon,
  BadgeRounded as BadgeIcon,
  LocalParkingRounded as ParkingIcon,
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
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const getTodayChile = () => dayjs().tz(CHILE_TZ).format('YYYY-MM-DD');
  const [filterDate, setFilterDate] = useState(getTodayChile());
  const [tabValue, setTabValue] = useState(0);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getVisits(filterDate);
      setDbHistory(data);
    } catch (err) {
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
      setDbHistory(prev => prev.map(visit => 
        visit.id === id 
          ? { ...visit, exitTime: dayjs().toISOString() } 
          : visit
      ));
    } catch (err) {
      console.error("Error al marcar salida:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const { filteredRecords, counts } = useMemo(() => {
    const recordsOfTheDay = dbHistory.filter(record => {
      const recordDate = dayjs(record.date).tz(CHILE_TZ).format('YYYY-MM-DD');
      return recordDate === filterDate;
    });

    const inRecintoCount = recordsOfTheDay.filter(r => 
      r.plate && r.plate.trim() !== '' && !r.exitTime
    ).length;

    const displayRecords = tabValue === 1 
      ? recordsOfTheDay.filter(r => r.plate && r.plate.trim() !== '' && !r.exitTime)
      : recordsOfTheDay;

    return {
      filteredRecords: displayRecords,
      counts: {
        total: recordsOfTheDay.length,
        inRecinto: inRecintoCount
      }
    };
  }, [dbHistory, filterDate, tabValue]);

  return (
    <Stack spacing={3}>
      {/* FILTRO DE FECHA - LARGO TOTAL (Grid 12) */}
      <Box sx={{ width: '100%' }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            borderRadius: 4, 
            border: '1px solid', 
            borderColor: 'divider',
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            bgcolor: 'background.paper'
          }}
        >
          <CalendarMonthIcon color="primary" />
          <TextField 
            type="date" 
            label="Consultar Fecha"
            variant="standard" 
            fullWidth
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)} 
            InputLabelProps={{ shrink: true }}
            InputProps={{ disableUnderline: true }}
            sx={{ 
              '& .MuiInputBase-root': { fontSize: '1rem', fontWeight: 500 }
            }}
          />
        </Paper>
      </Box>

      {/* PESTAÑAS CENTRADAS */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, val) => setTabValue(val)} 
          centered
          sx={{ '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' } }}
        >
          <Tab 
            label={`TODOS (${counts.total})`} 
            icon={<ListIcon />} iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600, minWidth: { xs: 120, sm: 160 } }}
          />
          <Tab 
            label={`EN RECINTO (${counts.inRecinto})`} 
            icon={<ListIcon />} iconPosition="start"
            sx={{ 
              textTransform: 'none', fontWeight: 600, minWidth: { xs: 120, sm: 160 },
              color: counts.inRecinto > 0 ? 'error.main' : 'inherit'
            }}
          />
        </Tabs>
      </Box>

      {/* LISTADO DE REGISTROS */}
      {loading ? (
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      ) : (
        <Stack spacing={2}>
          {filteredRecords.map((record) => (
            <Paper key={record.id} elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 20, height: 20, bgcolor: 'success.main', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 900, fontSize: '0.65rem' }}>E</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {dayjs(record.date).tz(CHILE_TZ).format('HH:mm')}
                        </Typography>
                      </Stack>

                      {record.exitTime && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 20, height: 20, bgcolor: 'error.main', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 900, fontSize: '0.65rem' }}>S</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                            {dayjs(record.exitTime).tz(CHILE_TZ).format('HH:mm')}
                          </Typography>
                        </Stack>
                      )}

                      <Chip label={record.type.toUpperCase()} size="small" sx={{ fontWeight: 800, fontSize: '0.6rem', height: 20, borderRadius: '4px' }} />

                      {record.plate && (
                        <Box sx={{ height: 20, bgcolor: 'grey.200', px: 1, borderRadius: '4px', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'grey.900', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {record.plate.toUpperCase()}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <HomeIcon sx={{ fontSize: 18, color: 'action.active' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>Casa {record.houseNumber}</Typography>
                        <Typography variant="caption" color="text.secondary">{record.residentName}</Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <PersonIcon sx={{ fontSize: 18, color: 'action.active' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{record.visitorName}</Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <BadgeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">{record.visitorRut}</Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                {!record.exitTime && record.plate && (
                  <Button
                    fullWidth variant="contained" color="error" size="small"
                    onClick={() => handleMarkExit(record.id)}
                    disabled={processingId === record.id}
                    startIcon={processingId === record.id ? <CircularProgress size={14} color="inherit" /> : <ExitIcon />}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, py: 1 }}
                  >
                    MARCAR SALIDA
                  </Button>
                )}
              </Stack>
            </Paper>
          ))}
          
          {filteredRecords.length === 0 && (
            <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
              <Typography variant="body1">No hay registros para mostrar</Typography>
            </Box>
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default HistoryView;