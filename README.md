# Web & AI Task Management Application

A full-stack task management application built with React, Node.js, Express, SQLite, and Google Gemini AI.

## Features

- Create, manage, and delete tasks
- Task categories: College, Career, Personal
- Priority levels: High, Medium, Low
- Task status tracking: Pending, In Progress, Completed
- Search tasks by title or category
- Dashboard statistics
- AI-powered task generation using Google Gemini
- AI automatically categorizes tasks and assigns priority
- SQLite database for persistent task storage
- REST API using Node.js and Express
- Responsive and user-friendly interface

## Tech Stack

### Frontend
- React
- JavaScript
- HTML
- CSS
- Vite

### Backend
- Node.js
- Express.js
- REST API
- SQLite

### AI
- Google Gemini API

### Development Tools
- Git
- GitHub
- VS Code

## Project Structure

```text
web-ai-task-manager/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── server/
    ├── server.js
    ├── package.json
    └── .gitignore
## How to Run

### Backend

Open a terminal and run:

```bash
cd server
npm install
node server.js
### Frontend

Open another terminal and run:

```bash
cd client
npm install
npm run dev
## Environment Variables

Create a `.env` file inside the `server` folder and add:

GEMINI_API_KEY=your_api_key_here

Never upload your `.env` file or API key to GitHub.

## API Endpoints

- GET `/api/tasks` — Fetch all tasks
- POST `/api/tasks` — Create a task
- PUT `/api/tasks/:id` — Update task status
- DELETE `/api/tasks/:id` — Delete a task
- POST `/api/ai-task` — Generate a task using AI

## Author

Jessica Gupta
