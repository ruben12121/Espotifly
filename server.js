const http = require('http');
const PORT = process.env.PORT || 3000;

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<meta name="theme-color" content="#0a0a0f">
<title>Espotifly</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#f0ece4;font-family:system-ui,sans-serif;padding:15px}
h1{color:#c9a96e;margin-bottom:15px;font-size:1.5rem}
.search-row{display:flex;gap:8px;margin-bottom:20px}
input{flex:1;padding:12px;border-radius:25px;border:none;background:#1c1c27;color:#fff;font-size:16px;outline:none}
button{background:#c9a96e;border:none;border-radius:25px;padding:12px 20px;color:#000;font-weight:bold;cursor:pointer;font-size:16px}
.genres{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px}
.genre{background:rgba(201,169,110,.1);color:#c9a96e;padding:8px 15px;border-radius:20px;font-size:13px;cursor:pointer;border:1px solid rgba(201,169,110,.2)}
.card{background:#13131a;border-radius:12px;margin-bottom:10px;display:flex;align-items:center;gap:12px;padding:12px;cursor:pointer;border:1px solid rgba(255,255,255,.05)}
.card img{width:100px;height:56px;object-fit:cover;border-radius:6px;background:#1c1c27}
.card-info{flex:1;min-width:0}
.card-title{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px}
.card-channel{font-size:12px;color:#5a5750}
.loading{text-align:center;padding:30px;color:#5a5750}
</style>
</head>
<body>
<h1>♪ Espotifly</h1>
<div class="search-row">
<input type="text" id="searchInput" placeholder="Buscar artista o canción..." onkeydown="if(event.key==='Enter')buscar()">
<button onclick="buscar()">Buscar</button>
</div>
<div class="genres">
<span class="genre" onclick="buscarGenero('pop español 2024')">Pop</span>
<span class="genre" onclick="buscarGenero('reggaeton 2024')">Reggaetón</span>
<span class="genre" onclick="buscarGenero('rock en español')">Rock</span>
<span class="genre" onclick="buscarGenero('flamenco')">Flamenco</span>
<span class="genre" onclick="buscarGenero('indie español')">Indie</span>
<span class="genre" onclick="buscarGenero('jazz')">Jazz</span>
<span class="genre" onclick="buscarGenero('electrónica')">Electrónica</span>
<span class="genre" onclick="buscarGenero('trap español')">Trap</span>
<span class="genre" onclick="buscarGenero('salsa bachata')">Salsa</span>
<span class="genre" onclick="buscarGenero('rap español')">Rap</span>
<span class="genre" onclick="buscarGenero('baladas')">Baladas</span>
<span class="genre" onclick="buscarGenero('kpop')">K-Pop</span>
</div>
<div id="results"><p style="text-align:center;color:#5a5750;padding:30px">🎵 Busca tu música favorita</p></div>

<script>
// ⚡ Búsqueda directa desde el navegador usando DuckDuckGo
async function buscar(){
const q=document.getElementById('searchInput').value.trim();
if(!q)return;
buscarQuery(q);
}

function buscarGenero(q){
document.getElementById('searchInput').value=q;
buscarQuery(q);
}

async function buscarQuery(q){
document.getElementById('results').innerHTML='<p style="text-align:center;color:#5a5750;padding:30px">🔍 Buscando en YouTube...</p>';

try{
// Usar DuckDuckGo para buscar en YouTube (no tiene CORS)
const searchUrl='https://duckduckgo.com/?q='+encodeURIComponent('site:youtube.com '+q+' canción oficial')+'&ia=web';
const proxyUrl='https://api.allorigins.win/raw?url='+encodeURIComponent(searchUrl);

const respuesta=await fetch(proxyUrl);
const html=await respuesta.text();

// Extraer URLs de YouTube del HTML
const matches=html.match(/youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/g)||[];
const ids=[...new Set(matches.map(m=>m.split('v=')[1]))].slice(0,15);

if(!ids.length){
// Plan B: abrir búsqueda directamente en YouTube
document.getElementById('results').innerHTML='<p style="text-align:center;color:#5a5750;padding:30px">⏳ Abriendo YouTube...</p>';
window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(q+' canción oficial'),'_blank');
return;
}

let html2='';
ids.forEach(id=>{
html2+='<div class="card" onclick="reproducir(\''+id+'\')">';
html2+='<img src="https://img.youtube.com/vi/'+id+'/hqdefault.jpg" loading="lazy" onerror="this.style.display=\\'none\\'">';
html2+='<div class="card-info">';
html2+='<div class="card-title">Video de YouTube</div>';
html2+='<div class="card-channel">youtube.com/watch?v='+id.substring(0,8)+'...</div>';
html2+='</div>';
html2+='</div>';
});

document.getElementById('results').innerHTML=html2;

}catch(error){
console.error('Error:',error);
// Fallback: abrir YouTube directamente
window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(q+' canción oficial'),'_blank');
document.getElementById('results').innerHTML='<p style="text-align:center;color:#5a5750;padding:30px">🔗 Abriendo YouTube...</p>';
}
}

function reproducir(id){
window.open('https://www.youtube.com/watch?v='+id,'_blank');
}
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(HTML);
    return;
  }
  
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end(HTML);
});

server.listen(PORT, () => {
  console.log('🎵 Espotifly en puerto', PORT);
});
