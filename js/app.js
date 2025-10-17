const btn = document.getElementById('connect-btn');
const statusText = document.getElementById('status-text');
const themeSwitch = document.getElementById('themeSwitch');

let connected = false;

btn.addEventListener('click', () => {
  connected = !connected;
  if (connected) {
    statusText.textContent = 'Status: Connected ✅';
    btn.textContent = 'Disconnect';
    btn.style.background = '#e74c3c';
  } else {
    statusText.textContent = 'Status: Disconnected ❌';
    btn.textContent = 'Connect';
    btn.style.background = '#008080';
  }
});

themeSwitch.addEventListener('change', () => {
  document.body.classList.toggle('dark');
});
