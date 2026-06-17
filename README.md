# Second Brain 🧠
### AI-Powered RAG Document Intelligence Platform

> Upload any PDF. Ask anything. Get precise, cited answers — powered by Google Gemini and Pinecone vector search.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-000000?style=flat)
![Gemini](https://img.shields.io/badge/Google-Gemini_2.0-4285F4?style=flat&logo=google)

---

## What is Second Brain?

Second Brain is a full-stack **Retrieval-Augmented Generation (RAG)** application that lets you have intelligent, context-aware conversations with your PDF documents. Upload a research paper, legal contract, or technical manual — then ask questions in plain English and receive accurate answers with exact source citations pulled directly from your documents.

Built with a decoupled client-server architecture, every document is privately isolated per user, ensuring your data never bleeds into another user's context.

---

## Features

- **Context-Aware Q&A** — Ask natural language questions against any uploaded PDF and receive answers grounded in the document's actual content, not hallucinated responses
- **Source Citations** — Every AI response includes deduplicated source references showing exactly which chunk of which document the answer was derived from
- **Multi-Document Support** — Upload and index multiple PDFs; query a single document or search across your entire library
- **Secure Multi-Tenant Isolation** — Every vector stored in Pinecone is tagged with a user ID filter, ensuring zero cross-user data leakage
- **Google OAuth 2.0** — One-click sign-in via Google; no password required
- **Real-Time Processing Feedback** — Drag-and-drop upload with live status tracking through each pipeline stage: reading → chunking → embedding → indexing
- **Markdown Rendering** — AI responses render with full Markdown support including tables, headers, bold, and code blocks
- **Automated Email Alerts** — Welcome emails on signup and security alerts on login via Nodemailer

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | Core UI framework and build tooling |
| React Router DOM v6 | Client-side routing with protected route wrappers |
| Tailwind CSS | Utility-first styling and design tokens |
| Framer Motion | Page transitions and micro-interaction animations |
| Axios | HTTP client with JWT Bearer token interceptors |
| React Markdown | Rendering LLM responses as formatted Markdown |
| Lucide React | Icon system |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server and middleware layer |
| MongoDB Atlas + Mongoose | User profiles, document metadata, ingestion history |
| Pinecone | Vector database for embedding storage and similarity search |
| Google Gemini 2.0 Flash | LLM for answer generation |
| Google Generative AI Embeddings (`gemini-embedding-001`) | Text-to-vector embedding model |
| LangChain | Text chunking via `RecursiveCharacterTextSplitter` |
| Passport.js | Google OAuth 2.0 authentication strategy |
| JSON Web Token (JWT) | Stateless session management (30-day expiry) |
| Multer | Multipart PDF upload handling and MIME validation |
| pdf-parse | Binary PDF buffer to plain text extraction |
| bcryptjs | Password hashing with salt factor 10 |
| Nodemailer | Transactional email (welcome + security alerts) |

---

## Architecture & Data Flow

### Document Ingestion Pipeline

```
User uploads PDF
      │
      ▼
Multer middleware (MIME validation: application/pdf only)
      │
      ▼
pdf-parse → extract raw text from binary buffer
      │
      ▼
LangChain RecursiveCharacterTextSplitter
(chunkSize: 1000 chars, chunkOverlap: 200 chars)
      │
      ▼
Google Generative AI Embeddings — gemini-embedding-001
(taskType: RETRIEVAL_DOCUMENT)
      │
      ▼
Pinecone upsert — vectors tagged with:
{ text, filename, user, documentId }
      │
      ▼
MongoDB Atlas — Document record saved
(user ref, filename, size, vectorId prefix, timestamps)
      │
      ▼
Temp file unlinked from server storage
```

### Query & Response Pipeline

```
User submits question
      │
      ▼
JWT verified by auth middleware
      │
      ▼
Query embedded — gemini-embedding-001
(taskType: RETRIEVAL_QUERY)
      │
      ▼
Pinecone similarity search — topK: 5
(filter: { user: req.user.id, documentId? })
      │
      ▼
Top 5 chunks compiled into context block
      │
      ▼
Prompt assembled with system instructions
+ context + user question
      │
      ▼
Google Gemini 2.0 Flash generates answer
(Promise.race timeout: 30s)
      │
      ▼
Sources deduplicated → JSON response
{ answer (Markdown), sources[] }
      │
      ▼
Client renders Markdown + citation chips
```

---

## Project Structure

```
SecondBrain/
├── client/
│   ├── src/
│   │   ├── api/                  # Axios config & JWT interceptors
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx      # Chat canvas & Markdown renderer
│   │   │   ├── FileUpload.jsx         # Drag-and-drop ingestion zone
│   │   │   ├── ProtectedRoute.jsx     # Auth route guard
│   │   │   ├── AuthLayout.jsx         # Shared auth screen wrapper
│   │   │   └── DeepSpaceBackground.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Global user session state
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx        # Marketing & product showcase
│   │   │   ├── Dashboard.jsx          # Document management hub
│   │   │   ├── Profile.jsx            # User profile & history
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── App.jsx                    # Route declarations + AnimatePresence
│   │   └── index.css                  # Design system tokens & global styles
│   ├── tailwind.config.js
│   └── package.json
│
└── server/
    ├── config/
    │   ├── db.js                  # MongoDB Atlas connection
    │   └── passport.js            # Google OAuth strategy
    ├── controllers/
    │   ├── chatController.js      # RAG query, embedding, Gemini call
    │   └── uploadController.js    # PDF parse, chunk, embed, upsert
    ├── middleware/
    │   └── auth.js                # JWT verify & user injection
    ├── models/
    │   ├── User.js                # User schema (OAuth + credentials)
    │   └── Document.js            # Document metadata schema
    ├── routes/
    │   ├── auth.js                # Auth, profile, avatar endpoints
    │   ├── chatRoutes.js          # POST /api/chat
    │   └── uploadRoutes.js        # POST /api/upload
    ├── services/
    │   ├── emailService.js        # Nodemailer transporter
    │   └── pineconeService.js     # Pinecone SDK client init
    └── server.js                  # App entry point
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Pinecone account (free tier works)
- Google Cloud project with Gemini API enabled
- Google OAuth 2.0 credentials (Client ID + Secret)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/second-brain.git
cd second-brain
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Configure environment variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/second-brain
JWT_SECRET=your_jwt_secret_key_here

# AI & Vector Settings
GEMINI_API_KEY=your_gemini_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=second-brain

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
CLIENT_URL=http://localhost:5173

# Email (optional for dev — Ethereal fallback is automatic)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Run the application

```bash
# Start the backend server (from /server)
npm run dev

# Start the frontend (from /client)
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5000`.

---

## Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| `email` | String | Required, unique |
| `password` | String | Optional — bcrypt hashed, salt factor 10 |
| `googleId` | String | Assigned via Google OAuth strategy |
| `username` | String | Optional profile field |
| `bio` | String | Optional |
| `profilePicture` | String | Static URL to uploaded avatar |
| `phoneNumber` | String | Optional |
| `location` | String | Optional |

### Document
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId | Reference to User model |
| `filename` | String | Original upload name |
| `fileType` | String | Default: `pdf` |
| `size` | Number | File size in bytes |
| `vectorId` | String | Pinecone namespace prefix |
| `createdAt` | Date | Auto-managed by Mongoose timestamps |

---

## Security

- **JWT Auth** — Stateless tokens signed with `JWT_SECRET`, 30-day expiry, verified on every protected route
- **Multi-Tenant Isolation** — Pinecone queries enforce `filter: { user: req.user.id }` — users can only retrieve their own vectors
- **File Validation** — Multer rejects any upload that isn't `application/pdf`; avatar uploads restricted to `image/*`
- **Password Security** — Plaintext passwords never stored; bcryptjs hashes with salt work factor 10 on pre-save hook
- **OAuth First** — Google OAuth is the primary auth path; credential-based login is the secondary fallback

---

## Email Notifications

| Event | Email Sent |
|---|---|
| New user signup | HTML welcome email |
| Successful login | Security alert with timestamp and IP |

In development, emails route to **Ethereal** (fake SMTP) automatically — preview links are logged to the console. In production, configure real SMTP credentials in `.env`.

---

## Roadmap

- [ ] Document library panel — list, switch, and delete indexed documents
- [ ] Saved highlights — bookmark AI responses to a personal notes drawer
- [ ] Cross-document queries — search across all user documents simultaneously
- [ ] Weekly digest email — AI-generated summary of your document library
- [ ] PDF viewer — side-by-side document and chat panel
- [ ] Shareable chat sessions

---

## License

MIT License — see [LICENSE](/LICENSE.md) for details.
