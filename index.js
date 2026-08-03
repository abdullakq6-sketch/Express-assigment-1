const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(process.cwd(), "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const DATA_FILE = process.env.VERCEL
  ? path.join("/tmp", "todos.json")
  : path.join(process.cwd(), "data", "todos.json");

function readTodos() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return raw ? JSON.parse(raw) : [];
}

function writeTodos(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

app.get("/", (req, res) => {
  const todos = readTodos();
  res.render("index", { todos });
});

app.post("/add", (req, res) => {
  const { task } = req.body;
  if (task && task.trim() !== "") {
    const todos = readTodos();
    const newTodo = {
      id: Date.now().toString(),
      task: task.trim(),
      status: false,
    };
    todos.push(newTodo);
    writeTodos(todos);
  }
  res.redirect("/");
});

app.post("/delete/:id", (req, res) => {
  const { id } = req.params;
  let todos = readTodos();
  todos = todos.filter((todo) => todo.id !== id);
  writeTodos(todos);
  res.redirect("/");
});

app.patch("/api/todos/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (typeof status !== "boolean") {
    return res.status(400).json({ success: false, message: "status must be true or false" });
  }

  const todos = readTodos();
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ success: false, message: "Todo not found" });
  }

  todo.status = status;
  writeTodos(todos);

  res.json({ success: true, todo });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});