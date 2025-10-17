// js/app.js
const API_URL = 'https://www.vpngate.net/api/iphone/';
const serverListEl = document.getElementById('server-list');
const statusConnectedServer = document.getElementById('connected-server');
const usageSummaryEl = document.getElementById('usage-summary');
const refreshBtn = document.getElementById('refreshBtn');
const searchInput = document.getElementById('search');
const planFilter = document.getElementById('plan-filter');

let servers = [];
let connectedState = {connected:false, server:null, plan:null, usedMB:0, timer:null};
const PLANS = { '200': 200, '500': 500, '1000': 1000 };

refreshBtn.addEventListener('click', fetchServers);
searchInput.addEventListener('input', renderFiltered);
planFilter.addEventListener('change', renderFiltered);

async function fetchServers(){
  serverListEl.innerHTML = '<div class="card small">Loading servers…</div>';
  try{
    const res = await fetch(API_URL, {cache:'no-cache'});
    const text = await res.text();
    const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    servers = lines.map(parseLine).filter(s => s && s.ovpnBase64);
    servers.sort((a,b)=> (a.country==='Ghana'? -1:0) - (b.country==='Ghana'? -1:0));
    renderFiltered();
  }catch(e){
    console.error(e);
    serverListEl.innerHTML = '<div class="card small">Failed to load servers. Check connection and try again.</div>';
  }
}

function parseLine(line){
  let parts = line.split('\t');
  if(parts.length < 5) parts = line.split(',');
  if(parts.length < 5) return null;
  const host = parts[0];
  const ip = parts[1];
  const score = Number(parts[2]) || 0;
  const ping = Number(parts[3]) || 0;
  const speed = Number(parts[4]) || 0;
  const country = parts[5] || 'Unknown';
  let ovpnBase64 = null;
  for(let i=parts.length-1;i>=0;i--){
    const p = parts[i];
    if(p && /[A-Za-z0-9+/]{20,}={0,2}/.test(p)){ ovpnBase64 = p; break; }
  }
  return {host, ip, score, ping, speed, country, ovpnBase64};
}

function renderFiltered(){
  const q = (searchInput.value||'').trim().toLowerCase();
  let list = servers.slice();
  if(q) list = list.filter(s => (s.country + ' ' + s.ip + ' ' + s.host).toLowerCase().includes(q));
  renderList(list.slice(0,80));
}

function renderList(list){
  serverListEl.innerHTML = '';
  if(!list.length){ serverListEl.innerHTML = '<div class="card small">No servers found</div>'; return; }
  list.forEach((s, idx) => {
    const card = document.createElement('div'); card.className = 'card server-card';
    card.innerHTML = `
      <div class="head">
        <div>
          <div class="country">${s.country}</div>
          <div class="meta">${s.host} • ${s.ip}</div>
        </div>
        <div class="badge">${Math.round(s.speed/1000000)} Mbps</div>
      </div>
      <div class="small">Ping: ${s.ping} ms • Score: ${s.score}</div>

      <div class="plan-row">
        <button class="plan-btn" data-plan="200">Free 200 MB</button>
        <button class="plan-btn" data-plan="500">500 MB</button>
        <button class="plan-btn" data-plan="1000">1 GB</button>
      </div>

      <div class="actions">
        <button class="btn download-btn" data-idx="${idx}">Download .ovpn</button>
        <button class="btn secondary copy-btn" data-ip="${s.ip}">Copy IP</button>
      </div>
    `;
    serverListEl.appendChild(card);

    const planBtns = card.querySelectorAll('.plan-btn');
    let selectedPlan = '200';
    planBtns.forEach(b=> b.addEventListener('click', ()=>{
      planBtns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); selectedPlan = b.dataset.plan;
    }));
    planBtns[0].classList.add('active');

    card.querySelector('.download-btn').addEventListener('click', ()=> downloadOvpn(list[idx], selectedPlan));
    card.querySelector('.copy-btn').addEventListener('click', (ev)=> {
      const ip = ev.currentTarget.dataset.ip;
      navigator.clipboard?.writeText(ip).then(()=>alert('IP copied to clipboard'));
    });
  });
}

function base64ToBlob(base64, mime='application/x-openvpn-profile'){
  const cleaned = base64.replace(/\s/g,'');
  const binary = atob(cleaned);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for(let i=0;i<len;i++) bytes[i]=binary.charCodeAt(i);
  return new Blob([bytes], {type: mime});
}

function downloadOvpn(s, plan){
  if(!s || !s.ovpnBase64){ alert('This server does not include an OpenVPN profile.'); return; }
  try{
    const blob = base64ToBlob(s.ovpnBase64);
    const filename = `vpngate-${s.country.replace(/\s+/g,'_')}-${s.ip}.ovpn`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    startSimulatedConnection(s, plan);
    alert(`Downloaded ${filename}. Open it with OpenVPN Connect to import and connect.`);
  }catch(e){
    console.error(e); alert('Failed to prepare .ovpn file.');
  }
}

function startSimulatedConnection(s, plan){
  stopSimulatedConnection();
  connectedState.connected = true; connectedState.server = s; connectedState.plan = Number(plan); connectedState.usedMB = 0;
  statusConnectedServer.textContent = `Connected: ${s.country} (${s.ip}) — Plan ${plan}MB`;
  updateUsageUI();
  connectedState.timer = setInterval(()=>{
    const add = Math.floor(Math.random()*6)+2;
    connectedState.usedMB += add; updateUsageUI();
    if(connectedState.usedMB >= connectedState.plan){ alert('Plan finished: your selected data limit is reached. Disconnect or choose a new plan.'); stopSimulatedConnection(); }
  }, 2000);
}

function stopSimulatedConnection(){
  if(connectedState.timer) clearInterval(connectedState.timer);
  connectedState = {connected:false, server:null, plan:null, usedMB:0, timer:null};
  statusConnectedServer.textContent = 'Not connected';
  updateUsageUI();
}

function updateUsageUI(){ usageSummaryEl.textContent = connectedState.connected ? `Used: ${connectedState.usedMB} MB / ${connectedState.plan} MB` : 'Used: 0 MB'; }

// initial load
fetchServers();
