const express = require('express');
const recordRoutes = require('./routes/recordRoutes');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3002; 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use('/api/records', recordRoutes); 


app.listen(PORT, () => {
    console.log(`Medical Record Service berjalan di http://localhost:${PORT}`);
});