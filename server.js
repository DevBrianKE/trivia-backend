require("dotenv").config();
const express = require("express");
const fs = require("fs").promises;
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = "db.json";

app.use(express.json());
app.use(cors());

// ✅ Ensure db.json exists with initial structure
const ensureDB = async () => {
    try {
        await fs.access(DB_FILE);
    } catch (error) {
        await fs.writeFile(DB_FILE, JSON.stringify({ users: [] }, null, 2));
    }
};

// ✅ Read database function
const readDB = async () => {
    try {
        await ensureDB();
        const data = await fs.readFile(DB_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("❌ Error reading database:", error);
        return { users: [] };
    }
};

// ✅ Write to database function
const writeDB = async (data) => {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        console.log("✅ Database successfully updated!");
    } catch (error) {
        console.error("❌ Error writing to database:", error);
    }
};

// ✅ Save or Update User Score
app.post("/scores", async (req, res) => {
    const { username, score } = req.body;
    if (!username || score == null) return res.status(400).json({ error: "Invalid data" });

    const db = await readDB();
    if (!db.users) db.users = [];

    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
        user.score = Math.max(user.score, score);
    } else {
        db.users.push({ id: db.users.length + 1, username, score, preferences: {} });
    }
    await writeDB(db);
    res.json({ message: "Score updated!", user });
});

// ✅ Update User Preferences
app.patch("/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    const { theme } = req.body;

    const db = await readDB();
    if (!db.users) return res.status(500).json({ error: "Database error" });

    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (theme) user.preferences.theme = theme;
    await writeDB(db);
    res.json({ message: "Preferences updated!", user });
});

// ✅ Get Leaderboard
app.get("/leaderboard", async (req, res) => {
    const db = await readDB();
    if (!db.users) return res.status(500).json({ error: "Database error" });

    const leaderboard = db.users.slice().sort((a, b) => b.score - a.score);
    res.json({ leaderboard });
});

// ✅ Start the server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
