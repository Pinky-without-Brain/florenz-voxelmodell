const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const webappDir = 'c:\\Users\\tomkl\\Desktop\\Cathedral of Santa Maria del Fiore\\webapp';
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(webappDir, reqPath === '/' ? 'index.html' : reqPath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };

  if (reqPath === '/' || reqPath === '/index.html') {
    let html = fs.readFileSync(filePath, 'utf8');
    const autoNavSnippet = `
    <script>
      window.addEventListener('load', () => {
        const p = new URLSearchParams(window.location.search);
        const action = p.get('action');
        setTimeout(() => {
          if (action === 'floor') {
            window.App.goToStep(14);
          } else if (action === 'nave') {
            const m1 = window.PROJECT_FLORENCE.modules.find(m => m.id === 'modul_1');
            window.App.selectModule(m1, true);
          } else if (action === 'facade') {
            const m2 = window.PROJECT_FLORENCE.modules.find(m => m.id === 'modul_2');
            window.App.selectModule(m2, true);
          } else if (action === 'tribunes') {
            const m3 = window.PROJECT_FLORENCE.modules.find(m => m.id === 'modul_3');
            window.App.selectModule(m3, true);
          } else if (action === 'tambour') {
            const m4 = window.PROJECT_FLORENCE.modules.find(m => m.id === 'modul_4');
            window.App.selectModule(m4, true);
            window.VoxelRenderer.moveCamera([-185, 230, 100], [-148, 160, 68], true);
          } else if (action === 'dome') {
            const m5 = window.PROJECT_FLORENCE.modules.find(m => m.id === 'modul_5');
            window.App.selectModule(m5, true);
            window.VoxelRenderer.setCameraView('iso');
          } else if (action === 'lantern') {
            const m6 = window.PROJECT_FLORENCE.modules.find(m => m.id === 'modul_6');
            window.App.selectModule(m6, true);
            window.VoxelRenderer.setCameraView('iso');
          } else if (action === 'campanile') {
            const m7 = window.PROJECT_FLORENCE.modules.find(m => m.id === 'modul_7');
            window.App.selectModule(m7, true);
            window.VoxelRenderer.setCameraView('iso');
          } else if (action === 'baptistery') {
            const m8 = window.PROJECT_FLORENCE.modules.find(m => m.id === 'modul_8');
            window.App.selectModule(m8, true);
            window.VoxelRenderer.setCameraView('iso');
          } else if (action === 'overview') {
            window.App.enterOverviewMode();
            window.VoxelRenderer.setCameraView('iso');
          }
        }, 600);
      });
    </script>
    `;
    html = html.replace('</body>', autoNavSnippet + '</body>');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
  res.end(fs.readFileSync(filePath));
});

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

function capture(url, outImg) {
  return new Promise((resolve) => {
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--window-size=1280,800',
      '--virtual-time-budget=3500',
      `--screenshot=${outImg}`,
      url
    ];
    const child = spawn(chromePath, args);
    child.on('close', resolve);
  });
}

server.listen(8095, async () => {
  console.log('Server running on http://localhost:8095');

  console.log('Capturing Overview...');
  await capture('http://localhost:8095/?action=overview', path.join(webappDir, 'shot_overview.png'));

  console.log('Capturing Dome...');
  await capture('http://localhost:8095/?action=dome', path.join(webappDir, 'shot_dome.png'));

  console.log('Capturing Campanile...');
  await capture('http://localhost:8095/?action=campanile', path.join(webappDir, 'shot_campanile.png'));

  console.log('Capturing Baptistery...');
  await capture('http://localhost:8095/?action=baptistery', path.join(webappDir, 'shot_baptistery.png'));

  console.log('ALL VIEWS CAPTURED!');
  server.close();
});
