const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())

const mongoose = require('mongoose');
require('dotenv').config()
const admin = require('firebase-admin');
app.use(express.json())

const firebase_service_account = require('./helpnexus-7d704-firebase-adminsdk-fbsvc-3e9531263a.json')
admin.initializeApp({
    credential: admin.credential.cert(firebase_service_account),
})

// Connect to MongoDB using Mongoose
async function ConnectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB using Mongoose");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
ConnectDB();

// Import the models
const Feedback = require('./models/Feedback');
const User = require('./models/User');

app.post('/api/login', async (req, res) => {
    const { idToken, uid, email, displayName, role } = req.body;
    
    try {
        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        console.log("User signed in:", uid);
        console.log("User email:", email);
        console.log("User display name:", displayName);
        console.log("Requested role:", role);
        
        // Find or create user in our database
        const userData = {
            uid,
            email,
            displayName,
            role: role || 'user'
        };
        
        const user = await User.findOrCreateUser(userData);
        
        // Check if user is requesting admin access
        if (role === 'admin') {
            // Verify if the user actually has admin privileges
            const isAdmin = await User.isAdmin(uid);
            if (!isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access. Only administrators are allowed.',
                    role: 'user'
                });
            }
        }
        
        res.json({
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: user.role
            },
            role: user.role,
        });

    } catch (error) {
        console.error('Error in login:', error);
        res.status(401).json({
            success: false,
            message: "Authentication failed",
            error: error.message
        });
    }
});

// Admin management endpoints
app.post('/api/promote-to-admin', async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.promoteToAdmin(email);
        if (user) {
            res.json({
                success: true,
                message: `User ${email} promoted to admin successfully`,
                user
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        console.error('Error promoting user to admin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to promote user to admin',
            error: error.message
        });
    }
});

app.post('/api/demote-to-user', async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.demoteToUser(email);
        if (user) {
            res.json({
                success: true,
                message: `Admin ${email} demoted to user successfully`,
                user
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        console.error('Error demoting admin to user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to demote admin to user',
            error: error.message
        });
    }
});

// Import and use the routes
const feedbackroute = require('./Routes/Feedback');
const analyzerRoute = require('./Routes/Analyzer');

app.use('/api', feedbackroute);
app.use('/api', analyzerRoute);

app.get('/', (req, res) => res.send('Hello World!'));

const port = process.env.PORT || 6000
app.listen(port, () => console.log(`Example app on port ${port}!`));
