// /js/auth.js

fetch('/api/me')
  .then(res => {
    if (!res.ok) throw new Error('Not logged in');
    return res.json();
  })
  .then(user => {
    const badge = document.getElementById('user-badge');
    badge.innerHTML = `
      <img src="${user.avatar}" alt="avatar" class="avatar">
      <span>${user.username}</span>
    `;
  })
  .catch(() => {
    window.location.href = '/html/login.html';
  });

document.getElementById('logout-btn')?.addEventListener('click', () => {
  fetch('/api/logout', { method: 'POST' })
    .then(() => {
      window.location.href = '/html/login.html';
    });
});
