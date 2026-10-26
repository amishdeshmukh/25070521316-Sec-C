import React, { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000/api";

export default function App() {
	const [user, setUser] = useState(null);
	const [isLoginView, setIsLoginView] = useState(true);
	const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
	const [authError, setAuthError] = useState("");

	const [songs, setSongs] = useState([]);
	const [songForm, setSongForm] = useState({
		title: "",
		artist: "",
		genre: "Pop",
		rating: 5,
	});
	const [editingId, setEditingId] = useState(null);

	useEffect(() => {
		if (user) fetchSongs();
	}, [user]);

	const fetchSongs = async () => {
		const res = await fetch(`${API_BASE}/songs`);
		const data = await res.json();
		setSongs(data);
	};

	const handleAuthSubmit = async (e) => {
		e.preventDefault();
		setAuthError("");
		const endpoint = isLoginView ? "/auth/login" : "/auth/signup";
		try {
			const res = await fetch(`${API_BASE}${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(authForm),
			});
			const data = await res.json();
			if (!res.ok) return setAuthError(data.message || "Error");
			setUser(data.user);
		} catch (err) {
			setAuthError("Server not running! Start server & MongoDB Compass.");
		}
	};

	const handleSongSubmit = async (e) => {
		e.preventDefault();
		const url = editingId ? `${API_BASE}/songs/${editingId}` : `${API_BASE}/songs`;
		const method = editingId ? "PUT" : "POST";
		await fetch(url, {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(songForm),
		});
		setSongForm({ title: "", artist: "", genre: "Pop", rating: 5 });
		setEditingId(null);
		fetchSongs();
	};

	const handleEditClick = (song) => {
		setEditingId(song._id);
		setSongForm({
			title: song.title,
			artist: song.artist,
			genre: song.genre,
			rating: song.rating,
		});
	};

	const handleDeleteClick = async (id) => {
		await fetch(`${API_BASE}/songs/${id}`, { method: "DELETE" });
		fetchSongs();
	};

	if (!user) {
		return (
			<div className="auth-wrapper">
				<div className="auth-card">
					<h2>{isLoginView ? "Welcome Back" : "Create Account"}</h2>
					<p className="subtitle">FLEXI Music Hub • PRN: 25070521316</p>
					{authError && <div className="error-msg">{authError}</div>}
					<form onSubmit={handleAuthSubmit}>
						{!isLoginView && (
							<div className="form-group">
								<label>Full Name</label>
								<input
									type="text"
									required
									value={authForm.name}
									onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
								/>
							</div>
						)}
						<div className="form-group">
							<label>Email</label>
							<input
								type="email"
								required
								value={authForm.email}
								onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
							/>
						</div>
						<div className="form-group">
							<label>Password</label>
							<input
								type="password"
								required
								value={authForm.password}
								onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
							/>
						</div>
						<button type="submit" className="btn-primary">
							{isLoginView ? "Login" : "Sign Up"}
						</button>
					</form>
					<p className="toggle-text">
						{isLoginView ? "New user?" : "Already have an account?"}
						<span onClick={() => setIsLoginView(!isLoginView)}>
							{isLoginView ? "Create Account" : "Login"}
						</span>
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<nav className="navbar">
				<h1>🎵 FLEXI Music Hub (PRN: 25070521316)</h1>
				<div>
					<span>Welcome, <strong>{user.name}</strong></span>
					<button className="btn-logout" onClick={() => setUser(null)}>Logout</button>
				</div>
			</nav>

			<div className="dashboard-container">
				<div className="form-panel">
					<h3>{editingId ? "Update Track" : "Add New Track"}</h3>
					<form onSubmit={handleSongSubmit}>
						<div className="form-group">
							<label>Song Title</label>
							<input
								type="text"
								required
								value={songForm.title}
								onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
							/>
						</div>
						<div className="form-group">
							<label>Artist</label>
							<input
								type="text"
								required
								value={songForm.artist}
								onChange={(e) => setSongForm({ ...songForm, artist: e.target.value })}
							/>
						</div>
						<div className="form-group">
							<label>Genre</label>
							<select
								value={songForm.genre}
								onChange={(e) => setSongForm({ ...songForm, genre: e.target.value })}
							>
								<option value="Pop">Pop</option>
								<option value="K-Pop">K-Pop</option>
								<option value="Hip-Hop">Hip-Hop</option>
								<option value="Rock">Rock</option>
								<option value="Lo-Fi">Lo-Fi</option>
							</select>
						</div>
						<div className="form-group">
							<label>Rating (1-5)</label>
							<input
								type="number"
								min="1"
								max="5"
								required
								value={songForm.rating}
								onChange={(e) => setSongForm({ ...songForm, rating: Number(e.target.value) })}
							/>
						</div>
						<button type="submit" className="btn-primary">
							{editingId ? "Update (PUT)" : "Add Track (POST)"}
						</button>
					</form>
				</div>

				<div>
					<h3 style={{ marginBottom: "14px" }}>Library ({songs.length})</h3>
					<div className="songs-grid">
						{songs.map((song) => (
							<div className="song-card" key={song._id}>
								<span className="genre-badge">{song.genre}</span>
								<h4>{song.title}</h4>
								<p className="artist">{song.artist}</p>
								<p className="rating">{"⭐".repeat(song.rating)}</p>
								<div className="card-actions">
									<button className="btn-edit" onClick={() => handleEditClick(song)}>Edit</button>
									<button className="btn-delete" onClick={() => handleDeleteClick(song._id)}>Delete</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
