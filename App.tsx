import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Typography, IconButton, Container, Avatar, Fade } from '@mui/material';
import { LogoutRounded, AdminPanelSettings as AdminPanelSettingsIcon } from '@mui/icons-material';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { User, VisitRecord } from './types';
import { api } from './api'; // IMPORTANTE: usamos el API real
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const theme = createTheme({ /* ...tu theme actual... */ });

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<VisitRecord[]>([]);

  // FETCH de visitas reales desde el backend
  const fetchHistory = async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const data = await api.getVisits(today);

      // Convertimos la fecha a Chile
      const chileHistory = data.map(v => ({
        ...v,
        date: dayjs(v.date).tz('America/Santiago').format()
      }));

      setHistory(chileHistory);
    } catch (err) {
      console.error('Error al obtener visitas del backend', err);
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleLogin = (rut: string, name: string) => setUser({ rut, name });
  const handleLogout = () => setUser(null);
  const addVisit = (visit: VisitRecord) => setHistory(prev => [visit, ...prev]);

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginForm onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', color: 'primary.main', borderBottom: '1px solid #e2e8f0' }}>
          <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 'sm', mx: 'auto', width: '100%', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                <AdminPanelSettingsIcon sx={{ fontSize: 18, color: '#fff' }} />
              </Avatar>
              <Typography variant="h6" color="primary">GESINTVISIT PRO</Typography>
            </Box>
            <IconButton onClick={handleLogout} color="inherit" size="small">
              <LogoutRounded fontSize="small" />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="sm" sx={{ py: 4, flexGrow: 1 }}>
          <Fade in timeout={500}>
            <Box>
              <Dashboard user={user} history={history} onAddVisit={addVisit} />
            </Box>
          </Fade>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
