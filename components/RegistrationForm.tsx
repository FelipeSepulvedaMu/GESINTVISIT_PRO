
import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Typography, Paper, Autocomplete, 
  Stack, Divider, Snackbar, Alert, Grid, CircularProgress, Link
} from '@mui/material';

import { 
  LocalShippingRounded as LocalShippingRoundedIcon, 
  AccountCircleRounded as AccountCircleRoundedIcon,
  PhoneEnabledRounded as PhoneEnabledRoundedIcon
} from '@mui/icons-material';
import { User, VisitRecord, House, VisitType } from '../types';
import { api } from '../api';
import dayjs from 'dayjs';

interface RegistrationFormProps {
  user: User;
  onAddVisit: (visit: VisitRecord) => void;
  onGoToHistory: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ user, onAddVisit, onGoToHistory }) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [loadingHouses, setLoadingHouses] = useState(true);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [type, setType] = useState<VisitType>('visita');
  const [visitorName, setVisitorName] = useState('');
  const [visitorRut, setVisitorRut] = useState('');
  const [plate, setPlate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    api.getHouses()
      .then(setHouses)
      .finally(() => setLoadingHouses(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHouse || submitting) return;

    setSubmitting(true);
    try {
      // FIX: Enviamos la fecha local exacta como string ISO sin convertir a UTC
      const localDate = dayjs().format('YYYY-MM-DDTHH:mm:ss');

      const newVisit = await api.createVisit({
        date: localDate,
        houseNumber: selectedHouse.number,
        residentName: selectedHouse.residentName,
        type,
        visitorName,
        visitorRut,
        plate,
        conciergeName: user.name
      });

      onAddVisit(newVisit);
      setSnackbar({ open: true, message: '¡Visita registrada exitosamente!', severity: 'success' });
      
      // Limpiar formulario
      setVisitorName('');
      setVisitorRut('');
      setPlate('');
      setSelectedHouse(null);
    } catch (err: any) {
      console.error("Error en formulario:", err);
      setSnackbar({ 
        open: true, 
        message: err.message || 'Error al guardar el registro. Verifique la conexión.', 
        severity: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 3, fontWeight: 800 }}>
          Nueva Entrada
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box>
              <Autocomplete
                loading={loadingHouses}
                options={houses}
                getOptionLabel={(o) => `Casa ${o.number} - ${o.residentName}`}
                onChange={(_, v) => setSelectedHouse(v)}
                value={selectedHouse}
                renderInput={(params) => (
                  <TextField {...params} label="Destino (Casa / Residente)" required variant="outlined" />
                )}
              />
              
              {selectedHouse && (
                <Box sx={{ 
                  mt: 1.5, 
                  px: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 0.5 
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Residente: {selectedHouse.residentName}
                  </Typography>
                  {selectedHouse.phone && (
                    <Link 
                      href={`tel:${selectedHouse.phone.replace(/\s+/g, '')}`} 
                      underline="none"
                      sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        color: 'secondary.main',
                        fontWeight: 700,
                        fontSize: '1rem',
                        py: 0.5,
                        width: 'fit-content'
                      }}
                    >
                      <PhoneEnabledRoundedIcon sx={{ fontSize: 18 }} />
                      {selectedHouse.phone}
                    </Link>
                  )}
                </Box>
              )}
            </Box>

            <Divider sx={{ opacity: 0.6 }} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                fullWidth 
                variant={type === 'visita' ? 'contained' : 'outlined'} 
                onClick={() => setType('visita')} 
                startIcon={<AccountCircleRoundedIcon />}
                sx={{ borderRadius: 3 }}
              >Visita</Button>
              <Button 
                fullWidth 
                variant={type === 'encomienda' ? 'contained' : 'outlined'} 
                onClick={() => setType('encomienda')} 
                startIcon={<LocalShippingRoundedIcon />} 
                color="secondary"
                sx={{ borderRadius: 3 }}
              >Paquete</Button>
            </Box>

            <TextField 
              label="Nombre del Visitante / Repartidor" 
              required 
              fullWidth 
              value={visitorName} 
              onChange={(e) => setVisitorName(e.target.value)} 
            />
            
            <Grid container spacing={2}>
              <Grid item xs={7}>
                <TextField 
                  label="RUT" 
                  required 
                  fullWidth 
                  placeholder="12.345.678-9"
                  value={visitorRut} 
                  onChange={(e) => setVisitorRut(e.target.value)} 
                />
              </Grid>
              <Grid item xs={5}>
                <TextField 
                  label="Patente" 
                  fullWidth 
                  value={plate} 
                  onChange={(e) => setPlate(e.target.value.toUpperCase())} 
                  placeholder="Opcional"
                />
              </Grid>
            </Grid>

            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              disabled={!selectedHouse || submitting}
              sx={{ py: 1.8, borderRadius: 3, fontWeight: 800, fontSize: '1rem' }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirmar Ingreso'}
            </Button>
          </Stack>
        </form>
      </Paper>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegistrationForm;
