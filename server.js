const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Espotifly</title>
<style>
body{background:#0a0a0f;color:#fff;font-family:sans-serif;margin:0;padding:20px}
input{padding:10px;width:70%;border-radius:20px;border:none;font-size:16px}
button{padding:10px 20px;background:#c9a96e;border:none;border-radius:20px;color:#000;font-weight:bold;cursor:pointer}
.card{background:#1a1a2e;margin:10px 0;padding:15px;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:10px}
.card img{width:120px;height:68px;object-fit:cover;border-radius:5px}
.card:hover{background:#2a2a3e}
</style>
</head>
<body>
<h1>♪ Espotifly</h1>
<input type="text" id="searchInput" placeholder="Buscar canción...">
<button onclick="buscar()">🔍 Buscar</button>
<div id="results"></div>

<script>
async function buscar(){
const q=document.getElementById('searchInput').value.trim();
if(!q)return;
document.getElementById('results').innerHTML='<p>Buscando...</p>';

// Usar URL relativa
const url='/api?q='+encodeURIComponent(q);
console.log('🔍 Buscando en:',window.location.origin+url);

try{
const respuesta=await fetch(url);
console.log('📡 Respuesta:',respuesta.status);

if(!respuesta.ok){
throw new Error('Error del servidor: '+respuesta.status);
}

const datos=await respuesta.json();
console.log('✅ Datos recibidos:',datos.length,'videos');

if(!datos.length){
document.getElementById('results').innerHTML='<p>Sin resultados para: '+q+'</p>';
return;
}

let html='';
datos.forEach(v=>{
html+='<div class="card" onclick="window.open(\'https://youtube.com/watch?v='+v.id+'\',\'_blank\')" style="cursor:pointer">';
html+='<img src="'+v.thumb+'" alt="" onerror="this.src=\\'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%2768%27%3E%3Crect fill=%27%23333%27 width=%27120%27 height=%2768%27/%3E%3C/svg%3E\\'">';
html+='<div><b>'+v.title+'</b><br><small>'+v.channel+'</small></div>';
html+='</div>';
});
document.getElementById('results').innerHTML=html;

}catch(error){
console.error('❌ Error:',error);
document.getElementById('results').innerHTML='<p style="color:red">Error: '+error.message+'</p>';
}
}
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  // Log detallado
  console.log('📥 ' + req.method + ' ' + req.url);
  
  // Página principal
  if (req.url === '/' || req.url === '/index.html') {
    console.log('✅ Sirviendo página principal');
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(HTML);
    return;
  }
  
  // API de búsqueda
  if (req.url.startsWith('/api')) {
    try {
      const urlObj = new URL(req.url, 'http://localhost:' + PORT);
      const query = urlObj.searchParams.get('q');
      
      console.log('🔎 Query:', query);
      
      if (!query) {
        console.log('❌ Query vacía');
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify([]));
        return;
      }
      
      const searchUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query + ' cancion');
      console.log('🌐 Buscando en YouTube:', searchUrl);
      
      https.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'es'
        }
      }, (ytRes) => {
        console.log('📡 YouTube respondió:', ytRes.statusCode);
        
        let data = '';
        ytRes.on('data', chunk => data += chunk);
        ytRes.on('end', () => {
          // Extraer IDs
          const matches = data.match(/\/watch\?v=([A-Za-z0-9_-]{11})/g) || [];
          const ids = [...new Set(matches.map(m => m.replace('/watch?v=', '')))].slice(0, 10);
          
          console.log('🎯 IDs encontrados:', ids.length);
          
          const results = ids.map(id => ({
            id: id,
            title: 'Video de YouTube',
            channel: 'YouTube Music',
            thumb: 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg'
          }));
          
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify(results));
        });
      }).on('error', (err) => {
        console.error('💥 Error YouTube:', err.message);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify([]));
      });
      
    } catch(err) {
      console.error('💥 Error API:', err);
      res.writeHead(500);
      res.end('[]');
    }
    return;
  }
  
  // 404 para otras rutas
  console.log('❌ 404:', req.url);
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('404 - Ruta no encontrada: ' + req.url);
});

server.listen(PORT, () => {
  console.log('🎵 Espotifly listo en http://localhost:' + PORT);
  console.log('📋 Esperando peticiones...');
});

// Manejar errores globales
process.on('uncaughtException', (err) => {
  console.error('🔥 Error fatal:', err);
});
