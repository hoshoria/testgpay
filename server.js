const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces de red

// Función para obtener la IP local
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Buscar IPv4 y no loopback
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, HOST, () => {
    const localIP = getLocalIP();

    console.log(`\n🚀 Servidor de pagos ejecutándose`);
    console.log(`\n📱 Acceso LOCAL (solo en esta computadora):`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`\n🌐 Acceso en RED (desde cualquier dispositivo en tu red local):`);
    console.log(`   http://${localIP}:${PORT}`);
    console.log(`\n💡 Comparte esta URL con otros dispositivos en la misma red WiFi:`);
    console.log(`   → http://${localIP}:${PORT}`);
    console.log(`\n💳 Características de la plataforma:`);
    console.log(`   ✓ Integración completa con Google Pay`);
    console.log(`   ✓ Formulario simplificado (3 campos)`);
    console.log(`   ✓ Validación en tiempo real`);
    console.log(`   ✓ Diseño premium con modo oscuro`);
    console.log(`   ✓ Accesible desde toda la red local`);
    console.log(`\n⚠️  Presiona Ctrl+C para detener el servidor\n`);
});
