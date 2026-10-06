 import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);

useEffect(() => {
  fetch("http://localhost:5000/api/tasks")
    .then((response) => response.json())
    .then((data) => {
      setTasks(data);
    })
    .catch((error) => {
      console.error("Error fetching tasks:", error);
    });
}, []);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("College");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");
  const [search, setSearch] = useState("");

  // AI Assistant
  const [aiInput, setAiInput] = useState("");
  const [aiMessage, setAiMessage] = useState(
    "Tell me what you need to get done and I'll turn it into a task."
  );
 const addTask = async () => {
  if (!title.trim()) return;

  const newTask = {
    id: Date.now(),
    title: title.trim(),
    category,
    priority,
    status,
    isAI: false,
  };

  try {
    const response = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });

    if (!response.ok) {
      throw new Error("Failed to add task");
    }

    const savedTask = await response.json();

    setTasks((prev) => [...prev, savedTask]);
    setTitle("");
    setCategory("College");
    setPriority("Medium");
    setStatus("Pending");
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

const deleteTask = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete task");
    }

    setTasks((prev) => prev.filter((task) => task.id !== id));
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};
  const updateStatus = (id, newStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )   
    );
  };

  // Smart task generation
const generateAITask = async () => {
  const text = aiInput.trim();

  if (!text) {
    setAiMessage("Please describe a task first.");
    return;
  }

  try {
    setAiMessage("AI is creating your task...");

    // Ask our backend AI endpoint to understand the request
    const aiResponse = await fetch("http://localhost:5000/api/ai-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: text,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI request failed");
    }

    const aiTask = await aiResponse.json();

    // Give the task an ID before saving it
    const newTask = {
      id: Date.now(),
      title: aiTask.title,
      category: aiTask.category,
      priority: aiTask.priority,
      status: "Pending",
      isAI: true,
    };

    // Save the AI-generated task to SQLite
    const saveResponse = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });

    if (!saveResponse.ok) {
      throw new Error("Failed to save AI task");
    }

    const savedTask = await saveResponse.json();

    setTasks((prev) => [savedTask, ...prev]);

    setAiMessage(
      `AI created your task! Category: ${savedTask.category} • Priority: ${savedTask.priority}`
    );

    setAiInput("");
  } catch (error) {
    console.error("AI task error:", error);
    setAiMessage("Sorry, I couldn't create the task. Please try again.");
  }
};

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.category.toLowerCase().includes(search.toLowerCase())
  );

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const pending = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div>
          <h1>AI Task Manager</h1>
          <p>
            Organize your work, track progress and manage tasks intelligently.
          </p>
        </div>
      </header>

      <main className="container">
        {/* AI Assistant */}
        <section className="ai-card">
          <div className="ai-heading">
            <div className="ai-icon">✦</div>

            <div>
              <h2>AI Task Assistant</h2>
              <p>
                Describe your task naturally and let the assistant organize it.
              </p>
            </div>
          </div>

          <div className="ai-input-row">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  generateAITask();
                }
              }}
              placeholder="e.g. Finish my project report tomorrow..."
            />

            <button onClick={generateAITask}>✦ Create with AI</button>
          </div>

          <div className="ai-message">
            {aiMessage}
          </div>
        </section>

        {/* Statistics */}
        <section className="stats">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <strong>{tasks.length}</strong>
          </div>

          <div className="stat-card">
            <h3>Pending</h3>
            <strong>{pending}</strong>
          </div>

          <div className="stat-card">
            <h3>In Progress</h3>
            <strong>{inProgress}</strong>
          </div>

          <div className="stat-card">
            <h3>Completed</h3>
            <strong>{completed}</strong>
          </div>
        </section>

        {/* Manual task creation */}
        <section className="form-card">
          <h2>Add New Task</h2>

          <div className="form-grid">
            <input
              type="text"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>College</option>
              <option>Career</option>
              <option>Personal</option>
              <option>Other</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>

            <button onClick={addTask}>+ Add Task</button>
          </div>
        </section>

        {/* Tasks */}
        <section className="tasks-section">
          <div className="task-header">
            <h2>My Tasks</h2>

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty">No tasks found.</div>
            ) : (
              filteredTasks.map((task) => (
                <div className="task-card" key={task.id}>
                  <div className="task-info">
                    <h3>{task.title}</h3>

                    <div className="tags">
                      <span>{task.category}</span>

                      <span
                        className={`priority ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>

                      {Boolean(task.isAI) && (
                        <span className="ai-badge">✦ AI Generated</span>
                      )}
                    </div>
                  </div>

                  <div className="task-actions">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        updateStatus(task.id, e.target.value)
                      }
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>

                    <button
                      className="delete"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;