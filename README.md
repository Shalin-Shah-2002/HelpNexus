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


### 💬 Feedbacks Collection

```json
{
  "_id": "ObjectId",
  "userId": "ssecaoL3mMMFNRBWEYyWPhjt81s2",
  "topic": "App Usability",
  "message": "The app is intuitive and clean.",
  "timestamp": "2025-06-17T12:00:00Z",
  "sentiment": "positive" // optional, AI-analyzed
}
```

---

## 📁 Folder Structure

```
HelpNexus/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.js
│   └── public/
├── server/              # Node.js backend
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   └── index.js
├── README.md
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

* Node.js
* MongoDB (local or MongoDB Atlas)
* Firebase project (for Google Auth)

### Setup Instructions

```bash
# Clone the project
git clone https://github.com/yourusername/HelpNexus.git
cd HelpNexus

# Setup Backend
cd server
npm install
npm run dev

# Setup Frontend
cd ../client
npm install
npm start
```

---

## 🔐 Firebase Configuration

Create a file `firebase.js` in `client/src/` and add your Firebase config:

```js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
export default app;
```

---

## 🧠 AI Integration (Planned)

* Integrate Gemini or Hugging Face models
* Analyze user feedback to determine sentiment (positive/neutral/negative)
* Display visual sentiment dashboard in admin panel

---

## ✅ TODO

* [x] Google Sign-In via Firebase
* [x] Feedback Submission & Viewing
* [x] Admin Dashboard Setup
* [ ] Sentiment Analysis Integration
* [ ] Deployment (Render / Vercel)
* [ ] Testing and CI Integration

---

## ✍️ Author

**Shalin Shah**
📧 [kyo.69.722@gmail.com](mailto:kyo.69.722@gmail.com)
🌐 [LinkedIn](https://linkedin.com/in/shalin-shah) *(Add if you want)*

---

You can now copy-paste this entire block into your `README.md` file in VS Code or GitHub. If you’d like me to generate a `.env.example` or `LICENSE` file next, just let me know!
