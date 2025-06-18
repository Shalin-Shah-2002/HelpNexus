import axios from 'axios';

const base_url = "http://localhost:8000/analyze";

const analyzeFeedback = async (feedback) => {
    try {
        console.log('🌐 Attempting to connect to:', base_url);
        console.log('📝 Sending text:', feedback);
        
        const response = await axios.post(base_url, { "text": feedback }, {
            timeout: 10000, // 10 second timeout
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('✅ FastAPI sentiment analysis result:', response.data);
        
        const fastApiLabel = response.data.label;
        let sentimentLabel;
        
        if (fastApiLabel === 'POSITIVE') {
            sentimentLabel = 'positive';
        } else if (fastApiLabel === 'NEGATIVE') {
            sentimentLabel = 'negative';
        } else {
            sentimentLabel = 'neutral';
        }
        
        return {
            label: sentimentLabel,
            score: response.data.score
        };
    } catch (error) {
        console.error('❌ Error in sentiment analysis:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error response:', error.response?.data);
        
        if (error.code === 'ERR_NETWORK') {
            console.error('🌐 Network Error - Please check if FastAPI server is running on http://localhost:8000');
        }
        
        // Return neutral sentiment as fallback
        return {
            label: 'neutral',
            score: 0.5
        };
    }
};

export default analyzeFeedback;
