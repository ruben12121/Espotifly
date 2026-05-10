const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;

const MANIFEST = {
  name: "Espotifly",
  short_name: "Espotifly",
  description: "Reproductor de música gratuito",
  start_url: "/",
  display: "standalone",
  background_color: "#0a0a0f",
  theme_color: "#c9a96e",
  orientation: "portrait",
  icons: [
    {
      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect fill='%230a0a0f' width='512' height='512' rx='100'/%3E%3Ctext x='256' y='320' font-size='300' text-anchor='middle' fill='%23c9a96e'%3E♪%3C/text%3E%3C/svg%3E",
      sizes: "512x512",
      type: "image/svg+xml",
      purpose: "any maskable"
    }
  ]
};

const SW = `
self.addEventListener('install', e => {
  self.skipWaiting();
  caches.open('espotifly-v1').then(cache => {
    cache.addAll(['/']);
  });
});

self.addEventListener('activate', e => {
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        if(e.request.url.includes('/api')) return response;
        return caches.open('espotifly-v1').then(cache => {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
`;

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Espotifly">
<meta name="theme-color" content="#0a0a0f">
<meta name="description" content="Reproductor de música con reproducción en segundo plano">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect fill='%230a0a0f' width='512' height='512' rx='100'/%3E%3Ctext x='256' y='320' font-size='300' text-anchor='middle' fill='%23c9a96e'%3E♪%3C/text%3E%3C/svg%3E">
<title>Espotifly</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none}
body{background:#0a0a0f;color:#f0ece4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;height:100vh;height:100dvh;overscroll-behavior:none}
.header{display:flex;align-items:center;gap:.5rem;padding:.8rem 1rem;padding-top:max(.8rem, env(safe-area-inset-top));background:#13131a;border-bottom:1px solid rgba(255,255,255,.06);z-index:100}
.logo{font-family:'Georgia',serif;font-size:1.4rem;color:#c9a96e;font-weight:700;letter-spacing:-0.5px}
.search-box{display:flex;gap:6px;flex:1}
.search-box input{flex:1;padding:.5rem .8rem;border-radius:20px;border:1px solid rgba(255,255,255,.08);background:#1c1c27;color:#f0ece4;font-size:.85rem;outline:none;min-width:0}
.search-box input:focus{border-color:#c9a96e}
.search-box button{background:#c9a96e;color:#0a0a0f;border:none;padding:.5rem 1rem;border-radius:20px;cursor:pointer;font-weight:700;font-size:.8rem;white-space:nowrap}
.search-box button:active{background:#e8c99a;transform:scale(.95)}
.main{flex:1;padding:.8rem;overflow-y:auto;-webkit-overflow-scrolling:touch}
.scroll-genres{display:flex;gap:6px;margin-bottom:1rem;overflow-x:auto;padding-bottom:.5rem;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.scroll-genres::-webkit-scrollbar{display:none}
.genre{background:rgba(201,169,110,.1);color:#c9a96e;padding:6px 14px;border-radius:20px;cursor:pointer;font-size:.72rem;border:1px solid rgba(201,169,110,.18);white-space:nowrap;flex-shrink:0;transition:all .2s}
.genre:active{background:rgba(201,169,110,.3);transform:scale(.95)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.7rem}
.card{background:#13131a;border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s;border:1px solid rgba(255,255,255,.04);position:relative}
.card:active{transform:scale(.96)}
.card.playing{border-color:#c9a96e;box-shadow:0 0 15px rgba(201,169,110,.2)}
.card.playing::after{content:'♪';position:absolute;top:8px;right:8px;color:#c9a96e;font-size:1rem;animation:pulse 1s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.card img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#1c1c27}
.card-info{padding:.5rem}
.card-title{font-size:.75rem;font-weight:500;margin-bottom:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.3}
.card-channel{font-size:.65rem;color:#5a5750}
.player{display:flex;align-items:center;gap:.8rem;padding:.8rem 1rem;padding-bottom:max(.8rem, env(safe-area-inset-bottom));background:#13131a;border-top:1px solid rgba(255,255,255,.07);z-index:100}
.player img{width:44px;height:44px;border-radius:8px;object-fit:cover;background:#1c1c27;flex-shrink:0}
.player-info{min-width:0;flex:1}
.player-title{font-size:.78rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.player-channel{font-size:.68rem;color:#5a5750;margin-top:2px}
.controls{display:flex;align-items:center;gap:.6rem}
.ctrl-btn{background:none;border:none;color:#9e9a94;cursor:pointer;font-size:1.3rem;padding:.4rem;border-radius:50%;transition:color .2s}
.ctrl-btn:active{color:#f0ece4;transform:scale(.9)}
.ctrl-btn.play{background:#c9a96e;color:#0a0a0f;width:40px;height:40px;border-radius:50%;font-size:1rem;display:flex;align-items:center;justify-content:center}
.ctrl-btn.play:active{background:#e8c99a;transform:scale(.9)}
.ctrl-btn.pip{font-size:.9rem;color:#c9a96e;font-weight:700}
.progress-row{display:flex;align-items:center;gap:8px;width:100%;padding:0 1rem .5rem;background:#13131a}
.progress-bar{flex:1;height:3px;background:#1c1c27;border-radius:2px;cursor:pointer;position:relative}
.progress-fill{height:100%;background:#c9a96e;border-radius:2px;width:0%;pointer-events:none;transition:width .3s linear}
.time-label{font-size:.6rem;color:#5a5750;min-width:32px;text-align:center}
.video-container{position:fixed;bottom:-9999px;right:-9999px;width:1px;height:1px;opacity:0;pointer-events:none}
.video-container iframe{width:1px;height:1px}
.install-banner{display:none;background:linear-gradient(135deg,#c9a96e,#e8c99a);color:#0a0a0f;padding:.8rem 1rem;text-align:center;font-size:.8rem;font-weight:600;cursor:pointer;position:fixed;bottom:100px;left:50%;transform:translateX(-50%);border-radius:25px;z-index:1000;box-shadow:0 4px 15px rgba(0,0,0,.3);animation:slideUp .5s ease}
.install-banner.show{display:block}
@keyframes slideUp{from{transform:translate(-50%,100px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
.msg{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:3rem 1rem;color:#5a5750;text-align:center}
.msg-emoji{font-size:3.5rem;animation:float 3s infinite ease-in-out}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
.loader{display:flex;gap:6px}
.loader span{width:8px;height:8px;background:#c9a96e;border-radius:50%;animation:bounce 1.2s infinite ease-in-out}
.loader span:nth-child(2){animation-delay:.2s}
.loader span:nth-child(3){animation-delay:.4s}
@keyframes bounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}
</style>
</head>
<body>
<div class="install-banner" id="installBanner" onclick="installApp()">
  📲 Toca aquí para instalar Espotifly
</div>

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

<div class="progress-row" id="progress-row">
<span class="time-label" id="time-current">0:00</span>
<div class="progress-bar" id="progress-bar" onclick="seekTo(event)">
<div class="progress-fill" id="progress-fill"></div>
</div>
<span class="time-label" id="time-total">0:00</span>
</div>

<div class="player">
<img id="np-img" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Crect fill='%231c1c27' width='44' height='44' rx='8'/%3E%3C/svg%3E" alt="Portada">
<div class="player-info">
<div class="player-title" id="np-title">Espotifly</div>
<div class="player-channel" id="np-channel">Elige una canción</div>
</div>
<div class="controls">
<button class="ctrl-btn" onclick="prev()" aria-label="Anterior">⏮</button>
<button class="ctrl-btn play" onclick="togglePlay()" id="play-btn" aria-label="Reproducir">▶</button>
<button class="ctrl-btn" onclick="next()" aria-label="Siguiente">⏭</button>
<button class="ctrl-btn pip" onclick="togglePiP()" id="pip-btn" aria-label="Picture in Picture" title="Reproducir en ventana flotante">📱</button>
</div>
</div>

<div class="video-container" id="video-container">
<iframe id="yt-player" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
</div>

<script>
// PWA Install
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  setTimeout(() => {
    document.getElementById('installBanner').classList.add('show');
  }, 3000);
});

window.addEventListener('appinstalled', () => {
  document.getElementById('installBanner').classList.remove('show');
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((result) => {
      if (result.outcome === 'accepted') console.log('🎉 App instalada');
      deferredPrompt = null;
      document.getElementById('installBanner').classList.remove('show');
    });
  }
}

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// YouTube Player
let player;
let queue=[],idx=-1,playing=false,currentResults=[];
let progressInterval;
let lastVolume=80;

// Cargar API de YouTube dinámicamente
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(tag);

window.onYouTubeIframeAPIReady = function() {
  player = new YT.Player('yt-player', {
    height: '1',
    width: '1',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 0,
      enablejsapi: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0
    },
    events: {
      onReady: () => {
        player.setVolume(lastVolume);
        console.log('✅ Reproductor listo');
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) {
          playing = true;
          document.getElementById('play-btn').textContent = '⏸';
          startProgress();
          updateMediaSession();
        } else if (e.data === YT.PlayerState.PAUSED) {
          playing = false;
          document.getElementById('play-btn').textContent = '▶';
          clearInterval(progressInterval);
        } else if (e.data === YT.PlayerState.ENDED) {
          next();
        }
      },
      onError: () => {
        console.error('Error reproduciendo, saltando...');
        setTimeout(() => next(), 1000);
      }
    }
  });
};

// Media Session API - Reproducción en segundo plano
function updateMediaSession() {
  if ('mediaSession' in navigator && queue[idx]) {
    const track = queue[idx];
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.channel,
      album: 'Espotifly',
      artwork: [
        { src: track.thumb, sizes: '320x180', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => prev());
    navigator.mediaSession.setActionHandler('nexttrack', () => next());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (player && details.seekTime !== undefined) {
        player.seekTo(details.seekTime, true);
      }
    });
  }
}

// Picture-in-Picture
async function togglePiP() {
  if (!queue.length) return;
  
  try {
    // Si ya está en PiP, salir
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      return;
    }
    
    // Crear video temporal para PiP
    const videoContainer = document.getElementById('video-container');
    const iframe = document.getElementById('yt-player');
    
    // Obtener el elemento de video del iframe
    const videoElement = iframe.contentWindow?.document?.querySelector('video');
    
    if (videoElement) {
      await videoElement.requestPictureInPicture();
      console.log('✅ PiP activado - La música sigue sonando');
    } else {
      // Fallback: abrir en ventana emergente
      const track = queue[idx];
      const pipWindow = window.open(
        'https://www.youtube.com/embed/' + track.id + '?autoplay=1&playsinline=1',
        'Espotifly PiP',
        'width=320,height=180,resizable=yes'
      );
      if (pipWindow) {
        pipWindow.focus();
        console.log('✅ Ventana PiP abierta');
      }
    }
  } catch (err) {
    console.warn('PiP no soportado, usando ventana emergente:', err);
    // Fallback
    const track = queue[idx];
    window.open(
      'https://www.youtube.com/embed/' + track.id + '?autoplay=1',
      'Espotifly',
      'width=320,height=180'
    );
  }
}

// Búsqueda
async function search(){
const q=document.getElementById('search').value.trim();
if(!q)return;
document.getElementById('results').innerHTML='<div class="msg"><div class="loader"><span></span><span></span><span></span></div><p>Buscando lo mejor para ti...</p></div>';
try{
const r=await fetch('/api?q='+encodeURIComponent(q+' musica oficial'));
const d=await r.json();
if(!d.length)throw new Error('No encontramos resultados');
currentResults=d;
render(d,q);
}catch(e){
document.getElementById('results').innerHTML='<div class="msg"><div class="msg-emoji">😕</div><p style="color:#e05c5c">'+e.message+'</p></div>';
}
}

function searchGenre(q){document.getElementById('search').value=q;search();}

function render(items,query){
let h='<h3 style="margin-bottom:.8rem;font-size:.9rem;color:#c9a96e">'+query+'</h3><div class="grid">';
items.forEach((v,i)=>{
h+='<div class="card" id="card-'+i+'" onclick="play('+i+')"><img src="'+v.thumb+'" alt="'+esc(v.title)+'" loading="lazy" onerror="this.style.opacity=\\'0.5\\';this.src=\\'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27320%27 height=%27180%27%3E%3Crect fill=%27%231c1c27%27 width=%27320%27 height=%27180%27/%3E%3Ctext x=%2725%25%27 y=%2750%25%27 fill=%27%235a5750%27 font-size=%2740%27%3E🎵%3C/text%3E%3C/svg%3E\\'"><div class="card-info"><div class="card-title">'+esc(v.title)+'</div><div class="card-channel">'+esc(v.channel)+'</div></div></div>';
});
h+='</div>';
document.getElementById('results').innerHTML=h;
}

function play(i){
queue=currentResults.map(v=>({id:v.id,title:v.title,channel:v.channel,thumb:v.thumb}));
idx=i;
playTrack();
}

function playTrack(){
if(!queue.length||!player)return;
const t=queue[idx];
document.getElementById('np-img').src=t.thumb;
document.getElementById('np-title').textContent=t.title;
document.getElementById('np-channel').textContent=t.channel;
player.loadVideoById(t.id);
player.playVideo();
playing=true;
document.getElementById('play-btn').textContent='⏸';
document.querySelectorAll('.card').forEach(c=>c.classList.remove('playing'));
const activeCard=document.getElementById('card-'+currentResults.findIndex(v=>v.id===t.id));
if(activeCard)activeCard.classList.add('playing');
}

function togglePlay(){
if(!player)return;
if(playing){player.pauseVideo();}
else{player.playVideo();}
}

function next(){
if(!queue.length)return;
idx=(idx+1)%queue.length;
playTrack();
}

function prev(){
if(!queue.length)return;
idx=(idx-1+queue.length)%queue.length;
playTrack();
}

function startProgress(){
clearInterval(progressInterval);
progressInterval=setInterval(()=>{
if(!player||!player.getCurrentTime)return;
const cur=player.getCurrentTime();
const dur=player.getDuration()||0;
if(!dur)return;
document.getElementById('progress-fill').style.width=((cur/dur)*100)+'%';
document.getElementById('time-current').textContent=fmtTime(cur);
document.getElementById('time-total').textContent=fmtTime(dur);
},500);
}

function fmtTime(s){
const m=Math.floor(s/60);
const sec=Math.floor(s%60);
return m+':'+(sec<10?'0':'')+sec;
}

function seekTo(e){
if(!player)return;
const bar=document.getElementById('progress-bar');
const rect=bar.getBoundingClientRect();
const percent=(e.clientX-rect.left)/rect.width;
player.seekTo(player.getDuration()*percent,true);
}

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// Mantener despierto - Previene que el navegador pause la música
if ('wakeLock' in navigator) {
  let wakeLock = null;
  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        if (playing) requestWakeLock();
      });
    } catch (err) {
      console.log('Wake Lock no disponible:', err);
    }
  };
  
  // Solicitar wake lock cuando se reproduce
  const originalPlay = playTrack;
  playTrack = function() {
    originalPlay.apply(this, arguments);
    requestWakeLock();
  };
}

console.log('🎵 Espotifly listo - Reproducción en segundo plano activada');
console.log('📱 Botón PiP para reproducir con pantalla apagada');
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  try {
    if (req.url === '/manifest.json') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(MANIFEST));
      return;
    }
    
    if (req.url === '/sw.js') {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(SW);
      return;
    }

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
  console.log(`🎵 Espotifly corriendo en puerto ${PORT}`);
  console.log(`📱 Abre en Android para reproducir con pantalla apagada`);
});

process.on('uncaughtException', (err) => console.error('Error:', err));
process.on('unhandledRejection', (err) => console.error('Error:', err));
