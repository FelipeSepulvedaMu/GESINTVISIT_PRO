import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Typography, Paper, Autocomplete, 
  Stack, Divider, Snackbar, Alert, CircularProgress,
  InputAdornment
} from '@mui/material';

import { 
  LocalShippingRounded as LocalShippingRoundedIcon, 
  AccountCircleRounded as AccountCircleRoundedIcon,
  PhoneEnabledRounded as PhoneEnabledRoundedIcon,
  BadgeRounded as BadgeIcon,
  DirectionsCarFilledRounded as CarIcon,
  PersonRounded as PersonIcon,
  MeetingRoomRounded as MeetingRoomIcon,
  DeliveryDiningRounded as DeliveryIcon // Nuevo icono para Delivery
} from '@mui/icons-material';
import { User, VisitRecord, House, VisitType } from '../types';
import { api } from '../api';

// Nota: Si usas TypeScript estricto, asegúrate de que VisitType 
// en '../types' incluya | 'delivery'
interface RegistrationFormProps {
  user: User;
  onAddVisit: (visit: VisitRecord) => void;
  onGoToHistory: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ user, onAddVisit, onGoToHistory }) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [loadingHouses, setLoadingHouses] = useState(true);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [type, setType] = useState<VisitType | 'delivery'>('visita'); // Permitimos delivery localmente
  const [visitorName, setVisitorName] = useState('');
  const [visitorRut, setVisitorRut] = useState('');
  const [plate, setPlate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false, message: '', severity: 'success'
  });

  useEffect(() => {
    api.getHouses()
      .then(setHouses)
      .catch(() => setHouses([]))
      .finally(() => setLoadingHouses(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHouse || submitting) return;
    setSubmitting(true);
    try {
      const newVisit = await api.createVisit({
        date: new Date().toISOString(),
        houseNumber: selectedHouse.number,
        residentName: selectedHouse.residentName,
        type: type as VisitType, // Lo enviamos al API
        visitorName, visitorRut, plate, conciergeName: user.name
      });
      onAddVisit(newVisit);
      setSnackbar({ open: true, message: '¡Ingreso registrado exitosamente!', severity: 'success' });
      setVisitorName(''); setVisitorRut(''); setPlate(''); setSelectedHouse(null);
    } catch (err: any) {
      // Si el backend falla por el tipo 'delivery', aquí lo sabremos
      setSnackbar({ 
        open: true, 
        message: err.message || 'Error al guardar. Puede que el sistema no soporte "Delivery" aún.', 
        severity: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const inputStyle = {
    width: '100%',
    '& .MuiOutlinedInput-root': { borderRadius: 3, height: 56 }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <MeetingRoomIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Nuevo Ingreso</Typography>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            
            {/* 1. DESTINO */}
            <Autocomplete
              loading={loadingHouses}
              options={houses}
              getOptionLabel={(o) => `Casa ${o.number} - ${o.residentName}`}
              onChange={(_, v) => setSelectedHouse(v)}
              value={selectedHouse}
              renderInput={(params) => (
                <TextField {...params} label="Destino (Casa)" required variant="outlined" sx={inputStyle} />
              )}
            />
            
            {selectedHouse && (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#f8f9fa', borderStyle: 'dashed', borderColor: 'primary.light' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>RESIDENTE</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedHouse.residentName}</Typography>
                  {selectedHouse.phone && (
                    <Button
                      href={`tel:${selectedHouse.phone.replace(/\s+/g, '')}`}
                      variant="contained" size="small" color="success"
                      startIcon={<PhoneEnabledRoundedIcon />}
                      sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 'none' }}
                    > Llamar </Button>
                  )}
                </Stack>
              </Paper>
            )}

            <Divider>
              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700 }}>TIPO DE INGRESO</Typography>
            </Divider>

            {/* 2. BOTONES TRIPLE OPCIÓN - ALINEACIÓN PERFECTA */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%' }}>
              <Button 
                fullWidth 
                variant={type === 'visita' ? 'contained' : 'outlined'} 
                onClick={() => setType('visita')} 
                sx={{ borderRadius: 3, height: 48, textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }}
                startIcon={<PersonIcon />}
              >Visita</Button>
              <Button 
                fullWidth 
                variant={type === 'encomienda' ? 'contained' : 'outlined'} 
                onClick={() => setType('encomienda')} 
                color="secondary"
                sx={{ borderRadius: 3, height: 48, textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }}
                startIcon={<LocalShippingRoundedIcon />}
              >Paquete</Button>
              <Button 
                fullWidth 
                variant={type === 'delivery' ? 'contained' : 'outlined'} 
                onClick={() => setType('delivery')} 
                color="warning" // Color diferente para diferenciarlo
                sx={{ borderRadius: 3, height: 48, textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }}
                startIcon={<DeliveryIcon />}
              >Delivery</Button>
            </Stack>

            {/* 3. NOMBRE VISITANTE */}
            <TextField 
              label="Nombre del Visitante / Repartidor" required fullWidth 
              value={visitorName} onChange={(e) => setVisitorName(e.target.value)} 
              sx={inputStyle}
              InputProps={{
                startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>,
              }}
            />
            
            {/* 4. RUT Y PATENTE */}
            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <Box sx={{ flex: 7 }}>
                <TextField 
                  label="RUT" required fullWidth 
                  value={visitorRut} onChange={(e) => setVisitorRut(e.target.value)} 
                  sx={inputStyle}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><BadgeIcon color="action" /></InputAdornment>,
                  }}
                />
              </Box>
              <Box sx={{ flex: 5 }}>
                <TextField 
                  label="Patente" fullWidth 
                  value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} 
                  sx={inputStyle}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><CarIcon color="action" /></InputAdornment>,
                  }}
                />
              </Box>
            </Stack>

            <Box sx={{ pt: 2 }}>
              <Button 
                type="submit" fullWidth variant="contained" size="large" 
                disabled={!selectedHouse || submitting}
                sx={{ 
                  py: 2, borderRadius: 3, fontWeight: 900, fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirmar Ingreso'}
              </Button>
            </Box>

          </Stack>
        </form>
      </Paper>

      <Snackbar 
        open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegistrationForm;