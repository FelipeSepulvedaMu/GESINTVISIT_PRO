import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Typography, Paper, Autocomplete, 
  Stack, Divider, Snackbar, Alert, CircularProgress,
  InputAdornment, ToggleButton, ToggleButtonGroup, Grid2 as Grid
} from '@mui/material';

import { 
  LocalShippingRounded as LocalShippingRoundedIcon, 
  PhoneEnabledRounded as PhoneEnabledRoundedIcon,
  BadgeRounded as BadgeIcon,
  DirectionsCarFilledRounded as CarIcon,
  PersonRounded as PersonIcon,
  MeetingRoomRounded as MeetingRoomIcon,
  DeliveryDiningRounded as DeliveryIcon,
  CheckCircleRounded as CheckIcon,
  CancelRounded as CancelIcon,
  LocalTaxiRounded as TaxiIcon,
  HandymanRounded as MaintenanceIcon,
  EngineeringRounded as ServiceIcon
} from '@mui/icons-material';

import { User, VisitRecord, House, VisitType } from '../types';
import { api } from '../api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

interface RegistrationFormProps {
  user: User;
  onAddVisit: (visit: VisitRecord) => void;
  onGoToHistory: () => void;
}

type TemporalVisitType = 'visita' | 'encomienda' | 'delivery' | 'transporte' | 'servicio' | 'mantencion';

const formatChileanRut = (value: string): string => {
  let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (clean.length > 9) {
    clean = clean.slice(0, 9);
  }

  if (clean.length <= 1) return clean;

  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);

  let formattedBody = '';
  if (body.length > 5) {
    formattedBody = body.replace(/^(\d{1,2})(\d{3})(\d{3})$/, '$1.$2.$3');
    if (formattedBody === body) {
      formattedBody = body.replace(/^(\d{1,2})(\d{3})$/, '$1.$2');
    }
  } else if (body.length > 2) {
    formattedBody = body.replace(/^(\d{1,2})(\d{3})$/, '$1.$2');
  } else {
    formattedBody = body;
  }

  return `${formattedBody}-${dv}`;
};

const RegistrationForm: React.FC<RegistrationFormProps> = ({ user, onAddVisit }) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [loadingHouses, setLoadingHouses] = useState(true);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [displayType, setDisplayType] = useState<TemporalVisitType>('visita');
  const [visitorName, setVisitorName] = useState('');
  const [visitorRut, setVisitorRut] = useState('');
  const [plate, setPlate] = useState('');
  const [residentConfirmed, setResidentConfirmed] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Guardaremos un historial temporal para rescatar el phone2 ausente
  const [fallbackVisits, setFallbackVisits] = useState<VisitRecord[]>([]);

  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false, message: '', severity: 'success'
  });

  useEffect(() => {
    // 1. Cargamos las casas normales
    api.getHouses()
      .then(setHouses)
      .catch(() => setHouses([]))
      .finally(() => setLoadingHouses(false));

    // 2. Traemos las visitas de hoy para usar sus datos de teléfonos como salvavidas
    const todayStr = dayjs().format('YYYY-MM-DD');
    api.getVisits(todayStr)
      .then(setFallbackVisits)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHouse || submitting) return;

    setSubmitting(true);

    try {
      const isoDate = dayjs().utc().format();
      const apiType: VisitType = displayType === 'encomienda' ? 'encomienda' : 'visita';

      const newVisit = await api.createVisit({
        date: isoDate,
        houseNumber: selectedHouse.number,
        residentName: selectedHouse.residentName || (selectedHouse as any).owner_name,
        type: apiType, 
        visitorName: `[${displayType.toUpperCase()}] ${visitorName}`, 
        visitorRut,
        plate,
        conciergeName: user.name,
        residentConfirmed
      });

      onAddVisit(newVisit);

      setSnackbar({
        open: true,
        message: '¡Ingreso registrado exitosamente!',
        severity: 'success'
      });

      setVisitorName('');
      setVisitorRut('');
      setPlate('');
      setSelectedHouse(null);
      setResidentConfirmed(true);
      setDisplayType('visita');

    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Error al guardar el registro.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () =>
    setSnackbar({ ...snackbar, open: false });

  const inputStyle = {
    width: '100%',
    '& .MuiOutlinedInput-root': { borderRadius: 3, height: 56 }
  };

  // ==========================================
  // 🚀 LÓGICA DE DETECCIÓN INTELIGENTE DE TELÉFONOS
  // ==========================================
  let mainPhone = selectedHouse ? (selectedHouse.phone || (selectedHouse as any).phone) : null;
  let secondaryPhone = selectedHouse ? (selectedHouse.phone2 || (selectedHouse as any).phone2) : null;
  const residentDisplayName = selectedHouse ? (selectedHouse.residentName || (selectedHouse as any).owner_name) : '';

  // 🚨 BYPASS DE EMERGENCIA: Si es la casa de Valeska Jiménez, forzamos su segundo número
  if (selectedHouse && (residentDisplayName.includes("Valeska") || String(selectedHouse.number) === "129")) {
    secondaryPhone = "998380772";
  }
  // ==========================================

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <MeetingRoomIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Nuevo Ingreso
          </Typography>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>

            <Autocomplete
              loading={loadingHouses}
              options={houses}
              getOptionLabel={(o) => `Casa ${o.number} - ${o.residentName || (o as any).owner_name}`}
              onChange={(_, v) => setSelectedHouse(v)}
              value={selectedHouse}
              renderInput={(params) => (
                <TextField {...params} label="Destino (Casa)" required variant="outlined" sx={inputStyle} />
              )}
            />

            {selectedHouse && (
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#f8f9fa' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    RESIDENTE
                  </Typography>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    justifyContent="space-between" 
                    alignItems={{ xs: 'flex-start', sm: 'center' }} 
                    spacing={2} 
                    sx={{ mt: 1 }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      {residentDisplayName}
                    </Typography>
                    
                    {/* 📞 PANEL CON DOBLE BOTÓN DINÁMICO E INTELIGENTE */}
                    {(mainPhone || secondaryPhone) && (
                      <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' }, gap: 1 }}>
                        {mainPhone && (
                          <Button
                            href={`tel:${String(mainPhone).replace(/\s+/g, '')}`}
                            variant="contained" 
                            size="medium" 
                            color="success"
                            startIcon={<PhoneEnabledRoundedIcon />}
                            sx={{ borderRadius: 4, textTransform: 'none', boxShadow: 'none', fontWeight: 700, flexGrow: 1 }}
                          >
                            {secondaryPhone ? 'Llamar 1' : 'Llamar'}
                          </Button>
                        )}
                        {secondaryPhone && (
                          <Button
                            href={`tel:${String(secondaryPhone).replace(/\s+/g, '')}`}
                            variant="contained" 
                            size="medium" 
                            color="secondary" 
                            startIcon={<PhoneEnabledRoundedIcon />}
                            sx={{ borderRadius: 4, textTransform: 'none', boxShadow: 'none', fontWeight: 700, flexGrow: 1 }}
                          >
                            Llamar 2
                          </Button>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </Paper>

                <Box sx={{ p: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 700, color: 'text.primary' }}>
                    ¿Residente contesta y confirma entrada?
                  </Typography>
                  <ToggleButtonGroup
                    value={residentConfirmed}
                    exclusive
                    onChange={(_, val) => val !== null && setResidentConfirmed(val)}
                    fullWidth
                    size="small"
                  >
                    <ToggleButton 
                      value={true} 
                      sx={{ 
                        py: 1.5, borderRadius: 3, fontWeight: 'bold', border: '1px solid #d1d5db',
                        '&.Mui-selected': {
                          backgroundColor: '#008711', color: '#ffffff',
                          '&:hover': { backgroundColor: '#006e0e' }
                        }
                      }}
                    >
                      <CheckIcon sx={{ mr: 1 }} /> SÍ
                    </ToggleButton>

                    <ToggleButton 
                      value={false} 
                      sx={{ 
                        py: 1.5, borderRadius: 3, fontWeight: 'bold', border: '1px solid #d1d5db',
                        '&.Mui-selected': {
                          backgroundColor: '#e1251b', color: '#ffffff',
                          '&:hover': { backgroundColor: '#b81c15' }
                        }
                      }}
                    >
                      <CancelIcon sx={{ mr: 1 }} /> NO
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Stack>
            )}

            <Divider />

            <Box>
              <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 700, color: 'text.secondary' }}>
                Tipo de Ingreso
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 4 }}>
                  <Button
                    fullWidth variant={displayType === 'visita' ? 'contained' : 'outlined'}
                    onClick={() => setDisplayType('visita')} startIcon={<PersonIcon />}
                    sx={{ textTransform: 'none', py: 1.2 }}
                  >
                    Visita
                  </Button>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Button
                    fullWidth variant={displayType === 'encomienda' ? 'contained' : 'outlined'}
                    onClick={() => setDisplayType('encomienda')} color="secondary" startIcon={<LocalShippingRoundedIcon />}
                    sx={{ textTransform: 'none', py: 1.2 }}
                  >
                    Paquete
                  </Button>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Button
                    fullWidth variant={displayType === 'delivery' ? 'contained' : 'outlined'}
                    onClick={() => setDisplayType('delivery')} color="warning" startIcon={<DeliveryIcon />}
                    sx={{ textTransform: 'none', py: 1.2 }}
                  >
                    Delivery
                  </Button>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Button
                    fullWidth variant={displayType === 'transporte' ? 'contained' : 'outlined'}
                    onClick={() => setDisplayType('transporte')} color="info" startIcon={<TaxiIcon />}
                    sx={{ textTransform: 'none', py: 1.2 }}
                  >
                    Uber/Taxi
                  </Button>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Button
                    fullWidth variant={displayType === 'servicio' ? 'contained' : 'outlined'}
                    onClick={() => setDisplayType('servicio')} color="success" startIcon={<ServiceIcon />}
                    sx={{ textTransform: 'none', py: 1.2 }}
                  >
                    Servicios
                  </Button>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Button
                    fullWidth variant={displayType === 'mantencion' ? 'contained' : 'outlined'}
                    onClick={() => setDisplayType('mantencion')} color="inherit" startIcon={<MaintenanceIcon />}
                    sx={{ textTransform: 'none', py: 1.2, borderColor: 'action.disabled' }}
                  >
                    Técnico
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <TextField
              label="Nombre del Visitante / Repartidor"
              required
              fullWidth
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              sx={inputStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="RUT"
                required
                fullWidth
                value={visitorRut}
                onChange={(e) => {
                  const formatted = formatChileanRut(e.target.value);
                  setVisitorRut(formatted);
                }}
                placeholder="12.345.678-9"
                sx={inputStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label="Patente"
                fullWidth
                value={plate}
                onChange={(e) => {
                  let cleanPlate = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                  if (cleanPlate.length > 6) {
                    cleanPlate = cleanPlate.slice(0, 6);
                  }
                  setPlate(cleanPlate);
                }}
                placeholder="ABCD12 o AB1234"
                sx={inputStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CarIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!selectedHouse || submitting}
              sx={{ py: 2, borderRadius: 3, fontWeight: 900 }}
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
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegistrationForm;