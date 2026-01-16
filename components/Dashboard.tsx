import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import RegistrationForm from './RegistrationForm';
import HistoryView from './HistoryView';
import { PostAddRounded as PostAddRoundedIcon, HistoryRounded as HistoryRoundedIcon } from '@mui/icons-material';
import { User, VisitRecord } from '../types';

interface DashboardProps {
  user: User;
  history: VisitRecord[];
  onAddVisit: (visit: VisitRecord) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, history, onAddVisit }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={0} sx={{ mb: 4, borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '& .MuiTab-root': { py: 2.5, minHeight: 70, fontWeight: 800, fontSize: '0.85rem' },
            '& .Mui-selected': { bgcolor: 'rgba(26, 35, 126, 0.05)' }
          }}
        >
          <Tab icon={<PostAddRoundedIcon />} label="REGISTRO" iconPosition="start" />
          <Tab icon={<HistoryRoundedIcon />} label="HISTORIAL" iconPosition="start" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 ? (
          <RegistrationForm 
            user={user} 
            onAddVisit={onAddVisit} 
            onGoToHistory={() => setActiveTab(1)} 
          />
        ) : (
          <HistoryView history={history} />
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;