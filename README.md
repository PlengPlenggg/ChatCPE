# Chat CPE

Web-based chatbot system for CPE users. The project has a React frontend, a FastAPI backend, and PostgreSQL database support.

## Tech Stack

- Frontend: React 18, TypeScript, Vite
- Backend: FastAPI, SQLAlchemy, Uvicorn
- Database: PostgreSQL 15
- Deployment: Docker Compose

## Project Structure

```text
web-chatcpe/
  backend/
    app/
      __init__.py
      api/
        __init__.py
        auth.py
        chat.py
        documents.py
        faq.py
        files.py
      models/
        __init__.py
        database.py
        models.py
        schemas.py
      services/
        __init__.py
        pdf_processor.py
      config.py
      main.py
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

## Main Features

- User registration, login, logout, profile update, forgot password, and reset password
- AI chat with conversation context and thread history
- FAQ management and FAQ display page
- Document forms listing and download page
- PDF upload and training file management
- Admin dashboard for user management and chat analytics
- CSV export for chat logs
- Responsive UI for desktop and mobile

## Backend Overview

- `app/main.py` starts the FastAPI app, sets CORS, creates database tables, and seeds sample FAQs
- `app/api/auth.py` handles authentication and user management
- `app/api/chat.py` handles chat requests, history, thread deletion, analytics, and CSV export
- `app/api/faq.py` handles FAQ data
- `app/api/documents.py` serves registrar form data with scraping fallback
- `app/api/files.py` handles training file upload and file categories
- `app/models/models.py` defines database tables for users, files, OCR results, chunks, embeddings, chats, answers, and FAQs
- `app/services/pdf_processor.py` processes uploaded PDF content

## Frontend Overview

- `src/services/api.ts` contains the API client and all frontend requests
- `src/components/HomeAi.tsx` is the public chat page
- `src/components/LoggedInPage.tsx` is the authenticated chat page
- `src/components/DocumentsPage.tsx` shows document forms
- `src/components/AdminDashboard.tsx` shows analytics and CSV export
- `src/components/*Modal.tsx` contains login, register, profile, password, and admin modals
- `src/pages/Home.tsx` and `src/pages/ResetPasswordPage.tsx` provide page-level routes

## API Groups

- `/auth`
- `/chat`
- `/faq`
- `/documents`
- `/files`

## Quick Start With Docker

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
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment Notes

The main runtime values are defined in `docker-compose.yml`, including:

- `DATABASE_URL`
- `APP_BASE_URL`
- `BACKEND_BASE_URL`
- `RAG_SERVICE_URL`
- SMTP settings for email features

The frontend API base URL can also be overridden with `VITE_API_BASE_URL`.

## Deployment

Typical deployment flow:

1. Update the source code on the server
2. Rebuild the frontend and backend containers
3. Restart the services and verify the containers

Example:

```bash
docker compose up -d --build frontend backend
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

- Check that the PostgreSQL container is running
- Verify `DATABASE_URL`
- Confirm port 5432 is available

### Frontend cannot reach backend

- Check `VITE_API_BASE_URL`
- Check CORS settings in `app/main.py`
- Verify the backend container is running on port 8000

## License

This project is developed for a CPE senior project.
