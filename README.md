# 🚀 HelpNexus - Feedback Management System

**HelpNexus** is a full-stack feedback management system designed for institutions and organizations to collect, manage, and analyze user feedback. It features secure Google Authentication, role-based access, and future integration of AI-powered sentiment analysis.

---

## 🌐 Live Demo

> 🛠️ *Coming Soon...*

---

## 🛠️ Tech Stack

### 🖥 Frontend
- **React.js** + **Material UI (MUI)**
- **Firebase Authentication** (Google Sign-In)
- **Axios** for API calls

### 🔧 Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **AI Integration** *(Planned)*: Gemini API or Hugging Face for sentiment analysis

---

## 👨‍💻 Features

### For Users:
- Sign in with Google
- Submit feedback with topic and message
- View their feedback history

### For Admins:
- Role-based dashboard access
- View all submitted feedbacks
- Filter/sort feedback entries
- (Coming Soon) Sentiment analytics dashboard

---

## 🧱 Database Structure

### 🔐 `Users` Collection

```json
{
  "_id": "684577180c5d304883961f4d",
  "uid": "ssecaoL3mMMFNRBWEYyWPhjt81s2",
  "email": "kyo.69.722@gmail.com",
  "displayName": "Shalin Shah",
  "role": "user" // or "admin"
}

💬 Feedbacks Collection
```json
{
  "_id": "ObjectId",
  "userId": "ssecaoL3mMMFNRBWEYyWPhjt81s2",
  "topic": "App Usability",
  "message": "The app is intuitive and clean.",
  "timestamp": "2025-06-17T12:00:00Z",
  "sentiment": "positive" // (optional - via AI)
}