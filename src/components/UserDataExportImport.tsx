import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Snackbar,
  Alert,
  CircularProgress,
  TextField
} from '@mui/material';
import { useAuth } from '../utils/AuthContext';
import { exportUserData, importUserData } from '../utils/userDataUtils';

interface UserDataExportImportProps {
  onDataUpdated?: () => void;
}

const UserDataExportImport: React.FC<UserDataExportImportProps> = ({ onDataUpdated }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'warning' | 'error'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState('');

  // Export user data
  const handleExport = async () => {
    if (!currentUser) {
      setNotification({
        open: true,
        message: 'You must be logged in to export data',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await exportUserData(currentUser.uid);
      
      if (result.success && result.downloadUri && result.filename) {
        // Create a download link and trigger it
        const link = document.createElement('a');
        link.href = result.downloadUri;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setNotification({
          open: true,
          message: 'Data exported successfully',
          severity: 'success'
        });
      } else {
        throw new Error(result.error as string || 'Export failed');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setNotification({
        open: true,
        message: 'Failed to export data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Import user data from file
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !event.target.files || event.target.files.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const file = event.target.files[0];
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const jsonData = e.target?.result as string;
          
          const result = await importUserData(currentUser.uid, jsonData);
          
          if (result.success) {
            setNotification({
              open: true,
              message: 'Data imported successfully',
              severity: 'success'
            });
            
            if (onDataUpdated) onDataUpdated();
          } else {
            throw new Error(result.error as string || 'Import failed');
          }
        } catch (error) {
          console.error('Error importing data:', error);
          setNotification({
            open: true,
            message: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      };
      
      fileReader.onerror = () => {
        setNotification({
          open: true,
          message: 'Failed to read file',
          severity: 'error'
        });
        setLoading(false);
      };
      
      fileReader.readAsText(file);
    } catch (error) {
      console.error('Error importing data:', error);
      setNotification({
        open: true,
        message: 'Failed to import data',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  // Import user data from text
  const handleTextImport = async () => {
    if (!currentUser || !importText.trim()) {
      setNotification({
        open: true,
        message: 'Please enter valid JSON data',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await importUserData(currentUser.uid, importText);
      
      if (result.success) {
        setNotification({
          open: true,
          message: 'Data imported successfully',
          severity: 'success'
        });
        
        setImportText('');
        if (onDataUpdated) onDataUpdated();
      } else {
        throw new Error(result.error as string || 'Import failed');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      setNotification({
        open: true,
        message: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Export & Import User Data
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleExport} 
          disabled={loading || !currentUser}
          sx={{ mr: 2, mb: 2 }}
        >
          Export My Data
        </Button>
        
        <input
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileImport}
        />
        
        <Button 
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || !currentUser}
          sx={{ mr: 2, mb: 2 }}
        >
          Import From File
        </Button>
      </Box>
      
      <Typography variant="h6" gutterBottom>
        Import From Text
      </Typography>
      
      <TextField
        label="Paste JSON Data"
        fullWidth
        multiline
        rows={6}
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
        disabled={loading}
        sx={{ mb: 2 }}
        placeholder='{"currentStreak": 5, "longestStreak": 10, ...}'
      />
      
      <Button 
        variant="contained" 
        onClick={handleTextImport}
        disabled={loading || !importText.trim() || !currentUser}
      >
        Import Data
      </Button>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default UserDataExportImport; 