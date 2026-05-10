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
.loading{text-align:center;color:#c9a96e}
</style>
</head>
<body>
<h1>♪ Espotifly</h1>
<input type="text" id="searchInput" placeholder="Buscar canción..." onkeypress="if(event.key==='Enter')buscar()">
<button onclick="buscar()">🔍 Buscar</button>
<div id="results"></div>

<script>
async function buscar(){
const q=document.getElementById('searchInput').value.trim();
if(!q)return;
document.getElementById('results').innerHTML='<p class="loading">Buscando...</p>';

try{
const respuesta=await fetch('/api?q='+encodeURIComponent(q));
const datos=await respuesta.json();
console.log('Resultados:',datos);

if(!datos.length){
document.getElementById('results').innerHTML='<p>Sin resultados</p>';
return;
}

let html='';
datos.forEach(v=>{
html+='<div class="card" onclick="window.open(\'https://youtube.com/watch?v='+v.id+'\',\'_blank\')">';
html+='<img src="'+v.thumb+'" alt="">';
html+='<div><b>'+v.title+'</b><br><small>'+v.channel+'</small></div>';
html+='</div>';
});
document.getElementById('results').innerHTML=html;

}catch(error){
console.error('Error:',error);
document.getElementById('results').innerHTML='<p style="color:red">Error: '+error.message+'</p>';
}
}
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  console.log('Petición:', req.url);
  
  if (req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(HTML);
    return;
  }
  
  if (req.url.startsWith('/api')) {
    const url = new URL(req.url, 'http://localhost:' + PORT);
    const query = url.searchParams.get('q');
    
    if (!query) {
      res.writeHead(400);
      res.end('[]');
      return;
    }
    
    console.log('Buscando:', query);
    
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent(query), {
      headers: {'User-Agent': 'Mozilla/5.0'}
    }, (ytRes) => {
      let data = '';
      ytRes.on('data', chunk => data += chunk);
      ytRes.on('end', () => {
        const ids = (data.match(/\/watch\?v=([A-Za-z0-9_-]{11})/g) || [])
          .map(m => m.replace('/watch?v=', ''))
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 10);
        
        const results = ids.map(id => ({
          id: id,
          title: 'Video de YouTube',
          channel: 'YouTube',
          thumb: 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg'
        }));
        
        console.log('Encontrados:', results.length);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(results));
      });
    }).on('error', (err) => {
      console.error('Error YouTube:', err);
      res.writeHead(500);
      res.end('[]');
    });
    
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('Espotifly en puerto ' + PORT);
});
