
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
                
                <Typography variant="h3" sx={{ 
                  fontWeight: 900, 
                  color: '#fff', 
                  letterSpacing: '-2px',
                  textShadow: '0 0 30px rgba(37, 99, 235, 0.4)'
                }}>
                  GESINTVISIT PRO
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>
                Control de Acceso Profesional
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
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar al sistema'}
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
