/*  DEMO AUTH SCRIPT
    1. Fake OAuth on login.html
    2. Guard dashboard.html
    3. Provide logout
*/

// ------------------------------
// 1.  UTILITY
// ------------------------------
const STORAGE_KEY = 'botnest_user';

function saveUser(userObj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
}

function getUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function removeUser() {
  localStorage.removeItem(STORAGE_KEY);
}

// ------------------------------
// 2.  LOGIN PAGE HANDLER
// ------------------------------
if (location.pathname.endsWith('login.html')) {
  document.getElementById('fake-login-btn').addEventListener('click', () => {
    // In real life you’d redirect to:
    // window.location = `https://discord.com/api/oauth2/authorize?client_id=...`;
    // For demo we just fake the response
    const fakeUser = {
      id: '123456789',
      username: 'DemoUser',
      avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
      token: 'demo_token_abc123'
    };
    saveUser(fakeUser);
    window.location.replace('dashboard.html');
  });
}

// ------------------------------
// 3.  DASHBOARD GUARD + UI
// ------------------------------
if (location.pathname.endsWith('dashboard.html')) {
  const user = getUser();
  if (!user) {
    // Not logged in
    window.location.replace('login.html');
  }

  // Show username + avatar
  const badge = document.getElementById('user-badge');
  badge.innerHTML = `
    <img src="${user.avatar}" alt="" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:.5rem">
    ${user.username}
  `;

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    removeUser();
    window.location.replace('index.html');
  });
}
// ---------------------------------
// 3.  GLOBAL NAV + SESSION
// ---------------------------------
async function fetchUser() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (res.ok) return res.json();
  } catch {}
  return null;
}

function updateNav(user) {
  const pill   = document.getElementById('user-pill');
  const avatar = document.getElementById('user-avatar');
  const name   = document.getElementById('user-name');
  const btn    = document.getElementById('auth-btn');

  if (user) {
    pill.style.display = 'flex';
    avatar.src = user.avatar;
    name.textContent = user.username;
    btn.textContent = 'Logout';
    btn.href = '#';
    btn.onclick = async (e) => {
      e.preventDefault();
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      location.reload();
    };
  } else {
    pill.style.display = 'none';
    btn.textContent = 'Get Started';
    btn.href = '/html/login.html';
  }
}

// run on every page
fetchUser().then(updateNav);