
import React, { useState } from 'react';
import { 
  Box, TextField, Button, Typography, Paper, Container, 
  Alert, InputAdornment, Fade, Stack, CircularProgress,
  IconButton, keyframes
} from '@mui/material';
import { 
  PersonOutline as PersonOutlineIcon, 
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  LocalFlorist as FlowerIcon
} from '@mui/icons-material';
import { api } from '../api';

const float = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(10px, -15px) rotate(5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

const sway = keyframes`
  0% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
  100% { transform: rotate(-3deg); }
`;

const FlowerOrnament = ({ position }: { position: 'top-left' | 'bottom-right' }) => (
  <Box
    sx={{
      position: 'absolute',
      width: { xs: 200, md: 350 },
      height: { xs: 200, md: 350 },
      zIndex: 0,
      opacity: 0.4,
      pointerEvents: 'none',
      animation: `${sway} 8s ease-in-out infinite`,
      ...(position === 'top-left' ? { top: -50, left: -50 } : { bottom: -50, right: -50, transform: 'rotate(180deg)' }),
    }}
  >
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path fill="#3b82f6" d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.7,-31.3,87.1,-15.7,85.2,-0.7C83.2,14.2,75.9,28.5,67.6,41.9C59.3,55.4,50.1,68,37.6,75.2C25.1,82.4,9.2,84.2,-6.4,81.1C-22,78,-37.3,70.1,-49.6,59.3C-61.9,48.5,-71.2,34.8,-76.3,19.9C-81.4,5,-82.3,-11.1,-77.2,-25.6C-72.1,-40.1,-61,-53,-47.9,-60.5C-34.8,-68,-17.4,-70.1,-0.7,-68.9C16.1,-67.6,32.2,-63,44.7,-76.4Z" transform="translate(100 100)" opacity="0.1" />
      <g fill="none" stroke="#60a5fa" strokeWidth="1.5">
        <path d="M100,100 Q120,50 150,40 M100,100 Q80,50 50,40 M100,100 Q150,120 160,150 M100,100 Q50,120 40,150" opacity="0.5"/>
        <circle cx="150" cy="40" r="8" fill="#3b82f6" opacity="0.8"/>
        <circle cx="50" cy="40" r="8" fill="#3b82f6" opacity="0.8"/>
        <circle cx="160" cy="150" r="10" fill="#2563eb" opacity="0.8"/>
        <circle cx="40" cy="150" r="10" fill="#2563eb" opacity="0.8"/>
      </g>
    </svg>
  </Box>
);

interface LoginFormProps {
  onLogin: (rut: string, name: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!rut || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const user = await api.login(rut, password);
      onLogin(user.rut, user.name);
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#020617',
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <FlowerOrnament position="top-left" />
      <FlowerOrnament position="bottom-right" />
      
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: '50% 0 50% 0',
            bgcolor: '#3b82f6',
            opacity: 0.2,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `${float} ${5 + Math.random() * 5}s ease-in-out infinite`,
            pointerEvents: 'none'
          }}
        />
      ))}

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={1200}>
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
                <FlowerIcon sx={{ color: '#60a5fa', fontSize: 32, animation: `${sway} 4s infinite` }} />
                <Typography variant="h3" sx={{ 
                  fontWeight: 900, 
                  color: '#fff', 
                  letterSpacing: '-2px',
                  textShadow: '0 0 30px rgba(37, 99, 235, 0.4)'
                }}>
                  GESINTVISIT
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>
                SISTEMA PROFESIONAL DE ACCESO
              </Typography>
            </Box>

            <Paper sx={{ 
              p: 4, 
              borderRadius: 8, 
              bgcolor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              position: 'relative'
            }}>
              <form onSubmit={handleSubmit}>
                <Stack spacing={3.5}>
                  <TextField 
                    label="RUT del Conserje" 
                    placeholder="12.345.678-9"
                    fullWidth required autoFocus disabled={loading}
                    value={rut} onChange={(e) => setRut(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': { color: '#fff', borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)' },
                      '& .MuiInputLabel-root': { color: '#64748b' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(51, 65, 85, 0.5)' },
                      '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                    }}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ color: '#3b82f6' }} /></InputAdornment> 
                    }} 
                  />
                  <TextField 
                    label="Contraseña" 
                    type={showPassword ? 'text' : 'password'} 
                    fullWidth required disabled={loading}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': { color: '#fff', borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)' },
                      '& .MuiInputLabel-root': { color: '#64748b' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(51, 65, 85, 0.5)' },
                      '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                    }}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#3b82f6' }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#64748b' }}>
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }} 
                  />
                  {error && <Alert severity="error" variant="filled" sx={{ borderRadius: 4, bgcolor: '#ef4444' }}>{error}</Alert>}
                  <Button 
                    type="submit" variant="contained" size="large" fullWidth disabled={loading}
                    sx={{ 
                      py: 2.2, borderRadius: 4, fontWeight: 800, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: 1,
                      bgcolor: '#2563eb', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
                      '&:hover': { bgcolor: '#1d4ed8', transform: 'translateY(-2px)' }
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar al Jardín de Visitas'}
                  </Button>
                </Stack>
              </form>
            </Paper>
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, color: '#475569', fontWeight: 700 }}>
              GESINTVISIT PRO &copy; {new Date().getFullYear()}
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default LoginForm;
