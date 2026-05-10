const http = require('http');
const https = require('https');

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
.spinner{display:inline-block;width:20px;height:20px;border:2px solid #5a5750;border-top-color:#c9a96e;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
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
document.getElementById('results').innerHTML='<div class="loading"><div class="spinner"></div><p style="margin-top:10px">Buscando...</p></div>';

try{
const respuesta=await fetch('/api?q='+encodeURIComponent(q));
const datos=await respuesta.json();

if(!datos || !datos.length){
document.getElementById('results').innerHTML='<p style="text-align:center;color:#5a5750;padding:30px">😕 Sin resultados</p>';
return;
}

let html='';
datos.forEach(v=>{
html+='<div class="card" onclick="reproducir(\''+v.id+'\')">';
html+='<img src="'+v.thumb+'" loading="lazy" onerror="this.style.display=\\'none\\'">';
html+='<div class="card-info">';
html+='<div class="card-title">'+esc(v.title)+'</div>';
html+='<div class="card-channel">'+esc(v.channel)+'</div>';
html+='</div>';
html+='</div>';
});
document.getElementById('results').innerHTML=html;

}catch(error){
document.getElementById('results').innerHTML='<p style="text-align:center;color:#e05c5c;padding:30px">❌ Error al buscar</p>';
}
}

function reproducir(id){
window.open('https://www.youtube.com/watch?v='+id,'_blank');
}

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
</script>
</body>
</html>`;

// Lista de instancias de Invidious (alternativa libre a YouTube)
const INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.fdn.fr',
  'https://yewtu.be',
  'https://vid.puffyan.us',
  'https://invidious.privacydev.net',
  'https://iv.ggtyler.dev',
  'https://invidious.0011.lt'
];

async function searchInvidious(instance, query) {
  return new Promise((resolve, reject) => {
    const url = instance + '/api/v1/search?q=' + encodeURIComponent(query) + '&type=video&sort=relevance';
    console.log('Probando:', instance);
    
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (Array.isArray(results) && results.length > 0) {
            resolve(results);
          } else {
            reject('Sin resultados');
          }
        } catch (e) {
          reject('Error parseando');
        }
      });
    }).on('error', reject)
      .on('timeout', () => reject('Timeout'));
  });
}

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);
  
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(HTML);
    return;
  }
  
  if (req.url.startsWith('/api')) {
    const urlObj = new URL(req.url, 'http://localhost:' + PORT);
    const query = urlObj.searchParams.get('q');
    
    if (!query) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end('[]');
      return;
    }
    
    console.log('🔍 Buscando:', query);
    
    // Intentar con cada instancia de Invidious
    let triedInstances = 0;
    let allResults = [];
    
    async function tryNextInstance() {
      if (triedInstances >= INSTANCES.length) {
        // Si ninguna instancia funcionó, devolver resultados vacíos
        console.log('❌ Ninguna instancia disponible');
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(allResults));
        return;
      }
      
      const instance = INSTANCES[triedInstances];
      triedInstances++;
      
      try {
        const results = await searchInvidious(instance, query);
        console.log('✅ Resultados de:', instance, '-', results.length, 'videos');
        
        const formatted = results
          .filter(item => item.type === 'video' && item.videoId)
          .slice(0, 15)
          .map(item => ({
            id: item.videoId,
            title: item.title || 'Sin título',
            channel: item.author || 'YouTube',
            thumb: item.videoThumbnails?.[0]?.url || 
                   'https://img.youtube.com/vi/' + item.videoId + '/hqdefault.jpg'
          }));
        
        if (formatted.length > 0) {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify(formatted));
        } else {
          tryNextInstance();
        }
      } catch (err) {
        console.log('❌ Falló:', instance, err);
        tryNextInstance();
      }
    }
    
    tryNextInstance();
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('🎵 Espotifly en puerto', PORT);
  console.log('📡 Usando Invidious API (alternativa libre)');
});
