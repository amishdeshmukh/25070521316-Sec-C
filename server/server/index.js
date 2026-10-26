const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Compass
const MONGO_URI = "mongodb://127.0.0.1:27017/flexi_25070521316";
mongoose
	.connect(MONGO_URI)
	.then(() => console.log("MongoDB Connected Successfully"))
	.catch((err) => console.error("MongoDB Connection Error:", err));

// Database Models
const User = mongoose.model(
	"User",
	new mongoose.Schema({
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
	})
);

const Song = mongoose.model(
	"Song",
	new mongoose.Schema({
		title: { type: String, required: true },
		artist: { type: String, required: true },
		genre: { type: String, required: true },
		rating: { type: Number, default: 5 },
	})
);

// Auth Routes (Signup & Login)
app.post("/api/auth/signup", async (req, res) => {
	try {
		const { name, email, password } = req.body;
		const exists = await User.findOne({ email });
		if (exists) return res.status(400).json({ message: "Email already exists" });
		const user = await User.create({ name, email, password });
		res.status(201).json({ user: { name: user.name, email: user.email } });
	} catch (err) {
		res.status(500).json({ message: "Signup error" });
	}
});

app.post("/api/auth/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email, password });
		if (!user) return res.status(401).json({ message: "Invalid email or password" });
		res.status(200).json({ user: { name: user.name, email: user.email } });
	} catch (err) {
		res.status(500).json({ message: "Login error" });
	}
});

// CRUD Routes (GET, POST, PUT, DELETE)
app.get("/api/songs", async (req, res) => {
	const songs = await Song.find();
	res.json(songs);
});

app.post("/api/songs", async (req, res) => {
	const song = await Song.create(req.body);
	res.status(201).json(song);
});

app.put("/api/songs/:id", async (req, res) => {
	const updated = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.json(updated);
});

app.delete("/api/songs/:id", async (req, res) => {
	await Song.findByIdAndDelete(req.params.id);
	res.json({ message: "Deleted" });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
