const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="applen-mobile-web-app-title" content="Espotifly">
<meta name="theme-color" content="#0a0a0f">
<title>Espotifly</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{background:#0a0a0f;color:#f0ece4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;height:100vh;height:100dvh}
.header{display:flex;align-items:center;gap:.5rem;padding:.8rem 1rem;padding-top:max(.8rem, env(safe-area-inset-top));background:#13131a;border-bottom:1px solid rgba(255,255,255,.06)}
.logo{font-family:'Georgia',serif;font-size:1.4rem;color:#c9a96e;font-weight:700}
.search-box{display:flex;gap:6px;flex:1}
.search-box input{flex:1;padding:.5rem .8rem;border-radius:20px;border:1px solid rgba(255,255,255,.08);background:#1c1c27;color:#f0ece4;font-size:.85rem;outline:none;min-width:0}
.search-box input:focus{border-color:#c9a96e}
.search-box button{background:#c9a96e;color:#0a0a0f;border:none;padding:.5rem 1.2rem;border-radius:20px;cursor:pointer;font-weight:700;font-size:.8rem;white-space:nowrap}
.search-box button:active{background:#e8c99a}
.main{flex:1;padding:.8rem;overflow-y:auto;-webkit-overflow-scrolling:touch}
.scroll-genres{display:flex;gap:6px;margin-bottom:1rem;overflow-x:auto;padding-bottom:.5rem;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.scroll-genres::-webkit-scrollbar{display:none}
.genre{background:rgba(201,169,110,.1);color:#c9a96e;padding:6px 14px;border-radius:20px;cursor:pointer;font-size:.72rem;border:1px solid rgba(201,169,110,.18);white-space:nowrap;flex-shrink:0}
.genre:active{background:rgba(201,169,110,.3)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.7rem}
.card{background:#13131a;border-radius:12px;overflow:hidden;cursor:pointer;border:1px solid rgba(255,255,255,.04)}
.card:active{transform:scale(.96)}
.card img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#1c1c27}
.card-info{padding:.5rem}
.card-title{font-size:.75rem;font-weight:500;margin-bottom:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.3}
.card-channel{font-size:.65rem;color:#5a5750}
.player{display:flex;align-items:center;gap:.8rem;padding:.8rem 1rem;padding-bottom:max(.8rem, env(safe-area-inset-bottom));background:#13131a;border-top:1px solid rgba(255,255,255,.07)}
.player img{width:44px;height:44px;border-radius:8px;object-fit:cover;background:#1c1c27;flex-shrink:0}
.player-info{min-width:0;flex:1}
.player-title{font-size:.78rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.player-channel{font-size:.68rem;color:#5a5750;margin-top:2px}
.controls{display:flex;align-items:center;gap:.6rem}
.ctrl-btn{background:none;border:none;color:#9e9a94;cursor:pointer;font-size:1.3rem;padding:.4rem}
.ctrl-btn:active{color:#f0ece4}
.ctrl-btn.play{background:#c9a96e;color:#0a0a0f;width:40px;height:40px;border-radius:50%;font-size:1rem;display:flex;align-items:center;justify-content:center}
.msg{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:3rem 1rem;color:#5a5750;text-align:center}
.msg-emoji{font-size:3.5rem}
.loader{display:flex;gap:6px}
.loader span{width:8px;height:8px;background:#c9a96e;border-radius:50%;animation:bounce 1.2s infinite ease-in-out}
.loader span:nth-child(2){animation-delay:.2s}
.loader span:nth-child(3){animation-delay:.4s}
@keyframes bounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}
</style>
</head>
<body>

<div class="header">
<div class="logo">♪ Espotifly</div>
<div class="search-box">
<input type="search" id="search" placeholder="Buscar música..." onkeydown="if(event.key==='Enter')search()" autocomplete="off">
<button onclick="search()">Buscar</button>
</div>
</div>

<div class="main">
<div class="scroll-genres">
<span class="genre" onclick="searchGenre('pop español 2024 hits')">🎤 Pop</span>
<span class="genre" onclick="searchGenre('reggaeton 2024')">💃 Reggaetón</span>
<span class="genre" onclick="searchGenre('rock en español')">🎸 Rock</span>
<span class="genre" onclick="searchGenre('flamenco moderno')">💃 Flamenco</span>
<span class="genre" onclick="searchGenre('indie español 2024')">🎸 Indie</span>
<span class="genre" onclick="searchGenre('jazz suave')">🎷 Jazz</span>
<span class="genre" onclick="searchGenre('electrónica 2024')">🎛 Electrónica</span>
<span class="genre" onclick="searchGenre('trap español 2024')">🎤 Trap</span>
<span class="genre" onclick="searchGenre('salsa bachata exitos')">🕺 Salsa</span>
<span class="genre" onclick="searchGenre('rap español 2024')">🎤 Rap</span>
<span class="genre" onclick="searchGenre('baladas románticas')">💕 Baladas</span>
<span class="genre" onclick="searchGenre('kpop 2024 hits')">🎵 K-Pop</span>
</div>
<div id="results"><div class="msg"><div class="msg-emoji">🎵</div><p>Busca tu música favorita<br>o elige un género para empezar</p></div></div>
</div>

<div class="player" id="player-bar">
<img id="np-img" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Crect fill='%231c1c27' width='44' height='44' rx='8'/%3E%3C/svg%3E" alt="Portada">
<div class="player-info">
<div class="player-title" id="np-title">Espotifly</div>
<div class="player-channel" id="np-channel">Elige una canción</div>
</div>
<div class="controls">
<button class="ctrl-btn" onclick="prevTrack()">⏮</button>
<button class="ctrl-btn play" onclick="togglePlay()" id="play-btn">▶</button>
<button class="ctrl-btn" onclick="nextTrack()">⏭</button>
</div>
</div>

<script>
let queue=[],currentIndex=-1,isPlaying=false,currentResults=[];
let currentWindow=null;

async function search(){
const q=document.getElementById('search').value.trim();
if(!q)return;
document.getElementById('results').innerHTML='<div class="msg"><div class="loader"><span></span><span></span><span></span></div><p>Buscando...</p></div>';
try{
const r=await fetch('/api?q='+encodeURIComponent(q+' musica oficial'));
const d=await r.json();
if(!d.length)throw new Error('No encontramos resultados');
currentResults=d;
renderResults(d,q);
}catch(e){
document.getElementById('results').innerHTML='<div class="msg"><div class="msg-emoji">😕</div><p style="color:#e05c5c">'+e.message+'</p></div>';
}
}

function searchGenre(q){document.getElementById('search').value=q;search();}

function renderResults(items,query){
let h='<h3 style="margin-bottom:.8rem;font-size:.9rem;color:#c9a96e">'+query+'</h3><div class="grid">';
items.forEach((v,i)=>{
h+='<div class="card" onclick="playTrack('+i+')"><img src="'+v.thumb+'" alt="'+esc(v.title)+'" loading="lazy" onerror="this.src=\\'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27320%27 height=%27180%27%3E%3Crect fill=%27%231c1c27%27 width=%27320%27 height=%27180%27/%3E%3Ctext x=%2725%25%27 y=%2750%25%27 fill=%27%235a5750%27 font-size=%2740%27%3E🎵%3C/text%3E%3C/svg%3E\\'"><div class="card-info"><div class="card-title">'+esc(v.title)+'</div><div class="card-channel">'+esc(v.channel)+'</div></div></div>';
});
h+='</div>';
document.getElementById('results').innerHTML=h;
}

function playTrack(index){
if(!currentResults.length)return;
queue=currentResults.map(v=>({id:v.id,title:v.title,channel:v.channel,thumb:v.thumb}));
currentIndex=index;
const track=queue[currentIndex];

// Actualizar UI
document.getElementById('np-img').src=track.thumb;
document.getElementById('np-title').textContent=track.title;
document.getElementById('np-channel').textContent=track.channel;
isPlaying=true;
document.getElementById('play-btn').textContent='⏸';

// Abrir YouTube en nueva ventana
const url='https://www.youtube.com/watch?v='+track.id+'&autoplay=1';
if(currentWindow&&!currentWindow.closed){currentWindow.location.href=url;currentWindow.focus();}
else{currentWindow=window.open(url,'EspotiflyPlayer','width=480,height=360');}
}

function togglePlay(){
if(!queue.length)return;
if(isPlaying){
if(currentWindow&&!currentWindow.closed)currentWindow.close();
isPlaying=false;
document.getElementById('play-btn').textContent='▶';
}else{
playTrack(currentIndex);
}
}

function nextTrack(){
if(!queue.length)return;
currentIndex=(currentIndex+1)%queue.length;
playTrack(currentIndex);
}

function prevTrack(){
if(!queue.length)return;
currentIndex=(currentIndex-1+queue.length)%queue.length;
playTrack(currentIndex);
}

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
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
              .map(m => m.replace('/watch?v=', '')).slice(0, 15);
            const titles = [];
            const titleRegex = /"title":{"runs":\[{"text":"([^"]+)"}/g;
            let m;
            while ((m = titleRegex.exec(data)) !== null && titles.length < ids.length) {
              titles.push(m[1].replace(/\\"/g, '"'));
            }
            const results = ids.map((id, i) => ({
              id, title: titles[i] || 'Video de YouTube', channel: 'YouTube',
              thumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
            }));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
          } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([]));
          }
        });
      }).on('error', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
      });
      return;
    }
    
    res.writeHead(404);
    res.end('Not found');
  } catch (err) {
    res.writeHead(500);
    res.end('Error');
  }
});

server.listen(PORT, () => {
  console.log(`🎵 Espotifly: http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => console.error('Error:', err));
