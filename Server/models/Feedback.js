const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  from: {
    type: String,
    enum: ['admin', 'user'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: Date,
    default: Date.now
  }
});

const feedbackSchema = new mongoose.Schema({
  userUid: {
    type: String,
    required: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  feedbackText: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['UI Issue', 'Bug Report', 'Feature Request', 'General Feedback', 'Performance Issue', 'Other'],
    default: 'General Feedback'
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  adminResponse: {
    type: String,
    default: '',
    trim: true
  },
  replies: [replySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will automatically handle createdAt and updatedAt
});

// Pre-save middleware to update the updatedAt field
feedbackSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find feedback by user UID
feedbackSchema.statics.findByUserUid = function(userUid) {
  return this.find({ userUid: userUid }).sort({ createdAt: -1 });
};

// Static method to find feedback by status
feedbackSchema.statics.findByStatus = function(status) {
  return this.find({ status: status }).sort({ createdAt: -1 });
};

// Static method to find feedback by sentiment
feedbackSchema.statics.findBySentiment = function(sentiment) {
  return this.find({ sentiment: sentiment }).sort({ createdAt: -1 });
};

// Instance method to add a reply
feedbackSchema.methods.addReply = function(from, message) {
  this.replies.push({
    from: from,
    message: message,
    time: new Date()
  });
  return this.save();
};

// Instance method to update status
feedbackSchema.methods.updateStatus = function(status) {
  this.status = status;
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to update admin response
feedbackSchema.methods.updateAdminResponse = function(response) {
  this.adminResponse = response;
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Feedback', feedbackSchema);