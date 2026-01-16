
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Stack, 
  Chip, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField
} from '@mui/material';
import { 
  AccessTimeRounded as AccessTimeRoundedIcon, 
  HistoryRounded as HistoryRoundedIcon,
  CalendarMonthRounded as CalendarMonthIcon
} from '@mui/icons-material';

import { VisitRecord } from '../types';
import { api } from '../api';

interface HistoryViewProps {
  history: VisitRecord[]; 
}

const HistoryView: React.FC<HistoryViewProps> = ({ history: localHistory }) => {
  const [dbHistory, setDbHistory] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getVisits(filterDate);
      setDbHistory(data);
    } catch (err) {
      setError("Error al obtener datos del servidor");
      setDbHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Se refresca el historial cuando cambia la fecha o se añade una visita desde el formulario
  useEffect(() => {
    fetchHistory();
  }, [filterDate, localHistory]);

  return (
    <Stack spacing={3}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 5, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2, 
          alignItems: 'center',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, width: '100%' }}>
          <CalendarMonthIcon color="primary" />
          <TextField 
            type="date" 
            label="Filtrar por Fecha" 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)} 
            fullWidth 
            InputLabelProps={{ shrink: true }}
            variant="standard"
            sx={{ 
              '& .MuiInput-root': { 
                fontSize: '1.1rem', 
                fontWeight: 700,
                py: 0.5
              } 
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, minWidth: 'max-content' }}>
          {dbHistory.length} registros encontrados
        </Typography>
      </Paper>

      {error && (
        <Alert severity="warning" variant="outlined" sx={{ borderRadius: 3, fontWeight: 600 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 5, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        {loading ? (
          <Box sx={{ p: 10, textAlign: 'center' }}>
            <CircularProgress size={40} thickness={4} />
            <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}>Consultando base de datos...</Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, py: 2, color: 'primary.main' }}>Hora</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Casa / Residente</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Visitante</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dbHistory.length > 0 ? dbHistory.map((record) => (
                <TableRow key={record.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeRoundedIcon fontSize="small" sx={{ color: 'secondary.light', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.dark' }}>
                      Casa {record.houseNumber}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {record.residentName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={record.type === 'visita' ? 'Visita' : 'Paquete'} 
                      size="small" 
                      variant="filled"
                      color={record.type === 'visita' ? 'primary' : 'warning'} 
                      sx={{ 
                        fontWeight: 900, 
                        fontSize: '0.6rem', 
                        height: 20, 
                        borderRadius: 1,
                        textTransform: 'uppercase'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary' }}>
                      {record.visitorName}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                      RUT: {record.visitorRut} {record.plate ? `| Patente: ${record.plate}` : ''}
                    </Typography>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 12 }}>
                    <HistoryRoundedIcon sx={{ fontSize: 48, color: 'divider', mb: 2 }} />
                    <Typography color="text.secondary" variant="h6" fontWeight={700}>Sin registros</Typography>
                    <Typography color="text.disabled" variant="body2">No hay movimientos registrados para el día seleccionado</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Stack>
  );
};

export default HistoryView;
