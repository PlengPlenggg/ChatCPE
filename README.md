# Web Chatbot Project

This project is a web-based chatbot application that utilizes a self-trained language model (LLM) to answer user queries. The application features a user-friendly interface built with React for the frontend and a FastAPI backend. It includes user authentication, chat history saving, and the ability to upload and process PDF files.

## Project Structure

```
web-chatbot
├── frontend
│   ├── src
│   │   ├── components
│   │   │   ├── Chat.tsx
│   │   │   ├── Login.tsx
│   │   │   └── FileUpload.tsx
│   │   ├── pages
│   │   │   ├── Home.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── services
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend
│   ├── app
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   └── files.py
│   │   ├── models
│   │   │   ├── __init__.py
│   │   │   ├── database.py
│   │   │   └── schemas.py
│   │   ├── services
│   │   │   ├── __init__.py
│   │   │   ├── llm.py
│   │   │   └── pdf_processor.py
│   │   └── config.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Features

- **User Authentication**: Secure login functionality to manage user sessions.
- **Chat Interface**: Interactive chat component that communicates with the LLM model.
- **Chat History**: Users can view their chat history after logging in.
- **PDF Upload**: Functionality to upload PDF files for processing and interaction with the LLM.
- **Docker Support**: The application can be easily deployed using Docker.

## Setup Instructions

1. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd web-chatbot
   ```

2. **Frontend Setup**:
   - Navigate to the `frontend` directory.
   - Install dependencies:
     ```
     npm install
     ```
   - Start the development server:
     ```
     npm run dev
     ```

3. **Backend Setup**:
   - Navigate to the `backend` directory.
   - Install dependencies:
     ```
     pip install -r requirements.txt
     ```
   - Start the FastAPI server:
     ```
     uvicorn app.main:app --reload
     ```

4. **Docker Setup**:
   - Ensure Docker is installed and running.
   - Build and run the application using Docker Compose:
     ```
     docker-compose up --build
     ```

## Usage

- Access the application through your web browser at `http://localhost:3000`.
- Use the login page to authenticate and access the chat interface.
- Upload PDF files and interact with the chatbot to get responses based on the content of the files.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

ตั้ง role ให้ผู้ใช้บน Postgres ใน Docker ทำได้ดังนี้:

1.เข้า psql ในคอนเทนเนอร์ db

  ถ้าใช้ docker compose:
  docker compose exec db psql -U tesrtuser -d chatcpe_db

2.อัปเดต role ให้ผู้ใช้ที่ต้องการ (แทนอีเมลตามจริง)

  ตั้งเป็น admin:
  UPDATE users SET role='admin' WHERE email='someone@example.com';

  ตั้งเป็น staff:
  UPDATE users SET role='staff' WHERE email='someone@example.com';

3.ตรวจสอบผล
SELECT id, email, role FROM users;

4.ออก psql
  \q