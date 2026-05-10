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
button:active{background:#e8c99a}
.genres{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px}
.genre{background:rgba(201,169,110,.1);color:#c9a96e;padding:8px 15px;border-radius:20px;font-size:13px;cursor:pointer;border:1px solid rgba(201,169,110,.2)}
.genre:active{background:rgba(201,169,110,.3)}
.card{background:#13131a;border-radius:12px;margin-bottom:10px;display:flex;align-items:center;gap:12px;padding:12px;cursor:pointer;border:1px solid rgba(255,255,255,.05)}
.card:active{background:#1c1c27}
.card img{width:100px;height:56px;object-fit:cover;border-radius:6px;background:#1c1c27}
.card-info{flex:1;min-width:0}
.card-title{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px}
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
const texto=await respuesta.text();

console.log('Respuesta:',texto.substring(0,100));

let datos;
try{
datos=JSON.parse(texto);
}catch(e){
throw new Error('Error al procesar resultados');
}

if(!datos.length){
document.getElementById('results').innerHTML='<p style="text-align:center;color:#5a5750;padding:30px">😕 No se encontraron resultados<br><small>Prueba con otra búsqueda</small></p>';
return;
}

let html='';
datos.forEach(v=>{
html+='<div class="card" onclick="reproducir(\''+v.id+'\')">';
html+='<img src="'+v.thumb+'" alt="" loading="lazy" onerror="this.style.display=\\'none\\'">';
html+='<div class="card-info">';
html+='<div class="card-title">'+esc(v.title)+'</div>';
html+='<div class="card-channel">'+esc(v.channel)+'</div>';
html+='</div>';
html+='</div>';
});
document.getElementById('results').innerHTML=html;

}catch(error){
console.error('Error:',error);
document.getElementById('results').innerHTML='<p style="text-align:center;color:#e05c5c;padding:30px">❌ Error: '+error.message+'</p>';
}
}

function reproducir(id){
window.open('https://www.youtube.com/watch?v='+id,'_blank');
}

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
</script>
</body>
</html>`;

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
    
    console.log('Buscando:', query);
    
    // Método: Usar la API de suggest de Google (siempre funciona)
    const suggestUrl = 'https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=' + encodeURIComponent(query);
    
    https.get(suggestUrl, (suggestRes) => {
      let data = '';
      suggestRes.on('data', chunk => data += chunk);
      suggestRes.on('end', () => {
        try {
          // Parsear respuesta de Google Suggest
          const match = data.match(/\["([^"]+)",\[(.*?)\]\]/);
          const suggestions = match ? JSON.parse('[' + match[2] + ']') : [query];
          
          console.log('Sugerencias:', suggestions.length);
          
          // Buscar videos para cada sugerencia
          const allResults = [];
          let completed = 0;
          
          suggestions.slice(0, 3).forEach((suggestion, index) => {
            const searchUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(suggestion + ' cancion oficial');
            
            https.get(searchUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Mobile Safari/537.36',
                'Accept': 'text/html',
                'Accept-Language': 'es'
              }
            }, (ytRes) => {
              let html = '';
              ytRes.on('data', chunk => html += chunk);
              ytRes.on('end', () => {
                const ids = (html.match(/\/watch\?v=([A-Za-z0-9_-]{11})/g) || [])
                  .map(m => m.replace('/watch?v=', ''))
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .slice(0, 5);
                
                ids.forEach(id => {
                  if (!allResults.find(r => r.id === id)) {
                    allResults.push({
                      id: id,
                      title: suggestion + ' - YouTube',
                      channel: 'YouTube Music',
                      thumb: 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg'
                    });
                  }
                });
                
                completed++;
                
                if (completed === Math.min(suggestions.length, 3)) {
                  console.log('Total resultados:', allResults.length);
                  res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                  });
                  res.end(JSON.stringify(allResults.slice(0, 15)));
                }
              });
            }).on('error', () => {
              completed++;
              if (completed === Math.min(suggestions.length, 3)) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(allResults.slice(0, 15)));
              }
            });
          });
          
        } catch(e) {
          console.error('Error:', e);
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end('[]');
        }
      });
    }).on('error', (err) => {
      console.error('Error suggest:', err);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end('[]');
    });
    
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('🎵 Espotifly en puerto', PORT);
});
