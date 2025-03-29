const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(express.json()); // Middleware to parse JSON
app.use(cors()); // Allow frontend access

const DB_FILE = "db.json";

// Function to read database
const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, "utf8"));

// Function to write to database
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// ✅ 1. Save User Score (POST request)
app.post("/scores", (req, res) => {
    const { username, score } = req.body;
    if (!username || score == null) return res.status(400).json({ error: "Invalid data" });

    const db = readDB();
    const newUser = { id: db.users.length + 1, username, score, preferences: {} };
    db.users.push(newUser);
    writeDB(db);

    res.json({ message: "Score saved!", user: newUser });
});

// ✅ 2. Update User Preferences (PATCH request)
app.patch("/users/:id", (req, res) => {
    const userId = parseInt(req.params.id);
    const { theme } = req.body;

    const db = readDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (theme) user.preferences.theme = theme;
    writeDB(db);

    res.json({ message: "Preferences updated!", user });
});

// Start the server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
