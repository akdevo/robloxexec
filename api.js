const express = require('express');
const axios = require('axios');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5500', credentials: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const ROBLOX_API = "https://apis.roblox.com/";

app.post('/login', async (req, res) => {
    const { robloxToken } = req.body;
    
    try {
        const userResponse = await axios.get(`${ROBLOX_API}users/v1/authenticated-user`, {
            headers: { 'Authorization': `Bearer ${robloxToken}` }
        });
        
        req.session.user = userResponse.data;
        res.json({ success: true, user: userResponse.data });
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid token" });
    }
});

app.post('/execute', async (req, res) => {
    if (!req.session.user) return res.status(403).json({ success: false, message: "Not authenticated" });
    
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "No code provided" });
    
    try {
        const robloxResponse = await axios.post("http://your-roblox-server.com/execute", { code });
        res.json({ success: true, output: robloxResponse.data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Execution failed" });
    }
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
