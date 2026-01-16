import React, { useState } from 'react';
import { 
  Box, TextField, Button, Typography, Paper, Container, 
  Alert, InputAdornment, Fade, Stack, CircularProgress,
  IconButton
} from '@mui/material';
import { 
  PersonOutline as PersonOutlineIcon, 
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { api } from '../api';

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
      bgcolor: '#0f172a', // Fondo oscuro moderno
      backgroundImage: 'radial-gradient(circle at 2px 2px, #1e293b 1px, transparent 0)',
      backgroundSize: '32px 32px'
    }}>
      <Container maxWidth="xs">
        <Fade in timeout={1000}>
          <Box>
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 900, 
                color: '#fff', 
                letterSpacing: '-2px',
                textShadow: '0 0 20px rgba(37, 99, 235, 0.5)'
              }}>
                GESINTVISIT PRO
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#94a3b8', mt: 1, fontWeight: 500 }}>
                Control de Acceso Profesional
              </Typography>
            </Box>

            <Paper sx={{ 
              p: 4, 
              borderRadius: 6, 
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField 
                    label="RUT del Conserje" 
                    placeholder="12.345.678-9"
                    fullWidth 
                    required 
                    autoFocus
                    disabled={loading}
                    value={rut} 
                    onChange={(e) => setRut(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': { color: '#fff' },
                      '& .MuiInputLabel-root': { color: '#64748b' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
                    }}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ color: '#3b82f6' }} /></InputAdornment> 
                    }} 
                  />
                  
                  <TextField 
                    label="Contraseña" 
                    type={showPassword ? 'text' : 'password'} 
                    fullWidth 
                    required 
                    disabled={loading}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': { color: '#fff' },
                      '& .MuiInputLabel-root': { color: '#64748b' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
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

                  {error && (
                    <Alert severity="error" variant="filled" sx={{ borderRadius: 3, bgcolor: '#ef4444' }}>
                      {error}
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large" 
                    fullWidth 
                    disabled={loading}
                    sx={{ 
                      py: 2, 
                      borderRadius: 4, 
                      fontWeight: 800, 
                      fontSize: '1rem',
                      bgcolor: '#2563eb',
                      '&:hover': { bgcolor: '#1d4ed8' },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar al Sistema'}
                  </Button>
                </Stack>
              </form>
            </Paper>
            
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, color: '#475569', fontWeight: 600 }}>
              SISTEMA PROTEGIDO POR GESINTVISIT PRO &copy; {new Date().getFullYear()}
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default LoginForm;