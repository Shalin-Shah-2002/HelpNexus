const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function promoteToAdmin(email) {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");

        // Promote user to admin
        const user = await User.promoteToAdmin(email);
        
        if (user) {
            console.log(`✅ Successfully promoted ${email} to admin role`);
            console.log('User details:', {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: user.role
            });
        } else {
            console.log(`❌ User with email ${email} not found`);
        }

    } catch (error) {
        console.error('Error promoting user to admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
    console.log('Usage: node promote-admin.js <email>');
    console.log('Example: node promote-admin.js your-email@gmail.com');
    process.exit(1);
}

promoteToAdmin(email); 