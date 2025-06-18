import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { addfeedback } from '../../Service/FeedBackApi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('General Feedback');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const categories = [
    'UI Issue',
    'Bug Report', 
    'Feature Request',
    'General Feedback',
    'Performance Issue',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter your feedback',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await addfeedback(feedback, category);
      setFeedback('');
      setCategory('General Feedback');
      setSnackbar({
        open: true,
        message: 'Feedback submitted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit feedback. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Submit Feedback Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Share Your Feedback
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Help us improve by sharing your thoughts, suggestions, or reporting issues.
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Your Feedback"
                  multiline
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="Please describe your feedback, suggestion, or issue in detail..."
                  disabled={loading}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  disabled={loading || !feedback.trim()}
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Community Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Community
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Explore feedback from other users, share your thoughts, and engage with the community.
              </Typography>
              
              <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🌟 Community Features
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • View all community feedback
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Reply to other users' feedback
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Filter by category and sort options
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    • See admin responses and updates
                  </Typography>
                  <Button
                    component={Link}
                    to="/community"
                    variant="contained"
                    color="inherit"
                    fullWidth
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                    }}
                  >
                    Explore Community
                  </Button>
                </CardContent>
              </Card>

              <Typography variant="body2" color="text.secondary">
                Join the conversation and help make our platform better together!
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;