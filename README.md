# 💬 Chat CPE - Web-based Chatbot Application

A modern web-based chatbot application for KMUTT CPE (Cooperative Program in Engineering) that enables students and staff to interact with an AI assistant, access FAQ, and download important documents.

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-latest-green) ![Python](https://img.shields.io/badge/Python-3.9-blue) ![Docker](https://img.shields.io/badge/Docker-Compose-blue)

---

## 🚀 Features

### 🤖 AI Chat
- Real-time conversations with OpenWebUI LLM integration
- Persistent chat history with separate threads for different conversations
- Guest mode support for unauthenticated users
- Mock response fallback when LLM is unavailable

### 👤 User Authentication
- Email-based registration and login
- KMUTT email domain validation (`@mail.kmutt.ac.th`)
- JWT token-based authentication
- Secure password hashing with Argon2
- User profile management

### 📄 FAQ System
- Interactive FAQ accordion with categorized questions and answers
- Quick access to common questions

### 📋 Documents Management
- Web scraper for KMUTT registrar forms
- View and download important forms and documents
- Auto-generated from https://regis.kmutt.ac.th/web/form/

### 💾 Chat History
- Save chat messages and AI responses to database
- Separate conversation threads
- Reload history after page refresh or re-login
- Delete individual conversations

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework with TypeScript
- **Vite** - Fast build tool
- **Fetch API** - HTTP client
- **CSS-in-JS** - Inline styles for component styling

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL 15** - Relational database
- **SQLAlchemy** - ORM for database operations
- **JWT (python-jose)** - Token-based authentication
- **Argon2** - Password hashing
- **BeautifulSoup4** - Web scraping for documents
- **Requests** - HTTP client for LLM integration

### Infrastructure
- **Docker & Docker Compose** - Containerization and orchestration
- **OpenWebUI** - LLM provider (external service)

---

## 📦 Project Structure

```
web-chatcpe/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── HomeAi.tsx              # Guest chat interface
│   │   │   ├── LoggedInPage.tsx        # Authenticated user dashboard
│   │   │   ├── SignInModal.tsx         # Login modal
│   │   │   ├── SignUpModal.tsx         # Registration modal
│   │   │   ├── DocumentsPage.tsx       # Documents listing
│   │   │   ├── FAQsAccordion.tsx       # FAQ component
│   │   │   ├── ProfileModal.tsx        # User profile view
│   │   │   ├── EditProfileModal.tsx    # Profile edit
│   │   │   └── LogoutConfirmModal.tsx  # Logout confirmation
│   │   ├── pages/
│   │   │   └── Home.tsx               # Main landing page
│   │   ├── services/
│   │   │   └── api.ts                 # API service layer
│   │   ├── styles/
│   │   │   └── global.css             # Global styles
│   │   ├── App.tsx                    # Main app component
│   │   └── main.tsx                   # React entry point
│   ├── public/
│   │   └── images/                    # Icon and image assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/                  # API endpoints
│   │   │   ├── auth.py           # Authentication (register, login, profile)
│   │   │   ├── chat.py           # Chat messages and LLM integration
│   │   │   ├── documents.py      # Document scraping
│   │   │   ├── faq.py            # FAQ management
│   │   │   └── files.py          # File upload handling
│   │   ├── models/               # Database models
│   │   │   ├── models.py         # SQLAlchemy models (User, Chat, FAQ, etc.)
│   │   │   ├── schemas.py        # Pydantic request/response schemas
│   │   │   └── database.py       # Database connection setup
│   │   ├── services/             # Business logic
│   │   │   ├── llm.py            # LLM integration service
│   │   │   └── pdf_processor.py  # PDF processing
│   │   ├── config.py             # Configuration management
│   │   └── main.py               # FastAPI app initialization
│   ├── requirements.txt           # Python dependencies
│   ├── Dockerfile
│   └── uploaded_files/           # Storage for user uploads
│
├── docker-compose.yml        # Docker compose configuration
└── README.md                 # This file
```

---

## 🏃 Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Git for cloning the repository
- Port 8080 (frontend), 8000 (backend), 5432 (database) available

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web-chatcpe
   ```

2. **Build and start containers**
   ```bash
   docker compose build
   docker compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📖 API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get current user profile (authenticated)
- `PUT /auth/profile` - Update user profile (authenticated)
- `POST /auth/logout` - User logout

### Chat (`/chat`)
- `POST /chat/send` - Send message to LLM
- `GET /chat/history` - Get user's chat history with threads (authenticated)
- `DELETE /chat/history` - Delete all chat history (authenticated)
- `POST /chat/threads/create` - Create new chat thread (authenticated)

### Documents (`/documents`)
- `GET /documents/forms` - Get list of registrar forms

### FAQ (`/faq`)
- `GET /faq` - Get all FAQs

---

## 🔐 Authentication & Authorization

- JWT token-based authentication
- Access tokens stored in localStorage on frontend
- Automatic token refresh on re-login
- Password hashing with Argon2 (backward compatible with bcrypt)
- Email validation: only `@mail.kmutt.ac.th` emails allowed

---

## 💬 Chat System

### Guest Users
- Can send messages without login
- Responses are not saved to database
- No chat history persistence

### Authenticated Users
- Chat messages and responses are saved to database
- Each conversation is in a separate **thread** with unique `thread_id`
- Thread titles auto-generated from first message
- Click "New Chat" to start fresh thread
- Refresh page to reload all chat threads
- Delete individual threads from chat history sidebar

### LLM Integration
- Primary: OpenWebUI API (external service)
- Fallback: Mock responses when LLM unavailable
- Timeout: 5 seconds per request

---

## 🗂 Database Schema

### Users Table
- `id` (Primary Key)
- `name` (String)
- `email` (String, Unique)
- `hashed_password` (String)
- `role` (String, default: "user")
- `created_at` (DateTime)

### Chat Table
- `id` (Primary Key)
- `user_id` (Foreign Key → Users)
- `thread_id` (String) - Groups messages into separate conversations
- `message` (Text)
- `created_at` (DateTime)

### Answer Table
- `id` (Primary Key)
- `chat_id` (Foreign Key → Chat)
- `llm_provider` (String)
- `answer` (Text)
- `created_at` (DateTime)

### FAQ Table
- `id` (Primary Key)
- `question` (Text)
- `answer` (Text)
- `category` (String, nullable)
- `display_order` (Integer)
- `is_active` (Boolean)
- `created_at`, `updated_at` (DateTime)

---

## 🐛 Troubleshooting

### Containers not starting
```bash
# Check container logs
docker compose logs -f

# Rebuild containers
docker compose down -v
docker compose build
docker compose up -d
```

### Database connection errors
- Ensure PostgreSQL container is running: `docker ps`
- Check database URL in backend configuration
- Verify port 5432 is not in use

### OpenWebUI not responding
- Check VPN connection to 10.35.29.103 (for KMUTT users)
- Verify OPENWEBUI_URL configuration
- System will use mock responses as fallback

### Frontend not loading
- Clear browser cache (Ctrl+Shift+Delete)
- Check frontend container logs: `docker logs web-chatcpe-frontend-1`
- Ensure port 8080 is not in use

### Registration fails with email domain error
- Only `@mail.kmutt.ac.th` emails are allowed
- Check email format: `user@mail.kmutt.ac.th`

---

## 🚀 Deployment

### Production Deployment
1. Update environment variables for production
2. Set `DEBUG=false` and use strong `SECRET_KEY`
3. Configure OpenWebUI URL if using external LLM
4. Set up HTTPS/SSL certificates
5. Use environment-specific database URL
6. Deploy using Docker Compose or Kubernetes

### Scale Considerations
- Use connection pooling for database
- Configure load balancer for multiple backend instances
- Use reverse proxy (nginx) for frontend distribution
- Implement caching for FAQ and documents

---

## 📝 Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Code Standards
- Follow React best practices with hooks
- Use TypeScript for type safety
- Use FastAPI async/await for performance
- Add docstrings to Python functions
- Maintain RESTful API design

---

## 💡 Key Features Explained

### Chat Thread System
Each conversation is stored with a unique `thread_id`, allowing users to:
- Have multiple independent conversations
- Each with separate message history
- Switch between threads without losing messages
- Delete specific conversations while keeping others

### Web Scraping
Documents are automatically scraped from KMUTT registrar website and displayed in a table format with download functionality.

### User Roles
Users can have different roles (admin, staff, user) for future access control and permissions management.

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a pull request

---

## 📄 License

This project is developed for KMUTT CPE program.

---

## 👥 Team

Developed for Cooperative Program in Engineering - King Mongkut's University of Technology Thonburi (KMUTT)

---

## 📞 Support

For issues or questions, please contact the development team or create an issue in the repository.

---

**Last Updated:** February 4, 2026  
**Version:** 1.0.0