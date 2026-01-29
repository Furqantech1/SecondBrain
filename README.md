# Second Brain 🧠

**Your Personal Intelligence Interface**

Second Brain is a powerful RAG (Retrieval-Augmented Generation) application that allows you to upload documents (PDFs) and have intelligent, context-aware conversations with them. Built with a modern tech stack, it features a stunning "Deep Space" UI and secure authentication.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## ✨ Key Features

-   **📄 Instant Document Ingestion**: Upload PDFs which are instantly parsed, chunked, and embedded into a vector database.
-   **💬 Contextual AI Chat**: Chat with your documents using Google's Gemini Pro AI. The system recalls relevant information to provide accurate answers with citations.
-   **🔐 Secure Authentication**: Full user authentication system (Login/Signup) with JWT and Google OAuth support.
-   **🎨 Premium UI/UX**: A responsive, dark-mode interface with glassmorphism effects, smooth framer-motion animations, and a "Deep Space" aesthetic.
-   **👤 User Profiles**: Manage your profile, view upload history, and update personal details.
-   **☁️ Cloud-Ready**: Designed for easy deployment on Render (Backend) and Vercel (Frontend).

## 🛠️ Tech Stack

### Frontend (Client)
-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS, Vanilla CSS
-   **Animations**: Framer Motion
-   **Icons**: Lucide React
-   **HTTP Client**: Axios (interceptor-based)
-   **Routing**: React Router DOM v6

### Backend (Server)
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (User data), Pinecone (Vector data)
-   **AI/LLM**: Google Gemini Pro (via LangChain)
-   **Embeddings**: Google Generative AI Embeddings
-   **Auth**: Passport.js, JWT, Google OAuth 2.0
-   **File Handling**: Multer, PDF-Parse

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   MongoDB URI
-   Pinecone API Key & Index
-   Google Gemini API Key
-   Google OAuth Credentials (for social login)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Furqantech1/SecondBrain.git
    cd SecondBrain
    ```

2.  **Server Setup**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    
    # AI & Vector DB
    GEMINI_API_KEY=your_gemini_api_key
    PINECONE_API_KEY=your_pinecone_api_key
    PINECONE_INDEX_NAME=your_index_name
    
    # OAuth (Optional)
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    CLIENT_URL=http://localhost:5173
    ```
    Start the server:
    ```bash
    npm run dev
    ```

3.  **Client Setup**
    ```bash
    cd ../client
    npm install
    ```
    Create a `.env` file in the `client` directory (optional for dev, required for prod if URL changes):
    ```env
    VITE_API_URL=http://localhost:5000
    ```
    Start the frontend:
    ```bash
    npm run dev
    ```

4.  **Access the App**
    Open `http://localhost:5173` in your browser.

## 📂 Project Structure

```
SecondBrain/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/           # Centralized Axios config
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth Context
│   │   ├── pages/         # Application Views (Dashboard, Login, etc.)
│   │   └── ...
│   └── ...
├── server/                 # Node.js Backend
│   ├── config/            # DB & Passport config
│   ├── controllers/       # Route Logic
│   ├── models/            # Mongoose Models
│   ├── routes/            # API Endpoints
│   ├── services/          # Business Logic (AI, Email, Pinecone)
│   └── ...
└── README.md              # Documentation
```

## 🔒 Security

-   Passwords are hashed using `bcryptjs`.
-   JWTs are used for stateless authentication.
-   API endpoints are protected via middleware.
-   Social login uses secure OAuth 2.0 flows.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
**Second Brain** &copy; 2026 All rights reserved.
