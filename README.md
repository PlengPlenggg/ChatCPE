# Chat CPE

Web-based chatbot system for CPE users. The project includes a React frontend, a FastAPI backend, and PostgreSQL.

## Tech Stack

- Frontend: React 18, TypeScript, Vite
- Backend: FastAPI, SQLAlchemy
- Database: PostgreSQL 15
- Deployment: Docker Compose

## Project Structure

```text
web-chatcpe/
  backend/
    app/
      api/
        auth.py
        chat.py
        documents.py
        faq.py
        files.py
      models/
        database.py
        models.py
        schemas.py
      services/
        pdf_processor.py
      __init__.py
      config.py
      main.py
    uploaded_files/
    Dockerfile
    requirements.txt
  frontend/
    public/
      images/
    src/
      components/
        AdminDashboard.tsx
        AdminUserManagementModal.tsx
        DocumentsPage.tsx
        EditProfileModal.tsx
        FAQsAccordion.tsx
        ForgotPasswordModal.tsx
        HomeAi.tsx
        LoggedInPage.tsx
        LogoutConfirmModal.tsx
        ManageDocumentPage.tsx
        ProfileModal.tsx
        SignInModal.tsx
        SignUpModal.tsx
      hooks/
        useResponsiveLayout.ts
      pages/
        Home.tsx
        ResetPasswordPage.tsx
      services/
        api.ts
        responsive.ts
      styles/
        commonStyles.ts
        global.css
        responsive.css
      App.tsx
      main.tsx
    Dockerfile
    index.html
    package.json
    tsconfig.json
    tsconfig.node.json
    vite.config.ts
  docker-compose.yml
  README.md
  set_admin.sql
```

## Quick Start (Docker)

### Prerequisites

- Docker
- Docker Compose

### Run

```bash
docker compose build
docker compose up -d
```

### Access

- Frontend: http://localhost:8080
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Main Features

- User registration and login
- Chat with AI service integration
- Chat history for logged-in users
- FAQ page
- Document listing/download page
- Admin dashboard for user and analytics management
- CSV export for chat logs

## Main API Groups

- /auth
- /chat
- /documents
- /faq

## Environment Notes

The Docker setup defines runtime environment variables in docker-compose.yml, including database connection, base URLs, and email settings.

## Deployment

Typical deployment flow:

1. Update source code on server
2. Rebuild changed services with Docker Compose
3. Restart services and verify status

Example:

```bash
docker compose up -d --build --no-deps frontend
docker compose up -d --build --no-deps backend
docker compose ps
```

## Troubleshooting

### Containers fail to start

```bash
docker compose logs -f
docker compose down
docker compose up -d --build
```

### Backend cannot connect to database

- Check PostgreSQL container status
- Check DATABASE_URL configuration
- Confirm port 5432 is available

## License

This project is developed for a CPE senior project.
