import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  useTheme as useMuiTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  People as PeopleIcon,
  Message as MessageIcon,
  ExitToApp as ExitToAppIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Visibility as VisibilityIcon,
  Reply as ReplyIcon,
  SentimentSatisfied as PositiveIcon,
  SentimentNeutral as NeutralIcon,
  SentimentDissatisfied as NegativeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../Service/firebase';
import { getAllFeedbacks, updateFeedbackStatus, addAdminResponse, addReply } from '../../Service/FeedBackApi';
import analyzeFeedback from '../../Service/Admin_services/FeedbackAnalyzer';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard = () => {
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [newReply, setNewReply] = useState('');
  const [updating, setUpdating] = useState(false);
  const [analyzingSentiment, setAnalyzingSentiment] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchFeedbacks();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const feedbacksData = await getAllFeedbacks();
      console.log('Feedbacks received in AdminDashboard:', feedbacksData);
      
      // Set feedbacks first
      setFeedbacks(feedbacksData || []);
      setError(null);
      
      // Automatically analyze sentiment for feedbacks that need it
      const feedbacksToAnalyze = feedbacksData.filter(feedback => 
        !feedback.sentiment || feedback.sentiment === 'neutral'
      );
      
      console.log(`📊 Found ${feedbacksToAnalyze.length} feedbacks that need sentiment analysis in AdminDashboard`);
      
      // Analyze sentiment for each feedback that needs it
      for (const feedback of feedbacksToAnalyze) {
        try {
          console.log(`🔍 Analyzing sentiment for feedback: ${feedback._id}`);
          const analysis = await analyzeFeedback(feedback.feedbackText);
          console.log(`✅ Analysis result for ${feedback._id}:`, analysis);
          
          // Update the feedback with sentiment analysis
          setFeedbacks(prev => prev.map(f => 
            f._id === feedback._id 
              ? { ...f, sentiment: analysis.label, sentimentScore: analysis.score }
              : f
          ));
          
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Error analyzing sentiment for feedback ${feedback._id}:`, error);
        }
      }
      
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('Failed to fetch feedbacks');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSentimentForFeedback = async (feedbackId, feedbackText) => {
    try {
      console.log('🔍 Starting sentiment analysis for feedback:', feedbackId);
      console.log('📝 Feedback text:', feedbackText);
      console.log('🌐 Calling endpoint:', 'http://localhost:8000/analyze');
      
      setAnalyzingSentiment(true);
      const analysis = await analyzeFeedback(feedbackText);
      
      console.log('📊 Raw analysis result:', analysis);
      
      // Convert FastAPI labels to lowercase for consistency
      const sentimentLabel = analysis.label.toLowerCase();
      console.log("🎯 Sentiment analysis result:", sentimentLabel);
      console.log("🎯 Sentiment score:", analysis.score);
      
      // Update the feedback with sentiment analysis
      setFeedbacks(prev => {
        const updated = prev.map(f => 
          f._id === feedbackId 
            ? { ...f, sentiment: sentimentLabel, sentimentScore: analysis.score }
            : f
        );
        console.log('📝 Updated feedbacks state:', updated.find(f => f._id === feedbackId));
        return updated;
      });
      
      // Update selected feedback if it's the one being analyzed
      if (selectedFeedback && selectedFeedback._id === feedbackId) {
        setSelectedFeedback(prev => ({
          ...prev,
          sentiment: sentimentLabel,
          sentimentScore: analysis.score
        }));
        console.log('📝 Updated selected feedback state with sentiment:', sentimentLabel);
      }
      
      console.log('✅ Sentiment analysis completed successfully');
      return analysis;
    } catch (error) {
      console.error('❌ Error analyzing sentiment:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      return null;
    } finally {
      setAnalyzingSentiment(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login/admin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFeedbackClick = (feedback) => {
    setSelectedFeedback(feedback);
    setAdminResponse(feedback.adminResponse || '');
    setNewReply('');
    setDetailDialogOpen(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedFeedback) return;
    
    try {
      setUpdating(true);
      await updateFeedbackStatus(selectedFeedback._id, newStatus);
      
      // Update local state
      setFeedbacks(prev => prev.map(f => 
        f._id === selectedFeedback._id 
          ? { ...f, status: newStatus }
          : f
      ));
      
      setSelectedFeedback(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAdminResponseSubmit = async () => {
    if (!selectedFeedback || !adminResponse.trim()) return;
    
    try {
      setUpdating(true);
      await addAdminResponse(selectedFeedback._id, adminResponse);
      
      // Update local state
      setFeedbacks(prev => prev.map(f => 
        f._id === selectedFeedback._id 
          ? { ...f, adminResponse }
          : f
      ));
      
      setSelectedFeedback(prev => ({ ...prev, adminResponse }));
    } catch (error) {
      console.error('Error adding admin response:', error);
      setError('Failed to add admin response');
    } finally {
      setUpdating(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedFeedback || !newReply.trim()) return;
    
    try {
      setUpdating(true);
      await addReply(selectedFeedback._id, 'admin', newReply);
      
      // Update local state
      const updatedReplies = [
        ...(selectedFeedback.replies || []),
        { from: 'admin', message: newReply, time: new Date().toISOString() }
      ];
      
      setFeedbacks(prev => prev.map(f => 
        f._id === selectedFeedback._id 
          ? { ...f, replies: updatedReplies }
          : f
      ));
      
      setSelectedFeedback(prev => ({ ...prev, replies: updatedReplies }));
      setNewReply('');
    } catch (error) {
      console.error('Error adding reply:', error);
      setError('Failed to add reply');
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedFeedback(null);
    setAdminResponse('');
    setNewReply('');
  };

  // Calculate statistics
  const totalFeedbacks = feedbacks.length;
  const uniqueUsers = new Set(feedbacks.map(f => f.userUid)).size;
  const averageFeedbackPerUser = uniqueUsers > 0 ? (totalFeedbacks / uniqueUsers).toFixed(1) : 0;

  // Count by status
  const statusCounts = feedbacks.reduce((acc, feedback) => {
    acc[feedback.status] = (acc[feedback.status] || 0) + 1;
    return acc;
  }, {});

  // Count by category
  const categoryCounts = feedbacks.reduce((acc, feedback) => {
    acc[feedback.category] = (acc[feedback.category] || 0) + 1;
    return acc;
  }, {});

  // Count by sentiment
  const sentimentCounts = feedbacks.reduce((acc, feedback) => {
    const sentiment = feedback.sentiment || 'neutral';
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});

  const pendingFeedbacks = feedbacks.filter(f => f.status === 'Pending');
  const resolvedFeedbacks = feedbacks.filter(f => f.status === 'Resolved');
  const positiveFeedbacks = feedbacks.filter(f => f.sentiment === 'positive');
  const negativeFeedbacks = feedbacks.filter(f => f.sentiment === 'negative');

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return <PositiveIcon />;
      case 'negative': return <NegativeIcon />;
      case 'neutral': return <NeutralIcon />;
      default: return <NeutralIcon />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{
      flexGrow: 1,
      minHeight: '100vh',
      bgcolor: muiTheme.palette.background.default,
      py: 4,
      transition: 'background-color 0.3s ease'
    }}>
      <Container maxWidth="lg">
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{
              fontWeight: 'bold',
              color: muiTheme.palette.primary.main,
              mb: 1
            }}>
              Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage and monitor user feedback
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={fetchFeedbacks}
                disabled={loading}
                sx={{
                  bgcolor: muiTheme.palette.primary.main,
                  color: 'white',
                  '&:hover': { bgcolor: muiTheme.palette.primary.dark }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ExitToAppIcon />}
              onClick={handleSignOut}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3
              }}
            >
              Sign Out
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  borderRadius: 2,
                  boxShadow: muiTheme.shadows[4],
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{
                        bgcolor: muiTheme.palette.primary.main,
                        width: 48,
                        height: 48,
                        mr: 2
                      }}>
                        <PeopleIcon />
                      </Avatar>
                      <Typography variant="h6" color="text.secondary">
                        Unique Users
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {uniqueUsers}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  borderRadius: 2,
                  boxShadow: muiTheme.shadows[4],
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{
                        bgcolor: muiTheme.palette.success.main,
                        width: 48,
                        height: 48,
                        mr: 2
                      }}>
                        <MessageIcon />
                      </Avatar>
                      <Typography variant="h6" color="text.secondary">
                        Total Feedback
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {totalFeedbacks}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  borderRadius: 2,
                  boxShadow: muiTheme.shadows[4],
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{
                        bgcolor: muiTheme.palette.success.main,
                        width: 48,
                        height: 48,
                        mr: 2
                      }}>
                        <PositiveIcon />
                      </Avatar>
                      <Typography variant="h6" color="text.secondary">
                        Positive
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {positiveFeedbacks.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  borderRadius: 2,
                  boxShadow: muiTheme.shadows[4],
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{
                        bgcolor: muiTheme.palette.error.main,
                        width: 48,
                        height: 48,
                        mr: 2
                      }}>
                        <NegativeIcon />
                      </Avatar>
                      <Typography variant="h6" color="text.secondary">
                        Negative
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {negativeFeedbacks.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Feedback List */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Recent Feedback
              </Typography>
              
              {feedbacks.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No feedback available yet.
                </Typography>
              ) : (
                <List>
                  {feedbacks.slice(0, 10).map((feedback, index) => (
                    <React.Fragment key={feedback._id || index}>
                      <ListItem 
                        alignItems="flex-start"
                        button
                        onClick={() => handleFeedbackClick(feedback)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: muiTheme.palette.action.hover
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="subtitle1" component="span">
                                {feedback.userName}
                              </Typography>
                              <Chip 
                                label={feedback.category} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                              <Chip 
                                label={feedback.status} 
                                size="small" 
                                color={
                                  feedback.status === 'Pending' ? 'warning' :
                                  feedback.status === 'Resolved' ? 'success' :
                                  feedback.status === 'In Progress' ? 'info' : 'default'
                                }
                              />
                              {feedback.sentiment && (
                                <Chip 
                                  icon={getSentimentIcon(feedback.sentiment)}
                                  label={feedback.sentiment} 
                                  size="small" 
                                  color={getSentimentColor(feedback.sentiment)}
                                  variant="outlined"
                                />
                              )}
                              {(!feedback.sentiment || feedback.sentiment === 'neutral') && (
                                <Tooltip title="Analyze Sentiment">
                                  <IconButton 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      analyzeSentimentForFeedback(feedback._id, feedback.feedbackText);
                                    }}
                                    disabled={analyzingSentiment}
                                  >
                                    {analyzingSentiment ? <CircularProgress size={16} /> : <NeutralIcon />}
                                  </IconButton>
                                </Tooltip>
                              )}
                              {feedback.sentiment && feedback.sentiment !== 'neutral' && (
                                <Tooltip title="Re-analyze Sentiment">
                                  <IconButton 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      analyzeSentimentForFeedback(feedback._id, feedback.feedbackText);
                                    }}
                                    disabled={analyzingSentiment}
                                  >
                                    {analyzingSentiment ? <CircularProgress size={16} /> : <NeutralIcon />}
                                  </IconButton>
                                </Tooltip>
                              )}
                              <IconButton size="small" sx={{ ml: 'auto' }}>
                                <VisibilityIcon />
                              </IconButton>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                                {feedback.feedbackText}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(feedback.createdAt).toLocaleDateString()} at {new Date(feedback.createdAt).toLocaleTimeString()}
                              </Typography>
                              {feedback.replies && feedback.replies.length > 0 && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                  {feedback.replies.length} reply{feedback.replies.length !== 1 ? 's' : ''}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < feedbacks.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </>
        )}

        {/* Feedback Detail Dialog */}
        <Dialog 
          open={detailDialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedFeedback && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="h6">
                    Feedback from {selectedFeedback.userName}
                  </Typography>
                  <Chip label={selectedFeedback.category} color="primary" variant="outlined" />
                  <Chip 
                    label={selectedFeedback.status} 
                    color={
                      selectedFeedback.status === 'Pending' ? 'warning' :
                      selectedFeedback.status === 'Resolved' ? 'success' :
                      selectedFeedback.status === 'In Progress' ? 'info' : 'default'
                    }
                  />
                  {selectedFeedback.sentiment && (
                    <Chip 
                      icon={getSentimentIcon(selectedFeedback.sentiment)}
                      label={selectedFeedback.sentiment} 
                      color={getSentimentColor(selectedFeedback.sentiment)}
                      variant="outlined"
                    />
                  )}
                  {(!selectedFeedback.sentiment || selectedFeedback.sentiment === 'neutral') && (
                    <Tooltip title="Analyze Sentiment">
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          analyzeSentimentForFeedback(selectedFeedback._id, selectedFeedback.feedbackText);
                        }}
                        disabled={analyzingSentiment}
                      >
                        {analyzingSentiment ? <CircularProgress size={16} /> : <NeutralIcon />}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </DialogTitle>
              
              <DialogContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Feedback Text
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedFeedback.feedbackText}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Submitted on {new Date(selectedFeedback.createdAt).toLocaleDateString()} at {new Date(selectedFeedback.createdAt).toLocaleTimeString()}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Update Status
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedFeedback.status}
                      label="Status"
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updating}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Resolved">Resolved</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Admin Response
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Add your response to this feedback..."
                    disabled={updating}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAdminResponseSubmit}
                    disabled={updating || !adminResponse.trim()}
                    sx={{ mt: 1 }}
                  >
                    {updating ? 'Saving...' : 'Save Response'}
                  </Button>
                </Box>

                {selectedFeedback.replies && selectedFeedback.replies.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Conversation History
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {selectedFeedback.replies.map((reply, index) => (
                        <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {reply.from === 'admin' ? 'Admin' : 'User'} - {new Date(reply.time).toLocaleString()}
                          </Typography>
                          <Typography variant="body2">{reply.message}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Add Reply
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Add a reply to this conversation..."
                    disabled={updating}
                  />
                  <Button
                    variant="contained"
                    startIcon={<ReplyIcon />}
                    onClick={handleReplySubmit}
                    disabled={updating || !newReply.trim()}
                    sx={{ mt: 1 }}
                  >
                    {updating ? 'Sending...' : 'Send Reply'}
                  </Button>
                </Box>
              </DialogContent>
              
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
