const express = require('express')
const router = express.Router()
const Feedback = require('../models/Feedback');

// Add new feedback
router.post('/addfeedback', async (req, res) => {
    const { userUid, userName, feedbackText, category } = req.body;

    try {
        // Create new feedback using the Mongoose model
        const newFeedback = new Feedback({
            userUid,
            userName,
            feedbackText,
            category: category || 'General Feedback'
        });

        const savedFeedback = await newFeedback.save();
        
        res.status(201).json({ 
            message: 'Feedback added successfully', 
            success: true,
            feedback: savedFeedback
        });
    } catch (error) {
        console.error('Error adding feedback:', error);
        res.status(500).json({ 
            message: 'Failed to add feedback', 
            success: false,
            error: error.message
        });
    }
});

// Get feedback for specific user
router.get('/getfeedback/:userUid', async (req, res) => {
    const { userUid } = req.params;

    try {
        const feedbacks = await Feedback.findByUserUid(userUid);
        
        res.status(200).json({ 
            feedbacks, 
            success: true 
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ 
            message: 'Failed to get feedback', 
            success: false,
            error: error.message
        });
    }
});

// Get all feedbacks (for admin dashboard)
router.get('/getallfeedbacks', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        
        res.status(200).json({ 
            feedbacks, 
            success: true 
        });
    } catch (error) {
        console.error('Error fetching all feedbacks:', error);
        res.status(500).json({ 
            message: 'Failed to get all feedbacks', 
            success: false,
            error: error.message
        });
    }
});

// Get public feedbacks (for community page - no auth required)
router.get('/getpublicfeedbacks', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        
        res.status(200).json({ 
            feedbacks, 
            success: true 
        });
    } catch (error) {
        console.error('Error fetching public feedbacks:', error);
        res.status(500).json({ 
            message: 'Failed to get public feedbacks', 
            success: false,
            error: error.message
        });
    }
});

// Get feedback by ID
router.get('/getfeedbackbyid/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const feedback = await Feedback.findById(id);
        
        if (!feedback) {
            return res.status(404).json({ 
                message: 'Feedback not found', 
                success: false 
            });
        }
        
        res.status(200).json({ 
            feedback, 
            success: true 
        });
    } catch (error) {
        console.error('Error fetching feedback by ID:', error);
        res.status(500).json({ 
            message: 'Failed to get feedback', 
            success: false,
            error: error.message
        });
    }
});

// Update feedback status
router.patch('/updatefeedbackstatus/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const feedback = await Feedback.findById(id);
        
        if (!feedback) {
            return res.status(404).json({ 
                message: 'Feedback not found', 
                success: false 
            });
        }

        await feedback.updateStatus(status);
        
        res.status(200).json({ 
            message: 'Status updated successfully', 
            success: true,
            feedback
        });
    } catch (error) {
        console.error('Error updating feedback status:', error);
        res.status(500).json({ 
            message: 'Failed to update status', 
            success: false,
            error: error.message
        });
    }
});

// Add admin response
router.patch('/addadminresponse/:id', async (req, res) => {
    const { id } = req.params;
    const { adminResponse } = req.body;

    try {
        const feedback = await Feedback.findById(id);
        
        if (!feedback) {
            return res.status(404).json({ 
                message: 'Feedback not found', 
                success: false 
            });
        }

        await feedback.updateAdminResponse(adminResponse);
        
        res.status(200).json({ 
            message: 'Admin response added successfully', 
            success: true,
            feedback
        });
    } catch (error) {
        console.error('Error adding admin response:', error);
        res.status(500).json({ 
            message: 'Failed to add admin response', 
            success: false,
            error: error.message
        });
    }
});

// Add reply to feedback
router.post('/addreply/:id', async (req, res) => {
    const { id } = req.params;
    const { from, message } = req.body;

    try {
        const feedback = await Feedback.findById(id);
        
        if (!feedback) {
            return res.status(404).json({ 
                message: 'Feedback not found', 
                success: false 
            });
        }

        await feedback.addReply(from, message);
        
        res.status(200).json({ 
            message: 'Reply added successfully', 
            success: true,
            feedback
        });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ 
            message: 'Failed to add reply', 
            success: false,
            error: error.message
        });
    }
});

// Get feedbacks by status
router.get('/getfeedbacksbystatus/:status', async (req, res) => {
    const { status } = req.params;

    try {
        const feedbacks = await Feedback.findByStatus(status);
        
        res.status(200).json({ 
            feedbacks, 
            success: true 
        });
    } catch (error) {
        console.error('Error fetching feedbacks by status:', error);
        res.status(500).json({ 
            message: 'Failed to get feedbacks by status', 
            success: false,
            error: error.message
        });
    }
});

// Get feedbacks by sentiment
router.get('/getfeedbacksbysentiment/:sentiment', async (req, res) => {
    const { sentiment } = req.params;

    try {
        const feedbacks = await Feedback.findBySentiment(sentiment);
        
        res.status(200).json({ 
            feedbacks, 
            success: true 
        });
    } catch (error) {
        console.error('Error fetching feedbacks by sentiment:', error);
        res.status(500).json({ 
            message: 'Failed to get feedbacks by sentiment', 
            success: false,
            error: error.message
        });
    }
});

// Delete feedback (admin only)
router.delete('/deletefeedback/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const feedback = await Feedback.findByIdAndDelete(id);
        
        if (!feedback) {
            return res.status(404).json({ 
                message: 'Feedback not found', 
                success: false 
            });
        }
        
        res.status(200).json({ 
            message: 'Feedback deleted successfully', 
            success: true
        });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ 
            message: 'Failed to delete feedback', 
            success: false,
            error: error.message
        });
    }
});

module.exports = router;



