const express = require('express');
const doctorRoutes = require('./routes/doctorRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Routes
app.use('/api/doctors', doctorRoutes);

app.listen(PORT, () => {
    console.log(`Doctor Service berjalan di http://localhost:${PORT}`);
});