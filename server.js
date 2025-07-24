const fs       = require('fs');
const path     = require('path');
const express  = require('express');
const cookie   = require('cookie-parser');
const { v4: uuid } = require('uuid');

const app  = express();
const PORT = 3000;

const DB_FILE = path.join(__dirname, '.visitor-db.json');

// Load DB into memory
let db = {};
if (fs.existsSync(DB_FILE)) db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

// Save DB periodically
function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}
setInterval(saveDB, 30_000); // every 30 s

app.use(cookie());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------
// 1. Fake OAuth callback
app.get('/auth/callback', (req, res) => {
  const { code } = req.query;
  // In real life you’d exchange code for token
  const fakeUser = {
    id: uuid(),
    username: 'DemoUser-' + Math.random().toString(36).slice(-4),
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
    lastSeen: Date.now()
  };

  // Store by IP (or hashed IP)
  const ip = req.ip || req.connection.remoteAddress;
  db[ip] = { ...fakeUser, ip };

  // Set 3-day cookie
  res.cookie('bn_id', ip, {
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    httpOnly: true,
    sameSite: 'lax'
  });

  res.redirect('/public/html/dashboard.html');
});

// ---------------------------------
// 2. API: whoami
app.get('/api/me', (req, res) => {
  const ip = req.cookies.bn_id;
  const user = db[ip];
  if (!user) return res.status(401).json({ error: 'no_session' });
  user.lastSeen = Date.now();
  res.json({ username: user.username, avatar: user.avatar });
});

// ---------------------------------
// 3. Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('bn_id');
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});