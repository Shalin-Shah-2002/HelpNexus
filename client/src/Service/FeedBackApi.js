import axios from 'axios';
import { auth } from './firebase';

const Base_URL = "http://localhost:5000/api";

// Add new feedback
const addfeedback = async (feedbackText, category = 'General Feedback') => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const feedbackData = {
            userUid: user.uid,
            userName: user.displayName || user.email,
            feedbackText: feedbackText,
            category: category
        };

        const res = await axios.post(`${Base_URL}/addfeedback`, feedbackData);
        console.log('Feedback added successfully:', res.data);
        return res.data;
    } catch (error) {
        console.error('Error adding feedback:', error);
        throw error;
    }
};

// Get feedback for current user
const getUserFeedbacks = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const res = await axios.get(`${Base_URL}/getfeedback/${user.uid}`);
        return res.data.feedbacks;
    } catch (error) {
        console.error('Error getting user feedbacks:', error);
        throw error;
    }
};

// Get all feedbacks (for admin)
const getAllFeedbacks = async () => {
    try {
        const res = await axios.get(`${Base_URL}/getallfeedbacks`);
        return res.data.feedbacks;
    } catch (error) {
        console.error('Error getting all feedbacks:', error);
        throw error;
    }
};

// Get public feedbacks (for community page - no auth required)
const getPublicFeedbacks = async () => {
    try {
        const res = await axios.get(`${Base_URL}/getpublicfeedbacks`);
        return res.data.feedbacks;
    } catch (error) {
        console.error('Error getting public feedbacks:', error);
        throw error;
    }
};

// Get feedback by ID
const getFeedbackById = async (id) => {
    try {
        const res = await axios.get(`${Base_URL}/getfeedbackbyid/${id}`);
        return res.data.feedback;
    } catch (error) {
        console.error('Error getting feedback by ID:', error);
        throw error;
    }
};

// Update feedback status
const updateFeedbackStatus = async (id, status) => {
    try {
        const res = await axios.patch(`${Base_URL}/updatefeedbackstatus/${id}`, { status });
        return res.data;
    } catch (error) {
        console.error('Error updating feedback status:', error);
        throw error;
    }
};

// Add admin response
const addAdminResponse = async (id, adminResponse) => {
    try {
        const res = await axios.patch(`${Base_URL}/addadminresponse/${id}`, { adminResponse });
        return res.data;
    } catch (error) {
        console.error('Error adding admin response:', error);
        throw error;
    }
};

// Add reply to feedback
const addReply = async (id, from, message) => {
    try {
        const res = await axios.post(`${Base_URL}/addreply/${id}`, { from, message });
        return res.data;
    } catch (error) {
        console.error('Error adding reply:', error);
        throw error;
    }
};

// Get feedbacks by status
const getFeedbacksByStatus = async (status) => {
    try {
        const res = await axios.get(`${Base_URL}/getfeedbacksbystatus/${status}`);
        return res.data.feedbacks;
    } catch (error) {
        console.error('Error getting feedbacks by status:', error);
        throw error;
    }
};

// Get feedbacks by sentiment
const getFeedbacksBySentiment = async (sentiment) => {
    try {
        const res = await axios.get(`${Base_URL}/getfeedbacksbysentiment/${sentiment}`);
        return res.data.feedbacks;
    } catch (error) {
        console.error('Error getting feedbacks by sentiment:', error);
        throw error;
    }
};

// Delete feedback
const deleteFeedback = async (id) => {
    try {
        const res = await axios.delete(`${Base_URL}/deletefeedback/${id}`);
        return res.data;
    } catch (error) {
        console.error('Error deleting feedback:', error);
        throw error;
    }
};

export { 
    addfeedback, 
    getUserFeedbacks, 
    getAllFeedbacks, 
    getPublicFeedbacks,
    getFeedbackById,
    updateFeedbackStatus,
    addAdminResponse,
    addReply,
    getFeedbacksByStatus,
    getFeedbacksBySentiment,
    deleteFeedback
};
