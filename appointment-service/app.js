const express = require('express');
require('dotenv').config();

const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Routes
app.use('/api/appointments', appointmentRoutes);

app.listen(PORT, () => {
    console.log(`Appointments Service berjalan di http://localhost:${PORT}`);
});