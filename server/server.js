const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const { DatabaseSync } = require("node:sqlite");

const app = express();

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(cors());
app.use(express.json());

const db = new DatabaseSync("tasks.db");
try {
  db.exec("ALTER TABLE tasks ADD COLUMN isAI INTEGER DEFAULT 0");
} catch (error) {
  // Column already exists
}

// Create tasks table
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL
  )
`);

// Add sample tasks if database is empty
const taskCount = db
  .prepare("SELECT COUNT(*) AS count FROM tasks")
  .get();

if (taskCount.count === 0) {
  db.prepare(`
    INSERT INTO tasks (id, title, category, priority, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    1,
    "Complete project documentation",
    "College",
    "High",
    "Pending"
  );

  db.prepare(`
    INSERT INTO tasks (id, title, category, priority, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    2,
    "Prepare presentation",
    "College",
    "Medium",
    "In Progress"
  );
}

// Get all tasks
app.get("/api/tasks", (req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks").all();
  res.json(tasks);
});

// Add a new task
app.post("/api/tasks", (req, res) => {
  const newTask = req.body;

  const insert = db.prepare(`
  INSERT INTO tasks (id, title, category, priority, status, isAI)
  VALUES (?, ?, ?, ?, ?, ?)
`);

  insert.run(
  newTask.id,
  newTask.title,
  newTask.category,
  newTask.priority,
  newTask.status,
  newTask.isAI ? 1 : 0
);

  res.status(201).json(newTask);
});

// Update task status
app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const result = db
    .prepare("UPDATE tasks SET status = ? WHERE id = ?")
    .run(status, id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  res.json({
    message: "Task status updated successfully",
  });
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const result = db
    .prepare("DELETE FROM tasks WHERE id = ?")
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  res.json({
    message: "Task deleted successfully",
  });
});

// AI task generation
app.post("/api/ai-task", async (req, res) => {
  console.log("AI endpoint was called");

  try {
    const { prompt } = req.body;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash-lite",

      contents: `Turn the user's request into a clear and complete task.

Keep the important details from the user's request in the task title.
Do not make the title unnecessarily short.
If the user mentions a deadline, date, or time, keep that information in the title.

Return only a JSON object with these fields:
title, category, priority, status.

Category must be one of: College, Career, Personal.
Priority must be one of: High, Medium, Low.
Status must always be: Pending.

User request: ${prompt}`,

      config: {
        responseMimeType: "application/json",
      },
    });

    const task = JSON.parse(response.text);

    res.json(task);
  } catch (error) {
    console.error("AI error:", error);

    res.status(500).json({
      error: "AI task generation failed",
    });
  }
});

// Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});