const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

// ✅ Use Render-compatible MongoDB URI
const mongoURI = "mongodb+srv://amulyadeep7:TctwaHzGrNPuVYV8@autotalk.i6cmt8w.mongodb.net/AutoTalk?retryWrites=true&w=majority&appName=AutoTalk";

// ✅ Connect to MongoDB Atlas
mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected To MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ✅ Define Mongoose Schema
const workerSchema = new mongoose.Schema({
    name: String,
    roomNumber: String,
    uid: String,
    joinedAt: { type: Date, default: Date.now }
});
const Worker = mongoose.model('workers', workerSchema);

// ✅ Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000; // ✅ Use Render-assigned port

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static files (if needed)
app.use(express.static(path.join(__dirname)));

// ✅ Serve Meeting frontend
app.use('/Meeting', express.static(path.join(__dirname, 'Meeting')));
app.get('/Meeting', (req, res) => {
    res.sendFile(path.join(__dirname, 'Meeting', 'index.html'));
});

// ✅ API Endpoints
app.get('/', (req, res) => {
    res.send("🚀 AutoTalk Meeting API is Live");
});

app.post('/api/participants', async (req, res) => {
    try {
        const { name, roomNumber, uid } = req.body;
        if (!name || !roomNumber || !uid) {
            return res.status(400).json({ error: 'Name, Room Number, and UID are required' });
        }

        const newWorker = new Worker({ name, roomNumber, uid });
        await newWorker.save();
        res.status(201).json({ message: 'Participant Added Successfully', worker: newWorker });
    } catch (error) {
        console.error('Error Saving Participant:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/participant/:uid', async (req, res) => {
    try {
        const participant = await Worker.findOne({ uid: req.params.uid });
        if (!participant) {
            return res.status(404).json({ error: 'Participant Not Found' });
        }

        res.status(200).json({ name: participant.name });
    } catch (error) {
        console.error('Error Fetching Participant:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/participants/:uid', async (req, res) => {
    try {
        const result = await Worker.findOneAndDelete({ uid: req.params.uid });
        if (!result) {
            return res.status(404).json({ error: 'Participant Not Found' });
        }

        res.status(200).json({ message: 'Participant Removed Successfully' });
    } catch (error) {
        console.error('Error Removing Participant:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log("🚀 This Has Digital Rights");
    console.log("👨‍💻 Developer - Amulya Shrivastava");
    console.log(`✅ Server running at: http://localhost:${PORT}`);
});
