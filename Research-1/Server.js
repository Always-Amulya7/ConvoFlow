//Integrating MongoDB

// const express = require("express");
// const path = require("path");
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const session = require("express-session");
// const mongoURI = "mongodb+srv://amulyadeep7:TctwaHzGrNPuVYV8@autotalk.i6cmt8w.mongodb.net/?retryWrites=true&w=majority&appName=AutoTalk";
// const app = express();
// const PORT = 3000;

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname)));
// app.use(
//   session({
//     secret: "your_secret_key",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false },
//   })
// );

// For Local Host

// mongoose
//   .connect("mongodb://127.0.0.1:27017/AutoTalk", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected To Mongo DataBase"))
//   .catch((err) => console.error("Mongo DataBase Connection Error:", err));

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// For Production

// /Research-1/Server.js

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const mongoURI = "mongodb+srv://amulyadeep7:TctwaHzGrNPuVYV8@autotalk.i6cmt8w.mongodb.net/AutoTalk?retryWrites=true&w=majority&appName=AutoTalk";

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: "secret_key",
  resave: false,
  saveUninitialized: true,
}));
app.use("/assets", express.static(path.join(__dirname, "assets")));
// Serve Static Files for each section
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/Login", express.static(path.join(__dirname, "Login")));
app.use("/", express.static(path.join(__dirname)));
app.use("/Meeting", express.static(path.join(__dirname, "Meeting")));
app.use("/admin", express.static(path.join(__dirname, "Admin Data")));
app.use("/author", express.static(path.join(__dirname, "Author Page")));

// MongoDB Connection
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

// Schemas
const User = mongoose.model("users", new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));

const Worker = mongoose.model("workers", new mongoose.Schema({
  name: String,
  roomNumber: String,
  uid: String,
  videoEnabled: { type: Boolean, default: true },
  audioEnabled: { type: Boolean, default: true },
  blocked: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
}));

const Admin = mongoose.model("admins", new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
}));

// Routes — Sign Up / Login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/Login", (req, res) => {
  res.sendFile(path.join(__dirname, "Login", "index.html"));
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    res.status(201).send({ message: "User Signed Up Successfully" });
  } catch (err) {
    res.status(400).send({ error: "Username Already Exists Or Invalid Data" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      req.session.username = user.username;
      res.status(200).send({ message: "Login Successful" });
    } else {
      res.status(401).send({ error: "Invalid Username Or Password" });
    }
  } catch (err) {
    res.status(500).send({ error: "Server Error" });
  }
});

app.get("/get-username", (req, res) => {
  if (req.session.username) {
    res.status(200).send({ username: req.session.username });
  } else {
    res.status(401).send({ error: "No User Logged In" });
  }
});

// Routes — Meeting Room
app.get("/Meeting", (req, res) => {
  res.sendFile(path.join(__dirname, "Meeting", "index.html"));
});

app.post("/api/participants", async (req, res) => {
  const { name, roomNumber, uid } = req.body;
  if (!name || !roomNumber || !uid) {
    return res.status(400).json({ error: "Name, Room Number, and UID are required" });
  }
  const newWorker = new Worker({ name, roomNumber, uid });
  await newWorker.save();
  res.status(201).json({ message: "Participant Added", worker: newWorker });
});

app.get("/api/participant/:uid", async (req, res) => {
  const participant = await Worker.findOne({ uid: req.params.uid });
  if (!participant) {
    return res.status(404).json({ error: "Participant Not Found" });
  }
  res.status(200).json({ name: participant.name });
});

app.delete("/api/participants/:uid", async (req, res) => {
  const result = await Worker.findOneAndDelete({ uid: req.params.uid });
  if (!result) {
    return res.status(404).json({ error: "Participant Not Found" });
  }
  res.status(200).json({ message: "Participant Removed" });
});

// Routes — Admin
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "Admin Data", "index.html"));
});

app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username, password });
  if (admin) {
    res.redirect("/admin/dashboard.html");
  } else {
    res.redirect("/admin");
  }
});

// Routes — Author
app.get("/author", (req, res) => {
  res.sendFile(path.join(__dirname, "Author Page", "admin.html"));
});

app.put("/api/participants/control", async (req, res) => {
  const { videoEnabled, audioEnabled } = req.body;
  if (videoEnabled !== undefined) await Worker.updateMany({}, { videoEnabled });
  if (audioEnabled !== undefined) await Worker.updateMany({}, { audioEnabled });
  res.status(200).json({ message: "Control Updated" });
});

app.put("/api/participants/kick/:uid", async (req, res) => {
  const result = await Worker.findOneAndDelete({ uid: req.params.uid });
  result
    ? res.status(200).json({ message: "Participant Kicked" })
    : res.status(404).json({ error: "Participant Not Found" });
});

app.put("/api/participants/block/:uid", async (req, res) => {
  const participant = await Worker.findOne({ uid: req.params.uid });
  if (!participant) return res.status(404).json({ error: "Participant Not Found" });
  participant.blocked = true;
  await participant.save();
  res.status(200).json({ message: "Participant Blocked" });
});

app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username, password });

  if (admin) {
    req.session.username = username;
    res.status(200).json({ message: "Login successful" }); // For fetch response
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log("🚀 AutoTalk is Live");
  console.log(`🌐 Visit: http://localhost:${PORT}`);
});
