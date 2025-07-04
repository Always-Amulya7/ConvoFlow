const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const app = express();

// ✅ MongoDB URI (AutoTalk database)
const mongoURI =
  "mongodb+srv://amulyadeep7:TctwaHzGrNPuVYV8@autotalk.i6cmt8w.mongodb.net/AutoTalk?retryWrites=true&w=majority&appName=AutoTalk";

// ✅ Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Define Admin schema and model
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});
const Admin = mongoose.model("admins", adminSchema);

// ✅ Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files (e.g., index.html, css, js)

// ✅ Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html")); // Entry point of Admin Panel
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username, password });

    if (admin) {
      // ✅ Redirect to dashboard or another internal page after login
      res.redirect("/dashboard.html");
    } else {
      res.redirect("/"); // Invalid credentials, reload login
    }
  } catch (error) {
    console.error("❌ Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/reset-password", (req, res) => {
  const { email } = req.body;
  console.log(`📧 Password reset requested for: ${email}`);
  res.send("<h1>Password Reset Instructions Sent To Your Email!</h1>");
});

// ✅ Use Render’s PORT environment variable
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Admin Panel running at https://convoflow.onrender.com`);
});
