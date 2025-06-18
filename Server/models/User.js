const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to update the updatedAt field
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find or create user
userSchema.statics.findOrCreateUser = async function(userData) {
  try {
    let user = await this.findOne({ uid: userData.uid });
    
    if (!user) {
      // Create new user
      user = new this({
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role || 'user'
      });
      await user.save();
      console.log('New user created:', user.email);
    } else {
      // Update existing user's last login and display name
      user.lastLogin = new Date();
      user.displayName = userData.displayName;
      await user.save();
      console.log('Existing user logged in:', user.email);
    }
    
    return user;
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
};

// Static method to check if user is admin
userSchema.statics.isAdmin = async function(uid) {
  try {
    const user = await this.findOne({ uid: uid });
    return user && user.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Static method to promote user to admin
userSchema.statics.promoteToAdmin = async function(email) {
  try {
    const user = await this.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw error;
  }
};

// Static method to demote admin to user
userSchema.statics.demoteToUser = async function(email) {
  try {
    const user = await this.findOneAndUpdate(
      { email: email },
      { role: 'user' },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error('Error demoting admin to user:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema); 