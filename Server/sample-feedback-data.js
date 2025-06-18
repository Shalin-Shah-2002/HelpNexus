// Sample feedback data that matches the new schema
// This file demonstrates how to create feedback entries using the new Mongoose model

const Feedback = require('./models/Feedback');

// Sample feedback data
const sampleFeedbacks = [
  {
    userUid: "ssecaoL3mMMFNRBWEYyWPhjt81s2",
    userName: "Shalin Shah",
    feedbackText: "The dark mode button overlaps the sidebar.",
    category: "UI Issue",
    sentiment: "negative",
    status: "Pending",
    adminResponse: "",
    replies: [
      {
        from: "admin",
        message: "Thanks for reporting this. We're fixing it.",
        time: new Date("2025-06-17T10:21:00.000Z")
      }
    ],
    createdAt: new Date("2025-06-17T10:19:45.012Z"),
    updatedAt: new Date("2025-06-17T10:21:10.000Z")
  },
  {
    userUid: "user123456789",
    userName: "John Doe",
    feedbackText: "Great app! The new features are really helpful.",
    category: "General Feedback",
    sentiment: "positive",
    status: "Resolved",
    adminResponse: "Thank you for your positive feedback!",
    replies: [],
    createdAt: new Date("2025-06-16T15:30:00.000Z"),
    updatedAt: new Date("2025-06-16T15:30:00.000Z")
  },
  {
    userUid: "user987654321",
    userName: "Jane Smith",
    feedbackText: "The app crashes when I try to upload large files.",
    category: "Bug Report",
    sentiment: "negative",
    status: "In Progress",
    adminResponse: "We're investigating this issue.",
    replies: [
      {
        from: "admin",
        message: "Can you provide more details about the file size?",
        time: new Date("2025-06-15T14:20:00.000Z")
      },
      {
        from: "user",
        message: "Files larger than 10MB cause the crash.",
        time: new Date("2025-06-15T14:25:00.000Z")
      }
    ],
    createdAt: new Date("2025-06-15T14:15:00.000Z"),
    updatedAt: new Date("2025-06-15T14:25:00.000Z")
  }
];

// Function to seed the database with sample data
async function seedSampleData() {
  try {
    // Clear existing feedback data
    await Feedback.deleteMany({});
    console.log('Cleared existing feedback data');

    // Insert sample feedbacks
    const insertedFeedbacks = await Feedback.insertMany(sampleFeedbacks);
    console.log(`Inserted ${insertedFeedbacks.length} sample feedbacks`);

    // Display the inserted data
    console.log('\nSample feedbacks inserted:');
    insertedFeedbacks.forEach((feedback, index) => {
      console.log(`\n${index + 1}. ${feedback.userName} - ${feedback.category}`);
      console.log(`   Text: ${feedback.feedbackText}`);
      console.log(`   Status: ${feedback.status}, Sentiment: ${feedback.sentiment}`);
      console.log(`   Replies: ${feedback.replies.length}`);
    });

  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
}

// Function to create a single feedback entry
async function createFeedback(feedbackData) {
  try {
    const newFeedback = new Feedback(feedbackData);
    const savedFeedback = await newFeedback.save();
    console.log('Feedback created successfully:', savedFeedback);
    return savedFeedback;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
}

// Example usage of the new schema methods
async function demonstrateSchemaMethods() {
  try {
    // Find feedbacks by user UID
    const userFeedbacks = await Feedback.findByUserUid("ssecaoL3mMMFNRBWEYyWPhjt81s2");
    console.log('User feedbacks:', userFeedbacks.length);

    // Find feedbacks by status
    const pendingFeedbacks = await Feedback.findByStatus("Pending");
    console.log('Pending feedbacks:', pendingFeedbacks.length);

    // Find feedbacks by sentiment
    const negativeFeedbacks = await Feedback.findBySentiment("negative");
    console.log('Negative feedbacks:', negativeFeedbacks.length);

    // Add a reply to a feedback
    if (userFeedbacks.length > 0) {
      const feedback = userFeedbacks[0];
      await feedback.addReply("admin", "This is a test reply");
      console.log('Reply added successfully');
    }

  } catch (error) {
    console.error('Error demonstrating schema methods:', error);
  }
}

// Export functions for use in other files
module.exports = {
  seedSampleData,
  createFeedback,
  demonstrateSchemaMethods,
  sampleFeedbacks
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  // This will only run if you execute this file directly
  // You would need to connect to MongoDB first
  console.log('Sample feedback data file loaded');
  console.log('Use seedSampleData() to populate the database with sample data');
} 