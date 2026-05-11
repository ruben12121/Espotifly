const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#0a0a0f">
<title>Espotifly</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{background:#0a0a0f;color:#f0ece4;font-family:system-ui,sans-serif;display:flex;flex-direction:column;height:100vh;height:100dvh}
.header{display:flex;align-items:center;gap:.5rem;padding:.8rem 1rem;background:#13131a;border-bottom:1px solid rgba(255,255,255,.06)}
.logo{font-family:serif;font-size:1.3rem;color:#c9a96e}
.search-box{display:flex;gap:6px;flex:1}
.search-box input{flex:1;padding:.5rem .8rem;border-radius:20px;border:1px solid rgba(255,255,255,.08);background:#1c1c27;color:#f0ece4;font-size:.85rem;outline:none}
.search-box input:focus{border-color:#c9a96e}
.search-box button{background:#c9a96e;color:#0a0a0f;border:none;padding:.5rem 1rem;border-radius:20px;cursor:pointer;font-weight:700;font-size:.8rem;white-space:nowrap}
.main{flex:1;padding:.8rem;overflow-y:auto}
.scroll-genres{display:flex;gap:6px;margin-bottom:1rem;overflow-x:auto;padding-bottom:.5rem;-webkit-overflow-scrolling:touch}
.scroll-genres::-webkit-scrollbar{display:none}
.genre{background:rgba(201,169,110,.1);color:#c9a96e;padding:6px 14px;border-radius:20px;cursor:pointer;font-size:.72rem;border:1px solid rgba(201,169,110,.18);white-space:nowrap;flex-shrink:0}
.genre:active{background:rgba(201,169,110,.3)}
.tabs{display:flex;gap:.5rem;margin-bottom:1rem;border-bottom:2px solid rgba(255,255,255,.06);padding-bottom:.5rem}
.tab{padding:.5rem 1rem;cursor:pointer;font-size:.8rem;color:#5a5750;border-radius:8px 8px 0 0;transition:all .2s}
.tab.active{color:#c9a96e;background:rgba(201,169,110,.1)}
.tab:hover{color:#c9a96e}
.playlist-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:.7rem}
.playlist-card{background:linear-gradient(135deg,#1c1c27,#13131a);border-radius:10px;padding:1rem;cursor:pointer;text-align:center;border:1px solid rgba(255,255,255,.04);transition:transform .2s}
.playlist-card:active{transform:scale(.95)}
.playlist-icon{font-size:2.5rem;margin-bottom:.5rem}
.playlist-name{font-size:.75rem;color:#f0ece4;margin-bottom:.3rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.playlist-count{font-size:.65rem;color:#5a5750}
.create-playlist-btn{background:rgba(201,169,110,.1);color:#c9a96e;border:2px dashed rgba(201,169,110,.3);border-radius:10px;padding:1rem;cursor:pointer;text-align:center;font-size:.8rem;transition:all .2s;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:120px}
.create-playlist-btn:active{background:rgba(201,169,110,.2)}
.create-playlist-btn .plus{font-size:2rem;margin-bottom:.3rem}
.add-to-playlist-btn{position:absolute;top:5px;right:5px;background:rgba(0,0,0,.7);color:#c9a96e;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:1rem;display:none;align-items:center;justify-content:center;z-index:10}
.card{position:relative}
.card:hover .add-to-playlist-btn{display:flex}
.card:active .add-to-playlist-btn{display:flex}
.modal-playlist{position:fixed;inset:0;background:rgba(0,0,0,.9);display:none;align-items:center;justify-content:center;z-index:10000;flex-direction:column;gap:.8rem}
.modal-playlist.show{display:flex}
.modal-playlist-content{background:#13131a;border-radius:12px;padding:1.5rem;max-width:350px;width:90%;border:1px solid rgba(255,255,255,.1)}
.modal-playlist h3{color:#c9a96e;margin-bottom:1rem;font-size:1rem}
.playlist-list{max-height:250px;overflow-y:auto;margin-bottom:1rem}
.playlist-option{padding:.8rem;cursor:pointer;border-radius:8px;margin-bottom:.3rem;transition:background .2s;display:flex;justify-content:space-between;align-items:center}
.playlist-option:hover{background:rgba(201,169,110,.1)}
.playlist-option-name{font-size:.85rem;flex:1}
.playlist-option-count{font-size:.7rem;color:#5a5750}
.modal-input{width:100%;padding:.8rem;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:#1c1c27;color:#f0ece4;margin-bottom:.8rem;font-size:.85rem}
.modal-input:focus{border-color:#c9a96e;outline:none}
.modal-buttons{display:flex;gap:.5rem}
.modal-btn{padding:.7rem 1.2rem;border-radius:20px;border:none;cursor:pointer;font-weight:700;font-size:.8rem;flex:1}
.modal-btn.primary{background:#c9a96e;color:#0a0a0f}
.modal-btn.secondary{background:rgba(255,255,255,.1);color:#f0ece4}
.remove-btn{color:#e05c5c;background:none;border:none;cursor:pointer;font-size:1.1rem;padding:0 .3rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.7rem}
.card{background:#13131a;border-radius:10px;overflow:hidden;cursor:pointer;transition:transform .2s;border:1px solid rgba(255,255,255,.04)}
.card:active{transform:scale(.97)}
.card img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#1c1c27}
.card-info{padding:.5rem}
.card-title{font-size:.75rem;margin-bottom:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card-channel{font-size:.65rem;color:#5a5750}
.player{display:flex;align-items:center;gap:.8rem;padding:.8rem 1rem;background:#13131a;border-top:1px solid rgba(255,255,255,.07)}
.player img{width:42px;height:42px;border-radius:6px;object-fit:cover;background:#1c1c27;flex-shrink:0}
.player-info{min-width:0;flex:1}
.player-title{font-size:.75rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.player-channel{font-size:.65rem;color:#5a5750}
.controls{display:flex;align-items:center;gap:.5rem}
.ctrl-btn{background:none;border:none;color:#9e9a94;cursor:pointer;font-size:1.3rem;padding:.3rem}
.ctrl-btn:active{color:#f0ece4}
.ctrl-btn.play{background:#c9a96e;color:#0a0a0f;width:36px;height:36px;border-radius:50%;font-size:1rem;display:flex;align-items:center;justify-content:center}
.video-modal{position:fixed;inset:0;background:rgba(0,0,0,.9);display:none;align-items:center;justify-content:center;z-index:9999;flex-direction:column;gap:.8rem}
.video-modal.show{display:flex}
.video-modal iframe{width:100vw;height:56vw;max-height:50vh;border:none}
.close-btn{background:#c9a96e;color:#000;border:none;padding:.5rem 2rem;border-radius:20px;cursor:pointer;font-weight:700;font-size:.9rem}
.msg{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:3rem 1rem;color:#5a5750;text-align:center}
.loader{display:flex;gap:5px}
.loader span{width:7px;height:7px;background:#c9a96e;border-radius:50%;animation:bounce 1.2s infinite ease-in-out}
.loader span:nth-child(2){animation-delay:.2s}
.loader span:nth-child(3){animation-delay:.4s}
@keyframes bounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}
</style>
</head>
<body>
<div class="header">
<div class="logo">♪ Espotifly</div>
<div class="search-box">
<input type="search" id="search" placeholder="Buscar..." onkeydown="if(event.key==='Enter')search()" autocomplete="off">
<button onclick="search()">Buscar</button>
</div>
</div>
<div class="main">
<div class="tabs">
<div class="tab active" onclick="switchTab('search')">🔍 Buscar</div>
<div class="tab" onclick="switchTab('playlists')">🎵 Mis Playlists</div>
</div>
<div id="search-section">
<div class="scroll-genres">
<span class="genre" onclick="searchGenre('pop español 2024')">Pop</span>
<span class="genre" onclick="searchGenre('reggaeton 2024')">Reggaetón</span>
<span class="genre" onclick="searchGenre('rock español')">Rock</span>
<span class="genre" onclick="searchGenre('flamenco')">Flamenco</span>
<span class="genre" onclick="searchGenre('indie español')">Indie</span>
<span class="genre" onclick="searchGenre('jazz')">Jazz</span>
<span class="genre" onclick="searchGenre('electrónica')">Electrónica</span>
<span class="genre" onclick="searchGenre('trap español')">Trap</span>
<span class="genre" onclick="searchGenre('salsa bachata')">Salsa</span>
<span class="genre" onclick="searchGenre('rap español')">Rap</span>
<span class="genre" onclick="searchGenre('baladas')">Baladas</span>
<span class="genre" onclick="searchGenre('kpop 2024')">K-Pop</span>
</div>
<div id="results"><div class="msg"><div style="font-size:3rem">🎵</div><p>Busca tu música favorita</p></div></div>
</div>
<div id="playlists-section" style="display:none">
<div id="playlist-content"></div>
</div>
</div>
<div class="player">
<img id="np-img" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='42'%3E%3Crect fill='%231c1c27' width='42' height='42'/%3E%3C/svg%3E">
<div class="player-info"><div class="player-title" id="np-title">—</div><div class="player-channel" id="np-channel">Selecciona canción</div></div>
<div class="controls">
<button class="ctrl-btn" onclick="prev()">⏮</button>
<button class="ctrl-btn play" onclick="togglePlay()" id="play-btn">▶</button>
<button class="ctrl-btn" onclick="next()">⏭</button>
</div>
</div>
<div class="video-modal" id="modal" onclick="closeModal(event)">
<iframe id="iframe" allow="autoplay" allowfullscreen></iframe>
<button class="close-btn" onclick="closeModal()">Cerrar</button>
</div>
<div class="modal-playlist" id="addToPlaylistModal">
<div class="modal-playlist-content">
<h3>Añadir a playlist</h3>
<div class="playlist-list" id="playlistList"></div>
<input type="text" class="modal-input" id="newPlaylistName" placeholder="Nombre de nueva playlist...">
<div class="modal-buttons">
<button class="modal-btn primary" onclick="addToNewPlaylist()">Crear y añadir</button>
<button class="modal-btn secondary" onclick="closeAddToPlaylistModal()">Cancelar</button>
</div>
</div>
</div>
<script>
let queue=[],idx=-1,playing=false;
let playlists = JSON.parse(localStorage.getItem('espotifly_playlists') || '{}');
let currentTab = 'search';
let selectedSong = null;

function savePlaylists() {
  localStorage.setItem('espotifly_playlists', JSON.stringify(playlists));
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  
  if (tab === 'search') {
    document.getElementById('search-section').style.display = 'block';
    document.getElementById('playlists-section').style.display = 'none';
  } else {
    document.getElementById('search-section').style.display = 'none';
    document.getElementById('playlists-section').style.display = 'block';
    renderPlaylists();
  }
}

function renderPlaylists() {
  const container = document.getElementById('playlist-content');
  const playlistNames = Object.keys(playlists);
  
  if (playlistNames.length === 0) {
    container.innerHTML = '<div class="msg"><div style="font-size:3rem">📝</div><p>No tienes playlists aún</p></div>';
  } else {
    let html = '<div class="playlist-grid">';
    playlistNames.forEach(name => {
      const count = playlists[name].length;
      html += \`<div class="playlist-card" onclick="viewPlaylist('\${esc(name)}')">
        <div class="playlist-icon">🎵</div>
        <div class="playlist-name">\${esc(name)}</div>
        <div class="playlist-count">\${count} canción\${count !== 1 ? 'es' : ''}</div>
      </div>\`;
    });
    html += '</div>';
    container.innerHTML = html;
  }
  
  // Añadir botón de crear playlist
  container.innerHTML += \`<div style="margin-top:1rem">
    <div class="create-playlist-btn" onclick="createEmptyPlaylist()">
      <div class="plus">+</div>
      <div>Nueva Playlist</div>
    </div>
  </div>\`;
}

function createEmptyPlaylist() {
  const name = prompt('Nombre de la nueva playlist:');
  if (name && name.trim()) {
    const trimmedName = name.trim();
    if (!playlists[trimmedName]) {
      playlists[trimmedName] = [];
      savePlaylists();
      renderPlaylists();
    } else {
      alert('Ya existe una playlist con ese nombre');
    }
  }
}

function viewPlaylist(name) {
  const songs = playlists[name] || [];
  const container = document.getElementById('playlist-content');
  
  if (songs.length === 0) {
    container.innerHTML = \`<div style="margin-bottom:1rem">
      <button class="ctrl-btn" onclick="switchTab('playlists');renderPlaylists()" style="font-size:1rem">← Volver</button>
    </div>
    <div class="msg"><div style="font-size:3rem">🎵</div><p>Playlist vacía</p></div>\`;
  } else {
    let html = \`<div style="margin-bottom:1rem;display:flex;gap:.5rem;align-items:center">
      <button class="ctrl-btn" onclick="switchTab('playlists');renderPlaylists()" style="font-size:1rem">← Volver</button>
      <h3 style="font-size:.9rem;color:#c9a96e">\${esc(name)}</h3>
      <button class="ctrl-btn" onclick="deletePlaylist('\${esc(name)}')" style="color:#e05c5c;font-size:.8rem;margin-left:auto">🗑️</button>
    </div>
    <div class="grid">\`;
    
    songs.forEach((song, i) => {
      html += \`<div class="card" style="position:relative">
        <button class="add-to-playlist-btn" style="display:flex" onclick="event.stopPropagation();removeFromPlaylist('\${esc(name)}', \${i})">✕</button>
        <div onclick="playPlaylistSong('\${esc(name)}', \${i})">
          <img src="\${song.thumb}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27320%27 height=%27180%27%3E%3Crect fill=%27%231c1c27%27 width=%27320%27 height=%27180%27/%3E%3C/svg%3E'">
          <div class="card-info">
            <div class="card-title">\${esc(song.title)}</div>
            <div class="card-channel">\${esc(song.channel)}</div>
          </div>
        </div>
      </div>\`;
    });
    
    html += '</div>';
    container.innerHTML = html;
  }
}

function deletePlaylist(name) {
  if (confirm(\`¿Eliminar la playlist "\${name}"?\`)) {
    delete playlists[name];
    savePlaylists();
    switchTab('playlists');
    renderPlaylists();
  }
}

function removeFromPlaylist(playlistName, songIndex) {
  playlists[playlistName].splice(songIndex, 1);
  savePlaylists();
  viewPlaylist(playlistName);
}

function playPlaylistSong(playlistName, songIndex) {
  const songs = playlists[playlistName];
  queue = songs.map(s => ({...s}));
  idx = songIndex;
  playTrack();
}

function showAddToPlaylist(song) {
  selectedSong = song;
  const modal = document.getElementById('addToPlaylistModal');
  const list = document.getElementById('playlistList');
  
  const playlistNames = Object.keys(playlists);
  if (playlistNames.length === 0) {
    list.innerHTML = '<p style="color:#5a5750;text-align:center;padding:1rem">No hay playlists. Crea una nueva abajo</p>';
  } else {
    list.innerHTML = playlistNames.map(name => 
      \`<div class="playlist-option" onclick="addToExistingPlaylist('\${esc(name)}')">
        <span class="playlist-option-name">🎵 \${esc(name)}</span>
        <span class="playlist-option-count">\${playlists[name].length}</span>
      </div>\`
    ).join('');
  }
  
  document.getElementById('newPlaylistName').value = '';
  modal.classList.add('show');
}

function closeAddToPlaylistModal() {
  document.getElementById('addToPlaylistModal').classList.remove('show');
  selectedSong = null;
}

function addToExistingPlaylist(playlistName) {
  if (selectedSong) {
    // Verificar si la canción ya está en la playlist
    const exists = playlists[playlistName].some(s => s.id === selectedSong.id);
    if (exists) {
      alert('Esta canción ya está en la playlist');
    } else {
      playlists[playlistName].push(selectedSong);
      savePlaylists();
      alert(\`Añadido a "\${playlistName}"\`);
    }
  }
  closeAddToPlaylistModal();
}

function addToNewPlaylist() {
  const name = document.getElementById('newPlaylistName').value.trim();
  if (!name) {
    alert('Por favor, introduce un nombre');
    return;
  }
  
  if (!playlists[name]) {
    playlists[name] = [];
  }
  
  if (selectedSong) {
    const exists = playlists[name].some(s => s.id === selectedSong.id);
    if (exists) {
      alert('Esta canción ya está en la playlist');
    } else {
      playlists[name].push(selectedSong);
      savePlaylists();
      alert(\`Creada playlist "\${name}" y canción añadida\`);
    }
  }
  
  closeAddToPlaylistModal();
}

async function search(){
const q=document.getElementById('search').value.trim();
if(!q)return;
document.getElementById('results').innerHTML='<div class="msg"><div class="loader"><span></span><span></span><span></span></div><p>Buscando...</p></div>';
try{
const r=await fetch('/api?q='+encodeURIComponent(q+' musica'));
const d=await r.json();
if(!d.length)throw new Error('Sin resultados');
render(d,q);
}catch(e){
document.getElementById('results').innerHTML='<div class="msg"><p style="color:#e05c5c">Error: '+e.message+'</p></div>';
}
}
function searchGenre(q){document.getElementById('search').value=q;search();}
function render(items,query){
let h='<h3 style="margin-bottom:.8rem;font-size:.9rem">'+query+'</h3><div class="grid">';
items.forEach((v,i)=>{
h+='<div class="card"><button class="add-to-playlist-btn" onclick="event.stopPropagation();showAddToPlaylist({id:\\''+v.id+'\\',title:\\''+esc(v.title).replace(/'/g,"\\'")+'\\',channel:\\''+esc(v.channel).replace(/'/g,"\\'")+'\\',thumb:\\''+v.thumb+'\\'})">+</button><div onclick="play('+i+')"><img src="'+v.thumb+'" loading="lazy" onerror="this.src=\\'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27320%27 height=%27180%27%3E%3Crect fill=%27%231c1c27%27 width=%27320%27 height=%27180%27/%3E%3C/svg%3E\\'"><div class="card-info"><div class="card-title">'+esc(v.title)+'</div><div class="card-channel">'+esc(v.channel)+'</div></div></div></div>';
});
h+='</div>';
document.getElementById('results').innerHTML=h;
window.results=items;
}
function play(i){
queue=window.results.map(v=>({id:v.id,title:v.title,channel:v.channel,thumb:v.thumb}));
idx=i;
playTrack();
}
function playTrack(){
const t=queue[idx];
document.getElementById('np-img').src=t.thumb;
document.getElementById('np-title').textContent=t.title;
document.getElementById('np-channel').textContent=t.channel;
document.getElementById('iframe').src='https://www.youtube.com/embed/'+t.id+'?autoplay=1';
document.getElementById('modal').classList.add('show');
playing=true;
document.getElementById('play-btn').textContent='⏸';
}
function togglePlay(){
if(!queue.length)return;
if(playing){
document.getElementById('modal').classList.remove('show');
playing=false;
document.getElementById('play-btn').textContent='▶';
}else{playTrack();}
}
function next(){if(!queue.length)return;idx=(idx+1)%queue.length;playTrack();}
function prev(){if(!queue.length)return;idx=(idx-1+queue.length)%queue.length;playTrack();}
function closeModal(e){
if(e&&e.target!==document.getElementById('modal'))return;
document.getElementById('modal').classList.remove('show');
document.getElementById('iframe').src='';
playing=false;
document.getElementById('play-btn').textContent='▶';
}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  // Log para debugging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  try {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(HTML);
      return;
    }
    
    if (req.url.startsWith('/api')) {
      const urlParams = new URL(req.url, `http://localhost:${PORT}`);
      const query = urlParams.searchParams.get('q');
      
      if (!query) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
        return;
      }
      
      console.log('Buscando:', query);
      
      const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      
      https.get(ytUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'es-ES,es;q=0.9'
        }
      }, (ytRes) => {
        let data = '';
        ytRes.on('data', c => data += c);
        ytRes.on('end', () => {
          try {
            const ids = [...new Set(data.match(/\/watch\?v=([A-Za-z0-9_-]{11})/g) || [])]
              .map(m => m.replace('/watch?v=', ''))
              .slice(0, 15);
            
            const titles = [];
            const titleRegex = /"title":{"runs":\[{"text":"([^"]+)"}/g;
            let m;
            while ((m = titleRegex.exec(data)) !== null && titles.length < ids.length) {
              titles.push(m[1].replace(/\\"/g, '"'));
            }
            
            const results = ids.map((id, i) => ({
              id, 
              title: titles[i] || 'Video de YouTube', 
              channel: 'YouTube',
              thumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
            }));
            
            console.log(`Encontrados: ${results.length} videos`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
          } catch (e) {
            console.error('Error parseando:', e);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([]));
          }
        });
      }).on('error', (e) => {
        console.error('Error YouTube:', e);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
      });
      return;
    }
    
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  } catch (err) {
    console.error('Error general:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`🎵 Espotifly corriendo en puerto ${PORT}`);
  console.log(`📍 Abre: http://localhost:${PORT}`);
});

// Manejar errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Promesa rechazada:', err);
});
