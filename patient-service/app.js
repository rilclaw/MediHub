// ni dh pke express biar smua endpoint nya jd 1 file di patientRoutes.js
const express = require('express');
// Import dotenv untuk membaca PORT dan konfigurasi lain dari .env
require('dotenv').config(); 
// Import routes yang sudah kita buat (routes/patientRoutes.js)
const patientRoutes = require('./routes/patientRoutes'); 

const app = express();
// Menggunakan PORT 3001 dari .env atau 3001 default
const PORT = process.env.PORT || 3001; 

// Middleware
// 1. Middleware untuk parsing body JSON dari request (Pengganti logika 'data' dan 'end' di http server)
app.use(express.json()); 

// 2. CORS Headers (Penting untuk komunikasi antar layanan di port berbeda)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); 
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


app.use('/api/patients', patientRoutes);

app.listen(PORT, () => {
    console.log(`Patient Service berjalan di http://localhost:${PORT}`);
});