import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Reply as ReplyIcon,
  Visibility as VisibilityIcon,
  SentimentSatisfied as PositiveIcon,
  SentimentNeutral as NeutralIcon,
  SentimentDissatisfied as NegativeIcon,
  Psychology as AnalyzeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../Service/firebase';
import { getPublicFeedbacks, addReply } from '../../Service/FeedBackApi';
import analyzeFeedback from '../../Service/Admin_services/FeedbackAnalyzer';
import { useTheme } from '../../context/ThemeContext';

const Community = () => {
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [analyzingSentiment, setAnalyzingSentiment] = useState(false);

  
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchFeedbacks();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchFeedbacks();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [feedbacks, categoryFilter, sentimentFilter, sortBy]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      console.log('Fetching feedbacks from Community page...');
      const feedbacksData = await getPublicFeedbacks();
      console.log('Feedbacks received:', feedbacksData);
      
      // Set feedbacks first
      setFeedbacks(feedbacksData || []);
      setError(null);
      
      // Automatically analyze sentiment for feedbacks that need it
      const feedbacksToAnalyze = feedbacksData.filter(feedback => 
        !feedback.sentiment || feedback.sentiment === 'neutral'
      );
      
      console.log(`📊 Found ${feedbacksToAnalyze.length} feedbacks that need sentiment analysis`);
      
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
      console.error('Error details:', err.response?.data || err.message);
      setError(`Failed to fetch feedbacks: ${err.response?.data?.message || err.message}`);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...feedbacks];

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(feedback => feedback.category === categoryFilter);
    }

    // Apply sentiment filter
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(feedback => feedback.sentiment === sentimentFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'mostReplies':
        filtered.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
        break;
      case 'positive':
        filtered.sort((a, b) => {
          if (a.sentiment === 'positive' && b.sentiment !== 'positive') return -1;
          if (b.sentiment === 'positive' && a.sentiment !== 'positive') return 1;
          return 0;
        });
        break;
      case 'negative':
        filtered.sort((a, b) => {
          if (a.sentiment === 'negative' && b.sentiment !== 'negative') return -1;
          if (b.sentiment === 'negative' && a.sentiment !== 'negative') return 1;
          return 0;
        });
        break;
      default:
        break;
    }

    setFilteredFeedbacks(filtered);
  };

  const analyzeSentimentForFeedback = async (feedbackId, feedbackText) => {
    try {
      console.log('🔍 Starting sentiment analysis for feedback:', feedbackId);
      console.log('📝 Feedback text:', feedbackText);
      console.log('🌐 Calling endpoint:', 'http://0.0.0.0:8000/analyze');
      
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
      
      // Also update filtered feedbacks to reflect the change immediately
      setFilteredFeedbacks(prev => {
        const updated = prev.map(f => 
          f._id === feedbackId 
            ? { ...f, sentiment: sentimentLabel, sentimentScore: analysis.score }
            : f
        );
        console.log('📝 Updated filtered feedbacks state:', updated.find(f => f._id === feedbackId));
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

  const handleFeedbackClick = (feedback) => {
    setSelectedFeedback(feedback);
    setNewReply('');
    setDetailDialogOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!selectedFeedback || !newReply.trim()) return;
    
    try {
      setSubmitting(true);
      await addReply(selectedFeedback._id, 'user', newReply);
      
      // Update local state
      const updatedReplies = [
        ...(selectedFeedback.replies || []),
        { from: 'user', message: newReply, time: new Date().toISOString() }
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
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedFeedback(null);
    setNewReply('');
  };

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

  // Get unique categories for filter
  const categories = [...new Set(feedbacks.map(f => f.category))];

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
              Community Feedback
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              View and interact with community feedback
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
              onClick={() => navigate('/dashboard')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters and Sort */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sentiment</InputLabel>
                <Select
                  value={sentimentFilter}
                  label="Sentiment"
                  onChange={(e) => setSentimentFilter(e.target.value)}
                >
                  <MenuItem value="all">All Sentiments</MenuItem>
                  <MenuItem value="positive">Positive</MenuItem>
                  <MenuItem value="negative">Negative</MenuItem>
                  <MenuItem value="neutral">Neutral</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="mostReplies">Most Replies</MenuItem>
                  <MenuItem value="positive">Positive First</MenuItem>
                  <MenuItem value="negative">Negative First</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                {filteredFeedbacks.length} feedback{filteredFeedbacks.length !== 1 ? 's' : ''} found
              </Typography>
            </Grid>
          </Grid>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredFeedbacks.length === 0 ? (
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No feedback found matching your filters.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              filteredFeedbacks.map((feedback) => (
                <Grid item xs={12} key={feedback._id}>
                  <Card sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: muiTheme.shadows[8]
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar sx={{ bgcolor: muiTheme.palette.primary.main }}>
                          {feedback.userName?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {feedback.userName}
                            </Typography>
                            <Chip 
                              label={feedback.category} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
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
                                  {analyzingSentiment ? <CircularProgress size={16} /> : <AnalyzeIcon />}
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
                                  {analyzingSentiment ? <CircularProgress size={16} /> : <AnalyzeIcon />}
                                </IconButton>
                              </Tooltip>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {feedback.feedbackText.length > 200 
                              ? `${feedback.feedbackText.substring(0, 200)}...` 
                              : feedback.feedbackText
                            }
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleFeedbackClick(feedback)}
                            >
                              View Details
                            </Button>
                            {feedback.replies && feedback.replies.length > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                {feedback.replies.length} reply{feedback.replies.length !== 1 ? 's' : ''}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
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
                        {analyzingSentiment ? <CircularProgress size={16} /> : <AnalyzeIcon />}
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

                {selectedFeedback.adminResponse && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="primary.contrastText" gutterBottom>
                      Admin Response
                    </Typography>
                    <Typography variant="body2" color="primary.contrastText">
                      {selectedFeedback.adminResponse}
                    </Typography>
                  </Box>
                )}

                {selectedFeedback.replies && selectedFeedback.replies.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Conversation History
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
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
                    rows={3}
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Share your thoughts on this feedback..."
                    disabled={submitting}
                  />
                  <Button
                    variant="contained"
                    startIcon={<ReplyIcon />}
                    onClick={handleReplySubmit}
                    disabled={submitting || !newReply.trim()}
                    sx={{ mt: 1 }}
                  >
                    {submitting ? 'Sending...' : 'Send Reply'}
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

export default Community; 