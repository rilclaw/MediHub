const http = require('http');
const postPatient = require('./postPatient');
const postRecord = require('./postRecord');

const PORT = 3100;

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    if (req.method === 'POST' && req.url === '/patients') {
        return postPatient(req, res);
    }

    if (req.method === 'POST' && req.url === '/records') {
        return postRecord(req, res);
    }

    res.writeHead(404);
    res.end(JSON.stringify({ message: 'Endpoint tidak ditemukan' }));
});

server.listen(PORT, () => {
    console.log(`Server MediHub berjalan di http://localhost:${PORT}`);
});
