import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, 
  Typography, IconButton, Container, Avatar, Fade
} from '@mui/material';
import { LogoutRounded, AdminPanelSettings as AdminPanelSettingsIcon } from '@mui/icons-material';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { User, VisitRecord } from './types';
import { INITIAL_HISTORY } from './constants';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1e293b', light: '#334155', dark: '#0f172a' },
    secondary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h3: { fontWeight: 900, letterSpacing: '-0.04em' },
    h6: { fontWeight: 800, letterSpacing: '-0.02em' },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { padding: '10px 24px', boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }
      }
    }
  }
});

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<VisitRecord[]>([]);

  useEffect(() => {
    setHistory(INITIAL_HISTORY);
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